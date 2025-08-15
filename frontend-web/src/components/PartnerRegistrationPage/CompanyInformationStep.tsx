// frontend-web/components/PartnerRegistrationPage/CompanyInformationStep.tsx
import React, { useRef } from 'react';
import { Building, Tag, FileText, MapPin, Camera, Upload, X, Image as ImageIcon } from 'lucide-react';
import ServiceLocationManager from './ServiceLocationManager';
import { type StepProps, type ImageFile } from './types';
import { BUSINESS_CATEGORIES } from './constants';

const CompanyInformationStep: React.FC<StepProps> = ({
  formData,
  onInputChange,
  onServiceCitiesChange,
  onServiceLocationsChange,
  onImageChange,
  isUserAuthenticated
}) => {
  // File input refs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const storefrontInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Helper function to create preview URL
  const createImagePreview = (file: File): string => {
    return URL.createObjectURL(file);
  };

  // Helper function to validate image file
  const validateImageFile = (file: File): string | null => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (!allowedTypes.includes(file.type)) {
      return 'Please upload only JPEG, PNG, or WebP images';
    }
    
    if (file.size > maxSize) {
      return 'Image size should be less than 5MB';
    }
    
    return null;
  };

  // Handle logo image selection
  const handleLogoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const error = validateImageFile(file);
    if (error) {
      alert(error);
      return;
    }

    // Clean up previous preview
    if (formData.logoImage?.preview) {
      URL.revokeObjectURL(formData.logoImage.preview);
    }

    const imageFile: ImageFile = {
      file,
      preview: createImagePreview(file)
    };

    onImageChange?.('logo', imageFile);
  };

  // Handle storefront image selection
  const handleStorefrontSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const error = validateImageFile(file);
    if (error) {
      alert(error);
      return;
    }

    // Clean up previous preview
    if (formData.storefrontImage?.preview) {
      URL.revokeObjectURL(formData.storefrontImage.preview);
    }

    const imageFile: ImageFile = {
      file,
      preview: createImagePreview(file)
    };

    onImageChange?.('storefront', imageFile);
  };

  // Handle gallery images selection
  const handleGallerySelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const newImages: ImageFile[] = [];
    let hasError = false;

    for (const file of files) {
      const error = validateImageFile(file);
      if (error) {
        alert(error);
        hasError = true;
        break;
      }

      newImages.push({
        file,
        preview: createImagePreview(file)
      });
    }

    const currentGallery = formData.galleryImages || [];
    
    if (!hasError && currentGallery.length + newImages.length <= 10) {
      const updatedGallery = [...currentGallery, ...newImages];
      onImageChange?.('gallery', updatedGallery);
    } else if (currentGallery.length + newImages.length > 10) {
      alert('You can upload maximum 10 gallery images');
    }

    // Reset input
    if (galleryInputRef.current) {
      galleryInputRef.current.value = '';
    }
  };

  // Remove logo image
  const removeLogo = () => {
    if (formData.logoImage?.preview) {
      URL.revokeObjectURL(formData.logoImage.preview);
    }
    onImageChange?.('logo', null);
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  // Remove storefront image
  const removeStorefront = () => {
    if (formData.storefrontImage?.preview) {
      URL.revokeObjectURL(formData.storefrontImage.preview);
    }
    onImageChange?.('storefront', null);
    if (storefrontInputRef.current) {
      storefrontInputRef.current.value = '';
    }
  };

  // Remove gallery image
  const removeGalleryImage = (index: number) => {
    const currentGallery = formData.galleryImages || [];
    const newGallery = [...currentGallery];
    const imageToRemove = newGallery[index];
    
    if (imageToRemove?.preview) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    
    newGallery.splice(index, 1);
    onImageChange?.('gallery', newGallery);
  };

  // Get current images from formData
  const logoImage = formData.logoImage;
  const storefrontImage = formData.storefrontImage;
  const galleryImages = formData.galleryImages || [];

  return (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <Building className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Company Information</h2>
        <p className="text-gray-600">Tell us about your business and where you operate</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Company Name */}
        <div className="md:col-span-2">
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
            Company Name *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Building className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={onInputChange}
              placeholder="Enter your company name"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
        </div>

        {/* Business Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Business Category *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Tag className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={onInputChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            >
              <option value="">Select a category</option>
              {BUSINESS_CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Years Active */}
        <div>
          <label htmlFor="yearsActive" className="block text-sm font-medium text-gray-700 mb-2">
            Years in Business
          </label>
          <input
            type="number"
            id="yearsActive"
            name="yearsActive"
            value={formData.yearsActive}
            onChange={onInputChange}
            min="0"
            max="100"
            placeholder="0"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Business Description
          </label>
          <div className="relative">
            <div className="absolute top-3 left-0 pl-3 flex items-center pointer-events-none">
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={onInputChange}
              rows={4}
              placeholder="Describe your business, services, and what makes you unique..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            This description will be shown to customers on your profile
          </p>
        </div>
      </div>

      {/* Images Section */}
      <div className="border-t border-gray-200 pt-8">
        <div className="flex items-center mb-6">
          <Camera className="h-6 w-6 text-emerald-600 mr-2" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Business Images</h3>
            <p className="text-sm text-gray-600">Add images to showcase your business</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Company Logo
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              {logoImage ? (
                <div className="relative inline-block">
                  <img
                    src={logoImage.preview}
                    alt="Logo preview"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => logoInputRef.current?.click()}
                  className="flex flex-col items-center justify-center py-8 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Click to upload logo</p>
                  <p className="text-xs text-gray-500">PNG, JPG, WebP up to 5MB</p>
                </div>
              )}
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Storefront Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Storefront Image *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              {storefrontImage ? (
                <div className="relative inline-block">
                  <img
                    src={storefrontImage.preview}
                    alt="Storefront preview"
                    className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removeStorefront}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => storefrontInputRef.current?.click()}
                  className="flex flex-col items-center justify-center py-12 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Click to upload storefront image</p>
                  <p className="text-xs text-gray-500">PNG, JPG, WebP up to 5MB</p>
                  <p className="text-xs text-red-500 mt-1">* Required</p>
                </div>
              )}
              <input
                ref={storefrontInputRef}
                type="file"
                accept="image/*"
                onChange={handleStorefrontSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Gallery Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Gallery Images
              <span className="text-xs text-gray-500 ml-2">
                ({galleryImages.length}/10 images)
              </span>
            </label>
            
            {/* Gallery Grid */}
            {galleryImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {galleryImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image.preview}
                      alt={`Gallery image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(index)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 text-xs"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Area */}
            {galleryImages.length < 10 && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div
                  onClick={() => galleryInputRef.current?.click()}
                  className="flex flex-col items-center justify-center py-8 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Click to add gallery images</p>
                  <p className="text-xs text-gray-500">PNG, JPG, WebP up to 5MB each</p>
                  <p className="text-xs text-gray-500">Select multiple files at once</p>
                </div>
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGallerySelect}
                  className="hidden"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Service Locations */}
      <div className="border-t border-gray-200 pt-8">
        <div className="flex items-center mb-6">
          <MapPin className="h-6 w-6 text-emerald-600 mr-2" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Service Locations</h3>
            <p className="text-sm text-gray-600">Add the cities and specific locations where you provide services</p>
          </div>
        </div>

        <ServiceLocationManager
          serviceCities={formData.serviceCities}
          serviceLocations={formData.serviceLocations}
          onServiceCitiesChange={onServiceCitiesChange}
          onServiceLocationsChange={onServiceLocationsChange}
        />
      </div>

      {/* Validation Summary */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <div className="flex items-start">
          <FileText className="h-5 w-5 text-emerald-600 mt-0.5 mr-2 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-emerald-800 mb-1">Required Information:</p>
            <ul className="text-emerald-700 space-y-1">
              <li className={`flex items-center ${formData.companyName ? 'line-through opacity-60' : ''}`}>
                • Company name
              </li>
              <li className={`flex items-center ${formData.category ? 'line-through opacity-60' : ''}`}>
                • Business category
              </li>
              <li className={`flex items-center ${storefrontImage ? 'line-through opacity-60' : ''}`}>
                • Storefront image
              </li>
              <li className={`flex items-center ${formData.serviceCities.length > 0 ? 'line-through opacity-60' : ''}`}>
                • At least one service city
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyInformationStep;