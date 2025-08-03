interface SpecificationsSectionProps {
  specifications?: Record<string, unknown>;
}

const SpecificationsSection = ({ specifications }: SpecificationsSectionProps) => {
  if (!specifications || Object.keys(specifications).length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Specifications</h3>
      <div className="space-y-4">
        {Object.entries(specifications).map(([key, value]) => (
          <div key={key} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
            <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
            <span className="font-medium text-gray-900">{String(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpecificationsSection;
