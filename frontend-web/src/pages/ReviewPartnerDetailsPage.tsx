import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { partnerService, Partner } from '../services/partnerService';
import {
  ArrowLeft,
  MapPin,
  User,
  Phone,
  Mail,
  Clock,
  Star,
  Building,
  Bike,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Globe,
  Camera,
  FileText,
  Loader,
  Image as ImageIcon
} from 'lucide-react';

const ReviewPartnerDetailsPage = () => {
  const { partnerId } = useParams<{ partnerId: string }>();
  const navigate = useNavigate();
  
  const [partner, setPartner] = useState<Partner | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [approvalNote, setApprovalNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (partnerId) {
      fetchPartnerDetails();
    }
  }, [partnerId]);

  const fetchPartnerDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const partnerData = await partnerService.getPartnerById(partnerId!);
      setPartner(partnerData);
    } catch (error) {
      console.error('Error fetching partner details:', error);
      setError('Failed to load partner details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!partner) return;
    
    try {
      setIsProcessing(true);
      await partnerService.updatePartner(partner._id, {
        status: 'active',
        verified: true
      });
      
      // Navigate back to admin dashboard with partners tab
      navigate('/admin-dashboard?tab=partners');
    } catch (error) {
      console.error('Error approving partner:', error);
      setError('Failed to approve partner');
    } finally {
      setIsProcessing(false);
      setShowApprovalForm(false);
    }
  };

  const handleReject = async () => {
    if (!partner) return;
    
    try {
      setIsProcessing(true);
      await partnerService.updatePartner(partner._id, {
        status: 'inactive'
      });
      
      // Navigate back to admin dashboard with partners tab
      navigate('/admin-dashboard?tab=partners');
    } catch (error) {
      console.error('Error rejecting partner:', error);
      setError('Failed to reject partner');
    } finally {
      setIsProcessing(false);
      setShowRejectionForm(false);
    }
  };

  const getPartnerLocation = (partner: Partner): string => {
    if (typeof partner.location === 'object' && partner.location?.name) {
      return partner.location.name;
    }
    return partner.address || partner.location as string || 'Location not specified';
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleImageError = (imageId: string) => {
    setImageErrors(prev => new Set(prev).add(imageId));
  };

  const isImageError = (imageId: string): boolean => {
    return imageErrors.has(imageId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <Loader className="h-8 w-8 text-purple-600 animate-spin" />
            <span className="ml-2 text-gray-600">Loading partner details...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Partner</h2>
            <p className="text-gray-600 mb-6">{error || 'Partner not found'}</p>
            <button
              onClick={() => navigate('/admin-dashboard?tab=partners')}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Back to Partners
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/admin-dashboard?tab=partners')}
              className="flex items-center text-gray-600 hover:text-purple-600 mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to Partners
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Partner Review</h1>
              <p className="text-gray-600">Review and approve partner application</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setShowRejectionForm(true)}
              disabled={isProcessing}
              className="flex items-center bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              <XCircle className="h-5 w-5 mr-2" />
              Reject
            </button>
            <button
              onClick={() => setShowApprovalForm(true)}
              disabled={isProcessing}
              className="flex items-center bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Approve
            </button>
          </div>
        </div>

        {/* Status Banner */}
        <div className={`rounded-xl p-6 mb-8 ${
          partner.status === 'pending' 
            ? 'bg-yellow-50 border-l-4 border-yellow-400'
            : partner.status === 'active'
            ? 'bg-green-50 border-l-4 border-green-400'
            : 'bg-red-50 border-l-4 border-red-400'
        }`}>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${
              partner.status === 'pending' ? 'bg-yellow-500' :
              partner.status === 'active' ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <h3 className="text-lg font-semibold text-gray-900">
              Application Status: {partner.status?.charAt(0).toUpperCase() + partner.status?.slice(1)}
            </h3>
          </div>
          <p className="text-gray-600 mt-2">
            Applied on {formatDate(partner.createdAt)}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Company Information */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Company Information</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                  <div className="flex items-center">
                    <Building className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-lg font-semibold text-gray-900">{partner.companyName}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <span className="text-gray-900">{partner.category || 'Bike Rental'}</span>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <p className="text-gray-900">{partner.description || 'No description provided'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Years Active</label>
                  <span className="text-gray-900">{partner.yearsActive || 'Not specified'} years</span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bike Count</label>
                  <div className="flex items-center">
                    <Bike className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-900">{partner.bikeCount || 'Not specified'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Location & Contact */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Location & Contact</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900">{getPartnerLocation(partner)}</div>
                      {partner.address && (
                        <div className="text-sm text-gray-600 mt-1">{partner.address}</div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-900">{partner.contactPerson || 'Not specified'}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-900">{partner.phone || 'Not provided'}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-900">{partner.email || 'Not provided'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Services & Features */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Services & Features</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Specialties</label>
                  {partner.specialties && partner.specialties.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {partner.specialties.map((specialty, index) => (
                        <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-500">No specialties specified</span>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Features</label>
                  {partner.features && partner.features.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {partner.features.map((feature, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {feature}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-500">No features specified</span>
                  )}
                </div>
              </div>
            </div>

            {/* Business Hours */}
            {partner.businessHours && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Business Hours</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(partner.businessHours).map(([day, hours]) => (
                    <div key={day} className="flex items-center justify-between py-2">
                      <span className="capitalize font-medium text-gray-900">{day}</span>
                      <span className="text-gray-600">
                        {hours.open && hours.close ? `${hours.open} - ${hours.close}` : 'Closed'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Images */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Images</h3>
              
              {!partner.images || (!partner.images.logo && !partner.images.storefront && (!partner.images.gallery || partner.images.gallery.length === 0)) ? (
                <div className="text-center py-8 text-gray-500">
                  <ImageIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>No images uploaded</p>
                </div>
              ) : (
                <>
                  <div className="grid md:grid-cols-2 gap-6">
                    {partner.images.logo && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                        <div className="relative">
                          {isImageError(`logo-${partner._id}`) ? (
                            <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                              <div className="text-center text-gray-500">
                                <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                                <p className="text-sm">Image not available</p>
                              </div>
                            </div>
                          ) : (
                            <img
                              src={partner.images.logo.url}
                              alt="Company Logo"
                              className="w-full h-48 object-cover rounded-lg"
                              onError={() => handleImageError(`logo-${partner._id}`)}
                              onLoad={() => console.log('Logo loaded successfully')}
                            />
                          )}
                        </div>
                      </div>
                    )}
                    
                    {partner.images.storefront && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Storefront</label>
                        <div className="relative">
                          {isImageError(`storefront-${partner._id}`) ? (
                            <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                              <div className="text-center text-gray-500">
                                <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                                <p className="text-sm">Image not available</p>
                              </div>
                            </div>
                          ) : (
                            <img
                              src={partner.images.storefront.url}
                              alt="Storefront"
                              className="w-full h-48 object-cover rounded-lg"
                              onError={() => handleImageError(`storefront-${partner._id}`)}
                              onLoad={() => console.log('Storefront loaded successfully')}
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {partner.images.gallery && partner.images.gallery.length > 0 && (
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">Gallery ({partner.images.gallery.length} images)</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {partner.images.gallery.map((image, index) => (
                          <div key={index} className="relative">
                            {isImageError(`gallery-${partner._id}-${index}`) ? (
                              <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                                <div className="text-center text-gray-500">
                                  <ImageIcon className="h-8 w-8 mx-auto mb-1" />
                                  <p className="text-xs">Image {index + 1}</p>
                                </div>
                              </div>
                            ) : (
                              <img
                                src={image.url}
                                alt={`Gallery ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg"
                                onError={() => handleImageError(`gallery-${partner._id}-${index}`)}
                                onLoad={() => console.log(`Gallery image ${index + 1} loaded successfully`)}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => setShowApprovalForm(true)}
                  className="w-full flex items-center justify-center bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Approve Partner
                </button>
                
                <button
                  onClick={() => setShowRejectionForm(true)}
                  className="w-full flex items-center justify-center bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-colors"
                >
                  <XCircle className="h-5 w-5 mr-2" />
                  Reject Application
                </button>
                
                <button
                  onClick={() => navigate(`/partners/${partner._id}`)}
                  className="w-full flex items-center justify-center border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:border-purple-500 hover:text-purple-600 transition-colors"
                >
                  <Globe className="h-5 w-5 mr-2" />
                  View Public Profile
                </button>
              </div>
            </div>

            {/* Application Summary */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Summary</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Application ID</span>
                  <span className="font-medium">{partner._id.slice(-8)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Submitted</span>
                  <span className="font-medium">{formatDate(partner.createdAt)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    partner.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    partner.status === 'active' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {partner.status?.charAt(0).toUpperCase() + partner.status?.slice(1)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Verified</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    partner.verified ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {partner.verified ? 'Verified' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Approve Partner Application</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to approve this partner application? This will activate their account and allow them to list bikes.
            </p>
            
            <textarea
              value={approvalNote}
              onChange={(e) => setApprovalNote(e.target.value)}
              placeholder="Optional approval note..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none mb-4"
              rows={3}
            />
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowApprovalForm(false)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:border-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={isProcessing}
                className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isProcessing ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  'Approve'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Partner Application</h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting this application. This will help the applicant understand what needs to be improved.
            </p>
            
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Reason for rejection..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none mb-4"
              rows={4}
              required
            />
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowRejectionForm(false)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:border-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isProcessing || !rejectionReason.trim()}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isProcessing ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  'Reject'
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

export default ReviewPartnerDetailsPage;
