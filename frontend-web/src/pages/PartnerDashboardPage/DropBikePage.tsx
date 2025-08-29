import { useState, useEffect } from "react";
import { Search, Camera, CheckCircle, CreditCard, FileText, Bike as BikeIcon, ArrowLeft, Clock } from 'lucide-react';
import Header from "../../components/Header";
import { Loader } from "../../ui";
import { Link } from "react-router-dom";
import { bookingService, PartnerDashboardBooking } from "../../services/bookingService";
import toast from 'react-hot-toast';

interface BikeCondition {
  item: string;
  condition: 'excellent' | 'good' | 'fair' | 'damaged';
  notes: string;
}

interface AdditionalCharge {
  type: 'damage' | 'cleaning' | 'late_return' | 'fuel' | 'other';
  description: string;
  amount: number;
}

interface DropOffData {
  bookingId: string;
  customerSignature: string;
  bikeCondition: BikeCondition[];
  additionalCharges: AdditionalCharge[];
  totalAdditionalAmount: number;
  notes: string;
  photos: File[];
}

const DropBikePage = () => {
  const [activeBookings, setActiveBookings] = useState<PartnerDashboardBooking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<PartnerDashboardBooking | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'search' | 'assessment' | 'payment' | 'confirmation'>('search');
  
  // Drop-off form data
  const [dropOffData, setDropOffData] = useState<DropOffData>({
    bookingId: '',
    customerSignature: '',
    bikeCondition: [
      { item: 'Frame', condition: 'excellent', notes: '' },
      { item: 'Wheels', condition: 'excellent', notes: '' },
      { item: 'Brakes', condition: 'excellent', notes: '' },
      { item: 'Chain & Gears', condition: 'excellent', notes: '' },
      { item: 'Handlebars', condition: 'excellent', notes: '' },
      { item: 'Seat', condition: 'excellent', notes: '' },
      { item: 'Lights', condition: 'excellent', notes: '' },
      { item: 'Accessories', condition: 'excellent', notes: '' }
    ],
    additionalCharges: [],
    totalAdditionalAmount: 0,
    notes: '',
    photos: []
  });

  useEffect(() => {
    fetchActiveBookings();
  }, []);

  const fetchActiveBookings = async () => {
    try {
      setIsLoading(true);
      const bookings = await bookingService.getMyBookings();
      console.log('All bookings from API:', bookings); // Debug log
      
      // Filter for active bookings (confirmed or active status)
      const activeOnes = bookings.filter((booking: PartnerDashboardBooking) => 
        booking.status === 'active' || booking.status === 'confirmed'
      );
      console.log('Active bookings:', activeOnes); // Debug log
      console.log('Sample booking structure:', activeOnes[0]); // Debug log
      setActiveBookings(activeOnes);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load active bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBookings = activeBookings.filter(booking =>
    booking.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.bikeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBookingSelect = (booking: PartnerDashboardBooking) => {
    console.log('Selected booking:', booking); // Debug log
    setSelectedBooking(booking);
    setDropOffData(prev => ({ ...prev, bookingId: booking.id }));
    setCurrentStep('assessment');
  };

  const handleConditionChange = (index: number, field: keyof BikeCondition, value: string) => {
    setDropOffData(prev => ({
      ...prev,
      bikeCondition: prev.bikeCondition.map((condition, i) =>
        i === index ? { ...condition, [field]: value } : condition
      )
    }));
  };

  const addAdditionalCharge = () => {
    setDropOffData(prev => ({
      ...prev,
      additionalCharges: [
        ...prev.additionalCharges,
        { type: 'other', description: '', amount: 0 }
      ]
    }));
  };

  const updateAdditionalCharge = (index: number, field: keyof AdditionalCharge, value: string | number) => {
    setDropOffData(prev => {
      const newCharges = prev.additionalCharges.map((charge, i) =>
        i === index ? { ...charge, [field]: value } : charge
      );
      const totalAdditional = newCharges.reduce((sum, charge) => sum + charge.amount, 0);
      return {
        ...prev,
        additionalCharges: newCharges,
        totalAdditionalAmount: totalAdditional
      };
    });
  };

  const removeAdditionalCharge = (index: number) => {
    setDropOffData(prev => {
      const newCharges = prev.additionalCharges.filter((_, i) => i !== index);
      const totalAdditional = newCharges.reduce((sum, charge) => sum + charge.amount, 0);
      return {
        ...prev,
        additionalCharges: newCharges,
        totalAdditionalAmount: totalAdditional
      };
    });
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setDropOffData(prev => ({
      ...prev,
      photos: [...prev.photos, ...files]
    }));
  };

  const processDropOff = async () => {
    if (!selectedBooking) return;

    try {
      setIsProcessing(true);

      // Process additional payment if needed
      if (dropOffData.totalAdditionalAmount > 0) {
        setCurrentStep('payment');
        // Here you would integrate with payment gateway
        // For now, we'll simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Update booking status to completed
      await bookingService.updateBookingStatus(selectedBooking.id, 'completed');

      // Here you would also:
      // 1. Upload photos to cloud storage
      // 2. Save drop-off data to backend
      // 3. Generate receipt
      // 4. Send notifications

      setCurrentStep('confirmation');
      toast.success('Bike drop-off completed successfully!');

    } catch (error) {
      console.error('Error processing drop-off:', error);
      toast.error('Failed to process drop-off. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'fair': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'damaged': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const resetForm = () => {
    setSelectedBooking(null);
    setCurrentStep('search');
    setDropOffData({
      bookingId: '',
      customerSignature: '',
      bikeCondition: [
        { item: 'Frame', condition: 'excellent', notes: '' },
        { item: 'Wheels', condition: 'excellent', notes: '' },
        { item: 'Brakes', condition: 'excellent', notes: '' },
        { item: 'Chain & Gears', condition: 'excellent', notes: '' },
        { item: 'Handlebars', condition: 'excellent', notes: '' },
        { item: 'Seat', condition: 'excellent', notes: '' },
        { item: 'Lights', condition: 'excellent', notes: '' },
        { item: 'Accessories', condition: 'excellent', notes: '' }
      ],
      additionalCharges: [],
      totalAdditionalAmount: 0,
      notes: '',
      photos: []
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link 
              to="/partner-dashboard" 
              className="inline-flex items-center text-gray-600 hover:text-[#00D4AA] mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to Dashboard
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bike Drop-Off</h1>
              <p className="text-gray-600">Process customer bike returns and finalize bookings</p>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[
              { key: 'search', label: 'Search Booking', icon: Search },
              { key: 'assessment', label: 'Bike Assessment', icon: CheckCircle },
              { key: 'payment', label: 'Payment', icon: CreditCard },
              { key: 'confirmation', label: 'Confirmation', icon: FileText }
            ].map(({ key, label, icon: Icon }, index) => (
              <div key={key} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep === key 
                    ? 'bg-[#00D4AA] border-[#00D4AA] text-white' 
                    : index < ['search', 'assessment', 'payment', 'confirmation'].indexOf(currentStep)
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep === key ? 'text-[#00D4AA]' : 'text-gray-500'
                }`}>
                  {label}
                </span>
                {index < 3 && <div className="mx-4 h-px w-12 bg-gray-300" />}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Step 1: Search Booking */}
          {currentStep === 'search' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">Find Active Booking</h2>
              
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search by booking number, customer name, or bike name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00D4AA] focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {/* Active Bookings List */}
              {filteredBookings.length === 0 ? (
                <div className="text-center py-12">
                  <BikeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Bookings</h3>
                  <p className="text-gray-600">
                    {searchTerm ? 'No bookings match your search.' : 'No active bookings available for drop-off.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBookings.map((booking) => (
                    <div 
                      key={booking.id} 
                      className="border border-gray-200 rounded-lg p-4 hover:border-[#00D4AA] cursor-pointer transition-colors duration-200"
                      onClick={() => handleBookingSelect(booking)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-[#00D4AA] rounded-lg flex items-center justify-center">
                            <BikeIcon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">#{booking.bookingNumber}</h3>
                            <p className="text-sm text-gray-600">{booking.customerName}</p>
                            <p className="text-sm font-medium text-[#00D4AA]">{booking.bikeName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'active' 
                              ? 'text-green-600 bg-green-50 border border-green-200' 
                              : 'text-blue-600 bg-blue-50 border border-blue-200'
                          }`}>
                            <Clock className="h-3 w-3 mr-1" />
                            {booking.status}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {booking.value}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Bike Assessment */}
          {currentStep === 'assessment' && selectedBooking && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Bike Assessment</h2>
                <div className="text-sm text-gray-600">
                  Booking: #{selectedBooking.bookingNumber}
                </div>
              </div>

              {/* Customer & Bike Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Booking Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Customer</p>
                    <p className="text-gray-900">{selectedBooking?.customerName || 'N/A'}</p>
                    <p className="text-sm text-gray-600">{selectedBooking?.customerPhone || ''}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Bike</p>
                    <p className="text-gray-900">{selectedBooking?.bikeName || 'N/A'}</p>
                    <p className="text-sm text-gray-600">ID: {selectedBooking?.bikeId || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Original Amount</p>
                    <p className="text-gray-900">{selectedBooking?.value || 'N/A'}</p>
                    <p className="text-sm text-gray-600">Status: {selectedBooking?.paymentStatus || 'N/A'}</p>
                  </div>
                </div>
                
                {/* Debug info - remove this later */}
                <div className="mt-4 p-3 bg-blue-50 rounded border text-xs">
                  <p><strong>Debug Info:</strong></p>
                  <p>Customer Name: "{selectedBooking?.customerName}"</p>
                  <p>Bike Name: "{selectedBooking?.bikeName}"</p>
                  <p>Value: "{selectedBooking?.value}"</p>
                  <p>Booking Number: "{selectedBooking?.bookingNumber}"</p>
                </div>
              </div>

              {/* Bike Condition Assessment */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">Bike Condition</h3>
                <div className="space-y-4">
                  {dropOffData.bikeCondition.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {item.item}
                          </label>
                          <select
                            value={item.condition}
                            onChange={(e) => handleConditionChange(index, 'condition', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00D4AA] focus:border-transparent ${getConditionColor(item.condition)}`}
                          >
                            <option value="excellent">Excellent</option>
                            <option value="good">Good</option>
                            <option value="fair">Fair</option>
                            <option value="damaged">Damaged</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notes (optional)
                          </label>
                          <input
                            type="text"
                            value={item.notes}
                            onChange={(e) => handleConditionChange(index, 'notes', e.target.value)}
                            placeholder="Any damage or issues..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00D4AA] focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Photo Upload */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">Documentation Photos</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Click to upload photos</p>
                    <p className="text-sm text-gray-500">
                      Upload photos showing bike condition (JPG, PNG)
                    </p>
                  </label>
                  {dropOffData.photos.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-green-600">
                        {dropOffData.photos.length} photo(s) uploaded
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Charges */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Additional Charges</h3>
                  <button
                    onClick={addAdditionalCharge}
                    className="px-4 py-2 bg-[#00D4AA] text-white rounded-lg hover:bg-[#00B399] transition-colors duration-200"
                  >
                    Add Charge
                  </button>
                </div>
                
                {dropOffData.additionalCharges.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No additional charges</p>
                ) : (
                  <div className="space-y-3">
                    {dropOffData.additionalCharges.map((charge, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <select
                              value={charge.type}
                              onChange={(e) => updateAdditionalCharge(index, 'type', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00D4AA]"
                            >
                              <option value="damage">Damage</option>
                              <option value="cleaning">Cleaning</option>
                              <option value="late_return">Late Return</option>
                              <option value="fuel">Fuel</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          <div className="md:col-span-2">
                            <input
                              type="text"
                              value={charge.description}
                              onChange={(e) => updateAdditionalCharge(index, 'description', e.target.value)}
                              placeholder="Description"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00D4AA]"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              value={charge.amount}
                              onChange={(e) => updateAdditionalCharge(index, 'amount', Number(e.target.value))}
                              placeholder="Amount"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00D4AA]"
                            />
                            <button
                              onClick={() => removeAdditionalCharge(index)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {dropOffData.totalAdditionalAmount > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-yellow-800">Total Additional Charges:</span>
                          <span className="font-bold text-yellow-900">
                            LKR {dropOffData.totalAdditionalAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Additional Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={dropOffData.notes}
                  onChange={(e) => setDropOffData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  placeholder="Any additional notes about the drop-off..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00D4AA] focus:border-transparent"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep('search')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={processDropOff}
                  disabled={isProcessing}
                  className="px-6 py-3 bg-[#00D4AA] text-white rounded-lg hover:bg-[#00B399] disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Complete Drop-Off'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Payment Processing */}
          {currentStep === 'payment' && (
            <div className="p-6">
              <div className="text-center py-12">
                <CreditCard className="h-16 w-16 text-[#00D4AA] mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Processing Additional Payment</h2>
                <p className="text-gray-600 mb-4">
                  Processing payment for additional charges: LKR {dropOffData.totalAdditionalAmount.toLocaleString()}
                </p>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00D4AA] mx-auto"></div>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {currentStep === 'confirmation' && selectedBooking && (
            <div className="p-6">
              <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Drop-Off Completed Successfully!</h2>
                <p className="text-gray-600 mb-6">
                  Booking #{selectedBooking.bookingNumber} has been completed.
                </p>
                
                <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left max-w-md mx-auto">
                  <h3 className="font-medium mb-3">Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Original Amount:</span>
                      <span>{selectedBooking.value}</span>
                    </div>
                    {dropOffData.totalAdditionalAmount > 0 && (
                      <div className="flex justify-between">
                        <span>Additional Charges:</span>
                        <span>LKR {dropOffData.totalAdditionalAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <hr className="my-2" />
                    <div className="flex justify-between font-medium">
                      <span>Total:</span>
                      <span>LKR {(parseFloat(selectedBooking.value.replace(/[^\d.-]/g, '')) + dropOffData.totalAdditionalAmount).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center space-x-4">
                  <button
                    onClick={resetForm}
                    className="px-6 py-3 bg-[#00D4AA] text-white rounded-lg hover:bg-[#00B399]"
                  >
                    Process Another Drop-Off
                  </button>
                  <Link
                    to="/partner-dashboard"
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Back to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DropBikePage;