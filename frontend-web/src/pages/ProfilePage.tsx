//frontend-web/src/pages/ProfilePage.tsx
import { useState, useEffect } from 'react';
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
import { userService } from '../services/authService';

const ProfilePage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
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
    emergencyName: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      emergencyContact: profileData.emergencyContact, // send as string
      // If you want to send emergencyName, add a separate field if supported by backend
    };

    try {
      await userService.updateProfile(user.id, updatedData);
      setIsEditing(false);
      // Optionally show a success message
    } catch (err) {
      console.error("Failed to update profile", err);
      // Optionally show an error message
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
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">Verified Account</span>
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


// import { useState, useEffect } from 'react';
// import Header from '../components/Header';
// import Footer from '../components/Footer';
// import {
//   User,
//   Calendar,
//   CreditCard,
//   Bell,
//   Shield,
//   Edit3,
//   Save,
//   X,
//   CheckCircle,
//   Settings,
//   Trash2,
//   MapPin,
//   Phone,
//   Mail,
//   Globe
// } from 'lucide-react';
// import { useAuth } from '../contexts/AuthContext';
// import { userService } from '../services/authService';

// const ProfilePage = () => {
//   const { user } = useAuth();
//   const [activeTab, setActiveTab] = useState('profile');
//   const [isEditing, setIsEditing] = useState(false);
//   const [profileData, setProfileData] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     phone: '',
//     role: '',
//     dateOfBirth: '',
//     nationality: '',
//     address: '',
//     emergencyContact: '',
//     emergencyName: ''
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchUserProfile = async () => {
//       if (user?.id) {
//         try {
//           setLoading(true);
//           setError(null);
//           const userData = await userService.getUserById(user.id);
//           setProfileData({
//             firstName: userData.firstName || '',
//             lastName: userData.lastName || '',
//             email: userData.email || '',
//             phone: userData.phone || '',
//             role: userData.role || '',
//             dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : '',
//             nationality: userData.nationality || '',
//             address: userData.address || '',
//             emergencyName: userData.emergencyContact?.name || '',
//             emergencyContact: userData.emergencyContact?.phone || '',
//           });
//         } catch (err) {
//           setError('Failed to fetch profile data. Please try again.');
//           console.error(err);
//         } finally {
//           setLoading(false);
//         }
//       }
//     };

//     fetchUserProfile();
//   }, [user]);

//   const [notifications, setNotifications] = useState({
//     bookingUpdates: true,
//     promotions: false,
//     partnerNews: true,
//     smsNotifications: false,
//     emailDigest: true
//   });

//   const [paymentMethods] = useState([
//     {
//       id: 1,
//       type: 'Visa',
//       last4: '4242',
//       expiry: '12/26',
//       isDefault: true
//     },
//     {
//       id: 2,
//       type: 'Mastercard',
//       last4: '8888',
//       expiry: '09/25',
//       isDefault: false
//     }
//   ]);

//   const handleSaveProfile = async () => {
//     if (!user?.id) return;

//     const updatedData = {
//       firstName: profileData.firstName,
//       lastName: profileData.lastName,
//       email: profileData.email,
//       phone: profileData.phone,
//       role: profileData.role,
//       dateOfBirth: profileData.dateOfBirth,
//       nationality: profileData.nationality,
//       address: profileData.address,
//       emergencyContact: profileData.emergencyContact,
//     };

//     try {
//       await userService.updateProfile(user.id, updatedData);
//       setIsEditing(false);
//     } catch (err) {
//       console.error("Failed to update profile", err);
//     }
//   };

//   const handleNotificationChange = (key: string) => {
//     setNotifications(prev => ({
//       ...prev,
//       [key]: !prev[key]
//     }));
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
//       <Header />
      
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
//         <div className="grid lg:grid-cols-4 gap-8">
//           {/* Sidebar */}
//           <div className="lg:col-span-1">
//             <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 sticky top-24 transition-all duration-300 hover:shadow-2xl">
//               <div className="text-center mb-8">
//                 <div className="relative w-24 h-24 mx-auto mb-6">
//                   <div className="w-full h-full bg-gradient-to-br from-[#1E90FF] via-[#00D4AA] to-teal-400 rounded-full flex items-center justify-center shadow-xl transform transition-transform duration-300 hover:scale-105">
//                     <User className="h-12 w-12 text-white" />
//                   </div>
//                   <div className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
//                     <CheckCircle className="h-4 w-4 text-white" />
//                   </div>
//                 </div>
//                 <h3 className="text-xl font-bold text-gray-900 mb-1">
//                   {profileData.firstName} {profileData.lastName}
//                 </h3>
//                 <p className="text-gray-600 mb-3">{profileData.email}</p>
//                 <div className="inline-flex items-center bg-gradient-to-r from-emerald-100 to-teal-100 px-4 py-2 rounded-full border border-emerald-200">
//                   <CheckCircle className="h-4 w-4 text-emerald-600 mr-2" />
//                   <span className="text-sm font-medium text-emerald-700">Verified Account</span>
//                 </div>
//               </div>

//               <nav className="space-y-3">
//                 {[
//                   { id: 'profile', label: 'Profile Information', icon: User, gradient: 'from-blue-500 to-blue-600' },
//                   { id: 'security', label: 'Security', icon: Shield, gradient: 'from-purple-500 to-purple-600' },
//                   { id: 'payments', label: 'Payment Methods', icon: CreditCard, gradient: 'from-emerald-500 to-emerald-600' },
//                   { id: 'notifications', label: 'Notifications', icon: Bell, gradient: 'from-orange-500 to-orange-600' },
//                   { id: 'preferences', label: 'Preferences', icon: Settings, gradient: 'from-teal-500 to-teal-600' }
//                 ].map((item) => (
//                   <button
//                     key={item.id}
//                     onClick={() => setActiveTab(item.id)}
//                     className={`group w-full flex items-center px-6 py-4 rounded-2xl text-left transition-all duration-300 transform hover:scale-105 ${
//                       activeTab === item.id
//                         ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
//                         : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 hover:shadow-md'
//                     }`}
//                   >
//                     <div className={`p-2 rounded-lg mr-4 transition-all duration-300 ${
//                       activeTab === item.id 
//                         ? 'bg-white/20' 
//                         : `bg-gradient-to-r ${item.gradient} text-white group-hover:scale-110`
//                     }`}>
//                       <item.icon className="h-4 w-4" />
//                     </div>
//                     <span className="font-medium">{item.label}</span>
//                   </button>
//                 ))}
//               </nav>
//             </div>
//           </div>

//           {/* Main Content */}
//           <div className="lg:col-span-3">
//             {/* Profile Information */}
//             {activeTab === 'profile' && (
//               <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 transition-all duration-300 hover:shadow-2xl">
//                 <div className="flex items-center justify-between mb-8">
//                   <div>
//                     <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
//                       Profile Information
//                     </h2>
//                     <div className="inline-block px-4 py-2 bg-gradient-to-r from-[#1E90FF] to-[#00D4AA] rounded-full">
//                       <span className="text-sm font-semibold text-white">
//                         {profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1)}
//                       </span>
//                     </div>
//                   </div>
//                   {!isEditing ? (
//                     <button
//                       onClick={() => setIsEditing(true)}
//                       className="flex items-center bg-gradient-to-r from-[#1E90FF] to-[#00D4AA] text-white px-6 py-3 rounded-2xl hover:from-blue-600 hover:to-teal-500 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium"
//                     >
//                       <Edit3 className="h-4 w-4 mr-2" />
//                       Edit Profile
//                     </button>
//                   ) : (
//                     <div className="flex space-x-3">
//                       <button
//                         onClick={handleSaveProfile}
//                         className="flex items-center bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-2xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium"
//                       >
//                         <Save className="h-4 w-4 mr-2" />
//                         Save Changes
//                       </button>
//                       <button
//                         onClick={() => setIsEditing(false)}
//                         className="flex items-center border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-2xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 font-medium"
//                       >
//                         <X className="h-4 w-4 mr-2" />
//                         Cancel
//                       </button>
//                     </div>
//                   )}
//                 </div>

//                 {loading ? (
//                   <div className="text-center py-12">
//                     <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
//                     <p className="text-gray-600">Loading profile...</p>
//                   </div>
//                 ) : error ? (
//                   <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
//                     <p className="text-red-700 font-medium">{error}</p>
//                   </div>
//                 ) : (
//                   <div className="grid md:grid-cols-2 gap-6">
//                     {/* Form fields with enhanced styling */}
//                     <div className="group">
//                       <label className=" text-sm font-semibold text-gray-700 mb-3 flex items-center">
//                         <User className="h-4 w-4 mr-2 text-blue-500" />
//                         First Name
//                       </label>
//                       <input
//                         type="text"
//                         value={profileData.firstName}
//                         onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
//                         disabled={!isEditing}
//                         className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 focus:border-blue-500 focus:outline-none disabled:bg-gray-50 transition-all duration-300 group-hover:border-gray-300"
//                       />
//                     </div>

//                     <div className="group">
//                       <label className=" text-sm font-semibold text-gray-700 mb-3 flex items-center">
//                         <User className="h-4 w-4 mr-2 text-blue-500" />
//                         Last Name
//                       </label>
//                       <input
//                         type="text"
//                         value={profileData.lastName}
//                         onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
//                         disabled={!isEditing}
//                         className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 focus:border-blue-500 focus:outline-none disabled:bg-gray-50 transition-all duration-300 group-hover:border-gray-300"
//                       />
//                     </div>

//                     <div className="group">
//                       <label className=" text-sm font-semibold text-gray-700 mb-3 flex items-center">
//                         <Mail className="h-4 w-4 mr-2 text-emerald-500" />
//                         Email Address
//                       </label>
//                       <input
//                         type="email"
//                         value={profileData.email}
//                         onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
//                         disabled={!isEditing}
//                         className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 focus:border-emerald-500 focus:outline-none disabled:bg-gray-50 transition-all duration-300 group-hover:border-gray-300"
//                       />
//                     </div>

//                     <div className="group">
//                       <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
//                         <Phone className="h-4 w-4 mr-2 text-purple-500" />
//                         Phone Number
//                       </label>
//                       <input
//                         type="tel"
//                         value={profileData.phone}
//                         onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
//                         disabled={!isEditing}
//                         className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 focus:border-purple-500 focus:outline-none disabled:bg-gray-50 transition-all duration-300 group-hover:border-gray-300"
//                       />
//                     </div>

//                     <div className="group">
//                       <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
//                         <Calendar className="h-4 w-4 mr-2 text-orange-500" />
//                         Date of Birth
//                       </label>
//                       <input
//                         type="date"
//                         value={profileData.dateOfBirth}
//                         onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
//                         disabled={!isEditing}
//                         className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 focus:border-orange-500 focus:outline-none disabled:bg-gray-50 transition-all duration-300 group-hover:border-gray-300"
//                       />
//                     </div>

//                     <div className="group">
//                       <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
//                         <Globe className="h-4 w-4 mr-2 text-teal-500" />
//                         Nationality
//                       </label>
//                       <input
//                         type="text"
//                         value={profileData.nationality}
//                         onChange={(e) => setProfileData(prev => ({ ...prev, nationality: e.target.value }))}
//                         disabled={!isEditing}
//                         className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 focus:border-teal-500 focus:outline-none disabled:bg-gray-50 transition-all duration-300 group-hover:border-gray-300"
//                       />
//                     </div>

//                     <div className="md:col-span-2 group">
//                       <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
//                         <MapPin className="h-4 w-4 mr-2 text-red-500" />
//                         Address
//                       </label>
//                       <input
//                         type="text"
//                         value={profileData.address}
//                         onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
//                         disabled={!isEditing}
//                         className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 focus:border-red-500 focus:outline-none disabled:bg-gray-50 transition-all duration-300 group-hover:border-gray-300"
//                       />
//                     </div>

//                     <div className="group">
//                       <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
//                         <User className="h-4 w-4 mr-2 text-indigo-500" />
//                         Emergency Contact Name
//                       </label>
//                       <input
//                         type="text"
//                         value={profileData.emergencyName}
//                         onChange={(e) => setProfileData(prev => ({ ...prev, emergencyName: e.target.value }))}
//                         disabled={!isEditing}
//                         className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 focus:border-indigo-500 focus:outline-none disabled:bg-gray-50 transition-all duration-300 group-hover:border-gray-300"
//                       />
//                     </div>

//                     <div className="group">
//                       <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
//                         <Phone className="h-4 w-4 mr-2 text-pink-500" />
//                         Emergency Contact Number
//                       </label>
//                       <input
//                         type="tel"
//                         value={profileData.emergencyContact}
//                         onChange={(e) => setProfileData(prev => ({ ...prev, emergencyContact: e.target.value }))}
//                         disabled={!isEditing}
//                         className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 focus:border-pink-500 focus:outline-none disabled:bg-gray-50 transition-all duration-300 group-hover:border-gray-300"
//                       />
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* Security Tab */}
//             {activeTab === 'security' && (
//               <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 transition-all duration-300 hover:shadow-2xl">
//                 <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-8">
//                   Security Settings
//                 </h2>

//                 <div className="space-y-6">
//                   {[
//                     {
//                       title: 'Password',
//                       description: 'Last updated 3 months ago',
//                       buttonText: 'Change Password',
//                       buttonClass: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700',
//                       icon: Shield
//                     },
//                     {
//                       title: 'Two-Factor Authentication',
//                       description: 'Add an extra layer of security to your account',
//                       buttonText: 'Enable 2FA',
//                       buttonClass: 'border-2 border-purple-500 text-purple-600 hover:bg-purple-50',
//                       icon: Shield
//                     },
//                     {
//                       title: 'Login Sessions',
//                       description: 'Manage your active login sessions',
//                       buttonText: 'View Sessions',
//                       buttonClass: 'border-2 border-gray-300 text-gray-700 hover:border-purple-500 hover:text-purple-600',
//                       icon: Settings
//                     }
//                   ].map((item, index) => (
//                     <div key={index} className="group border-2 border-gray-100 rounded-2xl p-6 transition-all duration-300 hover:border-purple-200 hover:shadow-lg hover:bg-gradient-to-r hover:from-white hover:to-purple-50">
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center">
//                           <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl mr-4 group-hover:scale-110 transition-transform duration-300">
//                             <item.icon className="h-6 w-6 text-purple-600" />
//                           </div>
//                           <div>
//                             <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
//                             <p className="text-gray-600">{item.description}</p>
//                           </div>
//                         </div>
//                         <button className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 shadow-md ${item.buttonClass}`}>
//                           {item.buttonText}
//                         </button>
//                       </div>
//                     </div>
//                   ))}

//                   <div className="group border-2 border-red-200 rounded-2xl p-6 bg-gradient-to-r from-red-50 to-pink-50 transition-all duration-300 hover:border-red-300 hover:shadow-lg">
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center">
//                         <div className="p-3 bg-gradient-to-r from-red-100 to-pink-100 rounded-2xl mr-4 group-hover:scale-110 transition-transform duration-300">
//                           <Trash2 className="h-6 w-6 text-red-600" />
//                         </div>
//                         <div>
//                           <h3 className="text-lg font-semibold text-red-900">Delete Account</h3>
//                           <p className="text-red-700">Permanently delete your account and all data</p>
//                         </div>
//                       </div>
//                       <button className="flex items-center bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium">
//                         <Trash2 className="h-4 w-4 mr-2" />
//                         Delete Account
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Payment Methods Tab */}
//             {activeTab === 'payments' && (
//               <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 transition-all duration-300 hover:shadow-2xl">
//                 <div className="flex items-center justify-between mb-8">
//                   <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
//                     Payment Methods
//                   </h2>
//                   <button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-2xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium">
//                     Add New Card
//                   </button>
//                 </div>

//                 <div className="space-y-6">
//                   {paymentMethods.map((method) => (
//                     <div key={method.id} className="group border-2 border-gray-100 rounded-2xl p-6 transition-all duration-300 hover:border-emerald-200 hover:shadow-lg hover:bg-gradient-to-r hover:from-white hover:to-emerald-50">
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center">
//                           <div className="w-16 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
//                             <CreditCard className="h-6 w-6 text-white" />
//                           </div>
//                           <div>
//                             <div className="font-semibold text-gray-900 text-lg">
//                               {method.type} ending in {method.last4}
//                             </div>
//                             <div className="text-gray-600 mb-2">Expires {method.expiry}</div>
//                             {method.isDefault && (
//                               <span className="inline-block bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-semibold border border-emerald-200">
//                                 Default
//                               </span>
//                             )}
//                           </div>
//                         </div>
//                         <div className="flex space-x-3">
//                           <button className="border-2 border-gray-300 text-gray-700 px-4 py-2 rounded-xl hover:border-emerald-500 hover:text-emerald-600 transition-all duration-300 font-medium">
//                             Edit
//                           </button>
//                           <button className="border-2 border-red-300 text-red-700 px-4 py-2 rounded-xl hover:border-red-500 hover:text-red-600 transition-all duration-300 font-medium">
//                             Remove
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Notifications Tab */}
//             {activeTab === 'notifications' && (
//               <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 transition-all duration-300 hover:shadow-2xl">
//                 <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-8">
//                   Notification Preferences
//                 </h2>

//                 <div className="space-y-6">
//                   {[
//                     {
//                       key: 'bookingUpdates',
//                       title: 'Booking Updates',
//                       description: 'Get notified about booking confirmations, changes, and reminders',
//                       icon: Bell
//                     },
//                     {
//                       key: 'promotions',
//                       title: 'Promotions & Offers',
//                       description: 'Receive special offers and promotional deals',
//                       icon: Settings
//                     },
//                     {
//                       key: 'partnerNews',
//                       title: 'Partner News',
//                       description: 'Updates from our partner bike rental shops',
//                       icon: Globe
//                     },
//                     {
//                       key: 'smsNotifications',
//                       title: 'SMS Notifications',
//                       description: 'Receive important updates via SMS',
//                       icon: Phone
//                     },
//                     {
//                       key: 'emailDigest',
//                       title: 'Weekly Email Digest',
//                       description: 'Weekly summary of your activity and recommendations',
//                       icon: Mail
//                     }
//                   ].map((item) => (
//                     <div key={item.key} className="group flex items-center justify-between py-6 px-6 border-2 border-gray-100 rounded-2xl transition-all duration-300 hover:border-orange-200 hover:shadow-lg hover:bg-gradient-to-r hover:from-white hover:to-orange-50">
//                       <div className="flex items-center">
//                         <div className="p-3 bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl mr-4 group-hover:scale-110 transition-transform duration-300">
//                           <item.icon className="h-6 w-6 text-orange-600" />
//                         </div>
//                         <div>
//                           <h3 className="font-semibold text-gray-900 text-lg">{item.title}</h3>
//                           <p className="text-gray-600">{item.description}</p>
//                         </div>
//                       </div>
//                       <button
//                         onClick={() => handleNotificationChange(item.key)}
//                         className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 transform hover:scale-105 ${
//                           notifications[item.key as keyof typeof notifications]
//                             ? 'bg-gradient-to-r from-orange-500 to-red-500 shadow-lg'
//                             : 'bg-gray-300'
//                         }`}
//                       >
//                         <span
//                           className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 shadow-lg ${
//                             notifications[item.key as keyof typeof notifications]
//                               ? 'translate-x-7'
//                               : 'translate-x-1'
//                           }`}
//                         />
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Preferences Tab */}
//             {activeTab === 'preferences' && (
//               <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 transition-all duration-300 hover:shadow-2xl">
//                 <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-8">
//                   Preferences
//                 </h2>

//                 <div className="space-y-8">
//                   <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-2xl p-6">
//                     <h3 className="text-xl font-semibold text-teal-900 mb-6 flex items-center">
//                       <Globe className="h-6 w-6 mr-3 text-teal-600" />
//                       Language & Region
//                     </h3>
//                     <div className="grid md:grid-cols-2 gap-6">
//                       <div className="group">
//                         <label className="block text-sm font-semibold text-gray-700 mb-3">Language</label>
//                         <select className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 focus:border-teal-500 focus:outline-none transition-all duration-300 group-hover:border-gray-300 bg-white">
//                           <option>English</option>
//                           <option>Sinhala</option>
//                           <option>Tamil</option>
//                         </select>
//                       </div>
//                       <div className="group">
//                         <label className="block text-sm font-semibold text-gray-700 mb-3">Currency</label>
//                         <select className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 focus:border-teal-500 focus:outline-none transition-all duration-300 group-hover:border-gray-300 bg-white">
//                           <option>USD - US Dollar</option>
//                           <option>LKR - Sri Lankan Rupee</option>
//                           <option>EUR - Euro</option>
//                           <option>GBP - British Pound</option>
//                         </select>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6">
//                     <h3 className="text-xl font-semibold text-blue-900 mb-6 flex items-center">
//                       <User className="h-6 w-6 mr-3 text-blue-600" />
//                       Bike Preferences
//                     </h3>
//                     <div className="grid md:grid-cols-2 gap-6">
//                       <div className="group">
//                         <label className="block text-sm font-semibold text-gray-700 mb-3">Preferred Bike Type</label>
//                         <select className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 focus:border-blue-500 focus:outline-none transition-all duration-300 group-hover:border-gray-300 bg-white">
//                           <option>No Preference</option>
//                           <option>Hybrid</option>
//                           <option>Mountain Bike</option>
//                           <option>City Bike</option>
//                           <option>Beach Cruiser</option>
//                         </select>
//                       </div>
//                       <div className="group">
//                         <label className="block text-sm font-semibold text-gray-700 mb-3">Riding Experience</label>
//                         <select className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 focus:border-blue-500 focus:outline-none transition-all duration-300 group-hover:border-gray-300 bg-white">
//                           <option>Beginner</option>
//                           <option>Intermediate</option>
//                           <option>Advanced</option>
//                           <option>Expert</option>
//                         </select>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6">
//                     <h3 className="text-xl font-semibold text-purple-900 mb-6 flex items-center">
//                       <Shield className="h-6 w-6 mr-3 text-purple-600" />
//                       Privacy Settings
//                     </h3>
//                     <div className="space-y-6">
//                       <div className="flex items-center justify-between py-4 px-6 bg-white/60 rounded-2xl border border-purple-100 transition-all duration-300 hover:bg-white/80 hover:shadow-md">
//                         <div className="flex items-center">
//                           <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl mr-4">
//                             <User className="h-5 w-5 text-purple-600" />
//                           </div>
//                           <div>
//                             <h4 className="font-semibold text-gray-900">Profile Visibility</h4>
//                             <p className="text-gray-600 text-sm">Allow other users to see your profile</p>
//                           </div>
//                         </div>
//                         <button className="relative inline-flex h-8 w-14 items-center rounded-full bg-gray-300 transition-all duration-300 hover:scale-105">
//                           <span className="inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 shadow-lg translate-x-1" />
//                         </button>
//                       </div>
                      
//                       <div className="flex items-center justify-between py-4 px-6 bg-white/60 rounded-2xl border border-purple-100 transition-all duration-300 hover:bg-white/80 hover:shadow-md">
//                         <div className="flex items-center">
//                           <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl mr-4">
//                             <Globe className="h-5 w-5 text-purple-600" />
//                           </div>
//                           <div>
//                             <h4 className="font-semibold text-gray-900">Activity Sharing</h4>
//                             <p className="text-gray-600 text-sm">Share your cycling activities with the community</p>
//                           </div>
//                         </div>
//                         <button className="relative inline-flex h-8 w-14 items-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 hover:scale-105 shadow-lg">
//                           <span className="inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 shadow-lg translate-x-7" />
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       <Footer />
//     </div>
//   );
// };

// export default ProfilePage;