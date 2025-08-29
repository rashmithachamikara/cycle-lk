import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  Bike, 
  ArrowLeft, 
  Camera, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { bikeService, BikeData, BikeType, BikeCondition } from '../services/bikeService';

const EditBikePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'city' as BikeType,
    pricePerDay: '',
    pricePerWeek: '',
    pricePerMonth: '',
    location: '',
    currentPartnerName: '',
    description: '',
    features: [''] as string[],
    specifications: {
      frameSize: '',
      gears: '',
      weight: '',
      ageRestriction: '',
      maxLoad: ''
    },
    availability: true,
    images: [] as File[],
    existingImages: [] as string[],
    condition: 'good' as BikeCondition // default value
  });

  const bikeTypes = [
    { id: 'city', name: 'City Bike' },
    { id: 'mountain', name: 'Mountain Bike' },
    { id: 'road', name: 'Road Bike' },
    { id: 'hybrid', name: 'Hybrid Bike' },
    { id: 'electric', name: 'Electric Bike' },
    { id: 'touring', name: 'Touring Bike' },
    { id: 'folding', name: 'Folding Bike' },
    { id: 'cruiser', name: 'Cruiser' }
  ];
  // Simulate fetching bike data from API
  useEffect(() => {
    const fetchBikeData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const bikeData = await bikeService.getBikeById(id);
        
        setFormData(prev => ({
          ...prev,
          name: bikeData.name,
          type: bikeData.type,
          pricePerDay: bikeData.pricing.perDay.toString(),
          pricePerWeek: bikeData.pricing.perWeek?.toString() || '',
          pricePerMonth: bikeData.pricing.perMonth?.toString() || '',
          location: bikeData.location || '',
          currentPartnerName: typeof bikeData.currentPartnerId === 'object' 
            ? bikeData.currentPartnerId.companyName 
            : 'Unknown Partner',
          description: bikeData.description || '',
          features: bikeData.features || [''],
          specifications: {
            frameSize: bikeData.specifications?.frameSize || '',
            gears: bikeData.specifications?.gears || '',
            weight: bikeData.specifications?.weight || '',
            ageRestriction: bikeData.specifications?.ageRestriction || '',
            maxLoad: bikeData.specifications?.maxLoad || ''
          },
          availability: bikeData.availability?.status === 'available',
          existingImages: bikeData.images?.map(img => img.url) || [],
          condition: bikeData.condition || 'good',
        }));
        
      } catch (error) {
        console.error('Error fetching bike data:', error);
        setFormErrors(['Failed to load bike data. Please try again.']);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBikeData();
  }, [id]);
  // Handle text input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parentProp, childProp] = name.split('.');
      setFormData(prev => {
        if (parentProp === 'specifications') {
          return {
            ...prev,
            specifications: {
              ...prev.specifications,
              [childProp]: value
            }
          };
        }
        return prev;
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle feature changes
  const handleFeatureChange = (index: number, value: string) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures[index] = value;
    setFormData(prev => ({ ...prev, features: updatedFeatures }));
  };

  // Add new feature field
  const addFeature = () => {
    setFormData(prev => ({ 
      ...prev, 
      features: [...prev.features, '']
    }));
  };

  // Remove feature field
  const removeFeature = (index: number) => {
    const updatedFeatures = formData.features.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, features: updatedFeatures }));
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files);
      setFormData(prev => ({ 
        ...prev, 
        images: [...prev.images, ...newImages]
      }));
    }
  };

  // Remove a new image
  const removeImage = (index: number) => {
    const updatedImages = formData.images.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, images: updatedImages }));
  };

  // Remove an existing image
  const removeExistingImage = (index: number) => {
    const updatedExistingImages = formData.existingImages.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, existingImages: updatedExistingImages }));
  };

  // Validate form before submission
  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.name) errors.push("Bike name is required");
    if (!formData.pricePerDay) errors.push("Daily price is required");
    if (!formData.location) errors.push("Location is required");
    if (!formData.description) errors.push("Description is required");
    if (formData.images.length === 0 && formData.existingImages.length === 0) errors.push("At least one image is required");
    if (!formData.condition) errors.push("Condition is required");
    
    return errors;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm();
    
    if (errors.length > 0) {
      setFormErrors(errors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    if (!id) return;
    
    setIsSubmitting(true);
    setFormErrors([]);
    
    try {
      // Prepare the bike data for update
      const updateData: Partial<BikeData> = {
        name: formData.name,
        type: formData.type,
        pricing: {
          perDay: parseFloat(formData.pricePerDay),
          perWeek: formData.pricePerWeek ? parseFloat(formData.pricePerWeek) : undefined,
          perMonth: formData.pricePerMonth ? parseFloat(formData.pricePerMonth) : undefined,
        },
        description: formData.description,
        features: formData.features.filter(f => f.trim() !== ''),
        specifications: formData.specifications,
        condition: formData.condition,
      };
      
      // Update bike data
      await bikeService.updateBike(id, updateData);
      
      // Upload new images if any
      if (formData.images.length > 0) {
        await bikeService.uploadBikeImages(id, formData.images);
      }
      
      // Update availability
      await bikeService.updateBikeAvailability(
        id, 
        formData.availability ? 'available' : 'unavailable',
        formData.availability ? '' : 'Temporarily unavailable'
      );
      
      setSubmitSuccess(true);
      
      // Redirect to partner dashboard after successful submission
      setTimeout(() => {
        navigate('/partner-dashboard/inventory');
      }, 2000);
      
    } catch (error) {
      console.error('Error updating bike:', error);
      setFormErrors(['Failed to update bike. Please try again.']);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle bike deletion
  const handleDeleteBike = async () => {
    if (!id) return;
    
    setIsDeleting(true);
    try {
      await bikeService.deleteBike(id);
      navigate('/partner-dashboard/inventory');
    } catch (error) {
      console.error('Error deleting bike:', error);
      setFormErrors(['Failed to delete bike. Please try again.']);
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-medium text-gray-700">Loading bike details...</h2>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <Link
          to="/partner-dashboard/inventory"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Inventory
        </Link>

        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          <div className="flex items-center mb-6">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Bike className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">Edit Bike</h1>
              <p className="text-gray-600">Update the details for this bike in your inventory</p>
            </div>
          </div>

          {/* Success Message */}
          {submitSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-green-800 font-medium">Changes saved successfully!</h3>
                <p className="text-green-700 text-sm">Your bike information has been updated.</p>
              </div>
            </div>
          )}

          {/* Error Messages */}
          {formErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-red-800 font-medium">There are errors in your submission</h3>
                  <ul className="text-red-700 text-sm list-disc list-inside mt-1">
                    {formErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
                    Bike Name*
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. City Cruiser Premium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="type">
                    Bike Type*
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {bikeTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="location">
                    Location*
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location + " - " + formData.currentPartnerName}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                    placeholder="Current shop location"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pricing*
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500 mb-1">Per Day</span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                        <input
                          type="number"
                          name="pricePerDay"
                          value={formData.pricePerDay}
                          onChange={handleChange}
                          className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="15"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500 mb-1">Per Week</span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                        <input
                          type="number"
                          name="pricePerWeek"
                          value={formData.pricePerWeek}
                          onChange={handleChange}
                          className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="70"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500 mb-1">Per Month</span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                        <input
                          type="number"
                          name="pricePerMonth"
                          value={formData.pricePerMonth}
                          onChange={handleChange}
                          className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="200"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
                    Description*
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe the bike, its condition, and best uses..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="condition">
                    Condition*
                  </label>
                  <select
                    id="condition"
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Bike Images*
                  </label>
                  
                  {/* Existing images */}
                  {formData.existingImages.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-2">Existing Images</p>
                      <div className="grid grid-cols-3 gap-3">
                        {formData.existingImages.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={image}
                              alt={`Bike image ${index + 1}`}
                              className="h-24 w-full object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeExistingImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Upload new images */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      id="images"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    <label htmlFor="images" className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <Camera className="h-10 w-10 text-gray-400" />
                        <p className="text-sm text-gray-500 mt-2">Click to upload additional images</p>
                        <p className="text-xs text-gray-400">PNG, JPG, GIF up to 5MB</p>
                      </div>
                    </label>
                  </div>

                  {/* Preview new images */}
                  {formData.images.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-2">New Images</p>
                      <div className="grid grid-cols-3 gap-3">
                        {formData.images.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Bike preview ${index + 1}`}
                              className="h-20 w-full object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Features
                  </label>
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. Front basket"
                      />
                      {formData.features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFeature}
                    className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Feature
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specifications
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Frame Size
                      </label>
                      <input
                        type="text"
                        name="specifications.frameSize"
                        value={formData.specifications.frameSize}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. Medium (54cm)"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Gears
                      </label>
                      <input
                        type="text"
                        name="specifications.gears"
                        value={formData.specifications.gears}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. 18 speed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Weight
                      </label>
                      <input
                        type="text"
                        name="specifications.weight"
                        value={formData.specifications.weight}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. 12kg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Age Restriction
                      </label>
                      <input
                        type="text"
                        name="specifications.ageRestriction"
                        value={formData.specifications.ageRestriction}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. 16+ years"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="availability"
                      checked={formData.availability}
                      onChange={() => setFormData(prev => ({ ...prev, availability: !prev.availability }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="availability" className="ml-2 block text-sm text-gray-700">
                      Available for booking immediately
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 flex justify-between">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100"
              >
                Delete Bike
              </button>
              <div className="flex space-x-4">
                <Link
                  to="/partner-dashboard/inventory"
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center ${
                    isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this bike? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBike}
                disabled={isDeleting}
                className={`px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 flex items-center ${
                  isDeleting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete Bike'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default EditBikePage;

