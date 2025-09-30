//frontend-web/src/pages/ProfilePage.tsx
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  User, 
  CreditCard,
  Bell,
  Shield,
  Edit3,
  Save,
  X,
  CheckCircle,
  Settings,
  Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { userService, veriffService } from '../services/authService';

// Declare Veriff types
declare global {
  interface Window {
    Veriff: any;
    veriffSDK: any;
  }
}

const ProfilePage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    const tabParam = searchParams.get('tab');
    return tabParam || 'profile';
  });
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    dateOfBirth: '',
    nationality: '',
    address: '',
    emergencyContact: '',
    emergencyName: '',
    isVerified: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [veriffLoaded, setVeriffLoaded] = useState(false);
  const veriffContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        try {
          setLoading(true);
          setError(null);
          const userData = await userService.getUserById(user.id);
          setProfileData({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            phone: userData.phone || '',
            role: userData.role || '',
            dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : '',
            nationality: userData.nationality || '',
            address: userData.address || '',
            emergencyName: userData.emergencyContact?.name || '',
            emergencyContact: userData.emergencyContact?.phone || '',
            isVerified: userData.verificationStatus?.idDocument?.isVerified || false
          });
        } catch (err) {
          setError('Failed to fetch profile data. Please try again.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  // Update active tab when URL parameters change
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Load Veriff scripts
  useEffect(() => {
    const loadVeriffScripts = () => {
      // Load Veriff SDK
      const sdkScript = document.createElement('script');
      sdkScript.src = 'https://cdn.veriff.me/sdk/js/1.5/veriff.min.js';
      sdkScript.async = true;

      // Load Veriff InContext
      const inContextScript = document.createElement('script');
      inContextScript.src = 'https://cdn.veriff.me/incontext/js/v1/veriff.js';
      inContextScript.async = true;

      sdkScript.onload = () => {
        inContextScript.onload = () => {
          setVeriffLoaded(true);
        };
        document.body.appendChild(inContextScript);
      };

      document.body.appendChild(sdkScript);

      return () => {
        document.body.removeChild(sdkScript);
        document.body.removeChild(inContextScript);
      };
    };

    loadVeriffScripts();
  }, []);


// Frontend: Update your initializeVeriff function

const initializeVeriff = async () => {
  if (!veriffLoaded || !window.Veriff) {
    console.error('Veriff SDK not loaded');
    return;
  }

  if (!user?.id) {
    console.error('User not logged in');
    return;
  }

  try {
    // 1. Create session via backend
    const sessionData = await veriffService.createSession(user.id);
    console.log('Session created:', sessionData);

    if (!sessionData.url) {
      console.error('No URL in session data:', sessionData);
      return;
    }

    // 2. Initialize Veriff SDK
    const veriff = window.Veriff({
      host: 'https://stationapi.veriff.com',
      apiKey: '9660b80b-798a-47b1-bb28-a4cb0bc3b98d',
      parentId: 'veriff-root',
      onSession: function (err: any) {
        if (err) {
          console.error('Veriff session error:', err);
          return;
        }

        // 3. Create verification frame with the URL from our backend
        window.veriffSDK.createVeriffFrame({
          url: sessionData.url, // Use the URL from the earlier backend response
          onEvent: function(msg: string) {
            console.log('Veriff event:', msg);
            
            // When user completes the flow
            if (msg === 'FINISHED') {
              console.log('Verification flow completed, checking status...');
              
              // Poll for status updates (since webhook doesn't work)
              pollVerificationStatus();
            }
          }
        });
      },
    });

    veriff.setParams({
      vendorData: user.id,
    });

    veriff.mount();

  } catch (err) {
    console.error('Failed to initialize Veriff:', err);
  }
};

// Add this new function to poll verification status
const pollVerificationStatus = async () => {
  if (!user?.id) return;

  let attempts = 0;
  const maxAttempts = 12; // Try for ~2 minutes (12 attempts * 10 seconds)
  
  const checkStatus = async () => {
    try {
      console.log(`Checking verification status (attempt ${attempts + 1}/${maxAttempts})...`);
      
      const response = await veriffService.checkStatus(user.id)

      if (!response.ok) {
        throw new Error('Failed to check status');
      }

      const data = await response.json();
      console.log('Verification status:', data);

      if (data.status === 'approved') {
        console.log('Verification approved!');
        // Update UI
        await checkVerificationStatus();
        return true; // Stop polling
      } else if (data.status === 'declined' || data.status === 'rejected') {
        console.log('Verification declined');
        await checkVerificationStatus();
        return true; // Stop polling
      } else if (data.status === 'pending' || data.status === 'submitted') {
        // Still processing, continue polling
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 10000); // Check again in 10 seconds
        } else {
          console.log('Max polling attempts reached. Please check back later.');
          await checkVerificationStatus();
        }
        return false;
      }
      
    } catch (err) {
      console.error('Error checking verification status:', err);
      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(checkStatus, 10000);
      }
      return false;
    }
  };

  // Start polling after a 5-second delay (give Veriff time to process)
  setTimeout(checkStatus, 5000);
};

// Update your checkVerificationStatus function
const checkVerificationStatus = async () => {
  if (user?.id) {
    try {
      const userData = await userService.getUserById(user.id);
      setProfileData(prev => ({
        ...prev,
        isVerified: userData.verificationStatus?.idDocument?.isVerified || false
      }));
      console.log('Profile updated. isVerified:', userData.verificationStatus?.idDocument?.isVerified);
    } catch (err) {
      console.error('Failed to refresh verification status', err);
    }
  }
};

  interface NotificationSettings {
    bookingUpdates: boolean;
    promotions: boolean;
    partnerNews: boolean;
    smsNotifications: boolean;
    emailDigest: boolean;
  }

  const [notifications, setNotifications] = useState<NotificationSettings>({
    bookingUpdates: true,
    promotions: false,
    partnerNews: true,
    smsNotifications: false,
    emailDigest: true
  });

  const [paymentMethods] = useState([
    {
      id: 1,
      type: 'Visa',
      last4: '4242',
      expiry: '12/26',
      isDefault: true
    },
    {
      id: 2,
      type: 'Mastercard',
      last4: '8888',
      expiry: '09/25',
      isDefault: false
    }
  ]);

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    
    const updatedData = {
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      email: profileData.email,
      phone: profileData.phone,
      role: profileData.role,
      dateOfBirth: profileData.dateOfBirth,
      nationality: profileData.nationality,
      address: profileData.address,
      emergencyContact: profileData.emergencyContact,
    };

    try {
      await userService.updateProfile(user.id, updatedData);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile", err);
    }
  };

  const handleNotificationChange = (key: keyof NotificationSettings) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{profileData.firstName} {profileData.lastName}</h3>
                <p className="text-gray-600">{profileData.email}</p>
               <div className="flex items-center justify-center mt-2">
                      {profileData.isVerified ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-sm text-green-600">Verified Account</span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-500">Not Verified</span>
                      )}
                    </div>

              </div>

              <nav className="space-y-2">
                {[
                  { id: 'profile', label: 'Profile Information', icon: User },
                  { id: 'security', label: 'Security', icon: Shield },
                  { id: 'payments', label: 'Payment Methods', icon: CreditCard },
                  { id: 'notifications', label: 'Notifications', icon: Bell },
                  { id: 'preferences', label: 'Preferences', icon: Settings }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === item.id
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Information */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
                    <span className="inline-block mt-2 px-3 py-1 text-sm font-medium bg-emerald-100 text-emerald-800 rounded-full">
                      {profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1)}
                    </span>
                  </div>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex space-x-3">
                      <button
                        onClick={handleSaveProfile}
                        className="flex items-center bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex items-center border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:border-gray-400 transition-colors"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {loading ? (
                  <p>Loading profile...</p>
                ) : error ? (
                  <p className="text-red-500">{error}</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none disabled:bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none disabled:bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none disabled:bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none disabled:bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                      <input
                        type="date"
                        value={profileData.dateOfBirth}
                        onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none disabled:bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                      <input
                        type="text"
                        value={profileData.nationality}
                        onChange={(e) => setProfileData(prev => ({ ...prev, nationality: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none disabled:bg-gray-50"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <input
                        type="text"
                        value={profileData.address}
                        onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none disabled:bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Name</label>
                      <input
                        type="text"
                        value={profileData.emergencyName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, emergencyName: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none disabled:bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Number</label>
                      <input
                        type="tel"
                        value={profileData.emergencyContact}
                        onChange={(e) => setProfileData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none disabled:bg-gray-50"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Security */}
            {activeTab === 'security' && (
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Security Settings</h2>

                <div className="space-y-8">
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Password</h3>
                        <p className="text-gray-600">Last updated 3 months ago</p>
                      </div>
                      <button className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors">
                        Change Password
                      </button>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
                        <p className="text-gray-600">Add an extra layer of security to your account</p>
                      </div>
                      <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:border-emerald-500 transition-colors">
                        Enable 2FA
                      </button>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Identity Verification</h3>
                        <p className="text-gray-600">Verify your identity to unlock premium features</p>
                      </div>
                      <button 
                        onClick={initializeVeriff}
                        disabled={!veriffLoaded}
                        className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        {veriffLoaded ? 'Start Verification' : 'Loading...'}
                      </button>
                    </div>
                    <div id="veriff-root" ref={veriffContainerRef} className="mt-4"></div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Login Sessions</h3>
                        <p className="text-gray-600">Manage your active login sessions</p>
                      </div>
                      <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:border-emerald-500 transition-colors">
                        View Sessions
                      </button>
                    </div>
                  </div>

                  <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-red-900">Delete Account</h3>
                        <p className="text-red-700">Permanently delete your account and all data</p>
                      </div>
                      <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Methods */}
            {activeTab === 'payments' && (
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Payment Methods</h2>
                  <button className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors">
                    Add New Card
                  </button>
                </div>

                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-12 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center mr-4">
                            <CreditCard className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {method.type} ending in {method.last4}
                            </div>
                            <div className="text-gray-600">Expires {method.expiry}</div>
                            {method.isDefault && (
                              <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-medium">
                                Default
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:border-emerald-500 transition-colors text-sm">
                            Edit
                          </button>
                          <button className="border border-red-300 text-red-700 px-3 py-2 rounded-lg hover:border-red-500 transition-colors text-sm">
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Notification Preferences</h2>

                <div className="space-y-6">
                  {([
                    {
                      key: 'bookingUpdates' as keyof NotificationSettings,
                      title: 'Booking Updates',
                      description: 'Get notified about booking confirmations, changes, and reminders'
                    },
                    {
                      key: 'promotions' as keyof NotificationSettings,
                      title: 'Promotions & Offers',
                      description: 'Receive special offers and promotional deals'
                    },
                    {
                      key: 'partnerNews' as keyof NotificationSettings,
                      title: 'Partner News',
                      description: 'Updates from our partner bike rental shops'
                    },
                    {
                      key: 'smsNotifications' as keyof NotificationSettings,
                      title: 'SMS Notifications',
                      description: 'Receive important updates via SMS'
                    },
                    {
                      key: 'emailDigest' as keyof NotificationSettings,
                      title: 'Weekly Email Digest',
                      description: 'Weekly summary of your activity and recommendations'
                    }
                  ] as const).map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.title}</h3>
                        <p className="text-gray-600 text-sm">{item.description}</p>
                      </div>
                      <button
                        onClick={() => handleNotificationChange(item.key)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notifications[item.key]
                            ? 'bg-emerald-500'
                            : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notifications[item.key]
                              ? 'translate-x-6'
                              : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preferences */}
            {activeTab === 'preferences' && (
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Preferences</h2>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Language & Region</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                        <select className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none">
                          <option>English</option>
                          <option>Sinhala</option>
                          <option>Tamil</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                        <select className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none">
                          <option>USD - US Dollar</option>
                          <option>LKR - Sri Lankan Rupee</option>
                          <option>EUR - Euro</option>
                          <option>GBP - British Pound</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Bike Preferences</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Bike Type</label>
                        <select className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none">
                          <option>No Preference</option>
                          <option>Hybrid</option>
                          <option>Mountain Bike</option>
                          <option>City Bike</option>
                          <option>Beach Cruiser</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Riding Experience</label>
                        <select className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none">
                          <option>Beginner</option>
                          <option>Intermediate</option>
                          <option>Advanced</option>
                          <option>Expert</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Profile Visibility</h4>
                          <p className="text-gray-600 text-sm">Allow other users to see your profile</p>
                        </div>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                          <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Activity Sharing</h4>
                          <p className="text-gray-600 text-sm">Share your cycling activities with the community</p>
                        </div>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-500">
                          <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProfilePage;