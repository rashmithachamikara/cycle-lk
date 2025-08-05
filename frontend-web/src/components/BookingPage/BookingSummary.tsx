import { Shield } from 'lucide-react';
import { Bike } from '../../services/bikeService';

interface BookingSummaryProps {
  selectedBike: Bike | null;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  deliveryAddress: string;
  totalPrice: number;
}

const BookingSummary = ({
  selectedBike,
  startDate,
  startTime,
  endDate,
  endTime,
  deliveryAddress,
  totalPrice
}: BookingSummaryProps) => {
  const calculateDuration = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(`${startDate}T${startTime || '00:00'}`);
    const end = new Date(`${endDate}T${endTime || '23:59'}`);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-24">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Booking Summary</h3>
      
      <div className="space-y-4">
        {selectedBike ? (
          <>
            <div className="flex justify-between">
              <span className="text-gray-600">Bike:</span>
              <span className="font-semibold">{selectedBike.name}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span className="font-semibold capitalize">{selectedBike.type}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Location:</span>
              <span className="font-semibold">{selectedBike.location}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Rate:</span>
              <span className="font-semibold">${selectedBike.pricing.perDay}/day</span>
            </div>
          </>
        ) : (
          <div className="text-gray-500 text-center py-4">
            Select a bike to see details
          </div>
        )}
        
        {startDate && endDate && (
          <>
            <hr className="my-4" />
            
            <div className="flex justify-between">
              <span className="text-gray-600">Start:</span>
              <span className="font-semibold">{startDate} {startTime}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">End:</span>
              <span className="font-semibold">{endDate} {endTime}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="font-semibold">
                {calculateDuration()} days
              </span>
            </div>
            
            {deliveryAddress && (
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery:</span>
                <span className="font-semibold">Included</span>
              </div>
            )}
            
            <hr className="my-4" />
            
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-emerald-600">${totalPrice}</span>
            </div>
          </>
        )}
      </div>
      
      <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
        <div className="flex items-center text-emerald-700">
          <Shield className="h-5 w-5 mr-2" />
          <span className="text-sm font-medium">Free cancellation up to 24 hours before pickup</span>
        </div>
      </div>
    </div>
  );
};

export default BookingSummary;
