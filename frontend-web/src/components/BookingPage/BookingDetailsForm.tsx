import { Shield } from 'lucide-react';

interface BookingDetailsFormProps {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  deliveryAddress: string;
  onStartDateChange: (date: string) => void;
  onStartTimeChange: (time: string) => void;
  onEndDateChange: (date: string) => void;
  onEndTimeChange: (time: string) => void;
  onDeliveryAddressChange: (address: string) => void;
}

const BookingDetailsForm = ({
  startDate,
  startTime,
  endDate,
  endTime,
  deliveryAddress,
  onStartDateChange,
  onStartTimeChange,
  onEndDateChange,
  onEndTimeChange,
  onDeliveryAddressChange
}: BookingDetailsFormProps) => {
  return (
    <div className="bg-white rounded-2xl p-8">
      <form className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rental Period</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => onStartTimeChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                min={startDate || new Date().toISOString().split('T')[0]}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => onEndTimeChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery (Optional)</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address</label>
            <textarea
              value={deliveryAddress}
              onChange={(e) => onDeliveryAddressChange(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none"
              placeholder="Enter your delivery address (optional - leave blank for pickup)"
            />
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-emerald-500 mr-2" />
            <span className="text-sm text-gray-600">Free cancellation up to 24 hours before pickup</span>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BookingDetailsForm;
