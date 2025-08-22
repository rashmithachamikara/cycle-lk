import { CheckCircle } from 'lucide-react';

interface FeaturesSectionProps {
  features?: string[];
}

const FeaturesSection = ({ features }: FeaturesSectionProps) => {
  if (!features || features.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Features & Included</h3>
      <div className="grid md:grid-cols-2 gap-4">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center">
            <CheckCircle className="h-5 w-5 text-[#00D4AA] mr-3 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturesSection;
