interface BikeFiltersProps {
  showFilters: boolean;
}

const BikeFilters = ({ showFilters }: BikeFiltersProps) => {
  if (!showFilters) return null;

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="grid md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bike Type</label>
          <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
            <option>All Types</option>
            <option>city</option>
            <option>mountain</option>
            <option>hybrid</option>
            <option>electric</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
          <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
            <option>Any Price</option>
            <option>$10-20</option>
            <option>$20-30</option>
            <option>$30+</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
          <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
            <option>Any Rating</option>
            <option>4.5+ Stars</option>
            <option>4.0+ Stars</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
            <option>All Locations</option>
            <option>Colombo</option>
            <option>Kandy</option>
            <option>Galle</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default BikeFilters;
