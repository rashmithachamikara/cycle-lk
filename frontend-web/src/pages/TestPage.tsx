import React, { useState } from 'react';
import { authService } from '../services/authService';
import { bikeService } from '../services/bikeService';
import { bookingService } from '../services/bookingService';
import { faqService } from '../services/faqService';
import { locationService } from '../services/locationService';
import { notificationService } from '../services/notificationService';
import { partnerService } from '../services/partnerService';
import { paymentService } from '../services/paymentService';
import { reviewService } from '../services/reviewService';
import { supportService } from '../services/supportService';

// Set of available services for testing
const services = {
  auth: authService,
  bike: bikeService,
  booking: bookingService,
  faq: faqService,
  location: locationService,
  notification: notificationService,
  partner: partnerService,
  payment: paymentService,
  review: reviewService,
  support: supportService,
};

const TestPage: React.FC = () => {
  // State to track selected service and method
  const [selectedService, setSelectedService] = useState('bike');
  const [selectedMethod, setSelectedMethod] = useState('');
  
  // State for request parameters and response
  const [params, setParams] = useState('{}');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get available methods for the selected service
  const getServiceMethods = () => {
    if (!selectedService) return [];
    return Object.keys(services[selectedService as keyof typeof services]);
  };

  // Handle method execution
  const executeMethod = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      const service = services[selectedService as keyof typeof services];
      const method = service[selectedMethod as keyof typeof service] as (...args: any[]) => Promise<any>;
      
      if (typeof method !== 'function') {
        throw new Error(`Method ${selectedMethod} is not a function`);
      }
      
      // Parse parameters from JSON string
      let parsedParams;
      try {
        parsedParams = params.trim() ? JSON.parse(params) : [];
      } catch (e) {
        throw new Error(`Invalid JSON parameters: ${(e as Error).message}`);
      }
      
      // Execute the method with the parsed parameters
      const result = Array.isArray(parsedParams)
        ? await method(...parsedParams)
        : await method(parsedParams);
        
      setResponse(result);
    } catch (err) {
      setError(`Error: ${(err as Error).message}`);
      console.error('API Test Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">API Service Test Page</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Configuration</h2>
          
          {/* Service Selection */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Service</label>
            <select 
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedService}
              onChange={(e) => {
                setSelectedService(e.target.value);
                setSelectedMethod('');
              }}
            >
              {Object.keys(services).map((service) => (
                <option key={service} value={service}>
                  {service}Service
                </option>
              ))}
            </select>
          </div>
          
          {/* Method Selection */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Method</label>
            <select 
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
            >
              <option value="">Select a method</option>
              {getServiceMethods().map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>
          
          {/* Parameters Input */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">
              Parameters (JSON format - array for positional params or object for named params)
            </label>
            <textarea 
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              rows={8}
              value={params}
              onChange={(e) => setParams(e.target.value)}
              placeholder='e.g., ["123"] or {"id": "123"} or {} for no params'
            />
          </div>
          
          {/* Execute Button */}
          <button 
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
            onClick={executeMethod}
            disabled={!selectedMethod || loading}
          >
            {loading ? 'Executing...' : 'Execute Method'}
          </button>
        </div>
        
        {/* Response Display */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Response</h2>
          
          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-4">
              <p className="font-mono text-sm whitespace-pre-wrap">{error}</p>
            </div>
          )}
          
          {!loading && !error && response && (
            <div className="overflow-auto h-64">
              <pre className="bg-gray-50 p-4 rounded-md font-mono text-sm whitespace-pre-wrap">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}
          
          {!loading && !error && !response && (
            <div className="text-gray-500 h-64 flex items-center justify-center">
              <p>No response yet. Execute a method to see results.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Help Section */}
      <div className="mt-8 bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Usage Guide</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Select a service from the dropdown (e.g., bikeService)</li>
          <li>Select a method from that service (e.g., getAllBikes)</li>
          <li>Enter parameters in JSON format:
            <ul className="list-disc list-inside ml-6 mt-1">
              <li>For positional parameters: <code className="bg-gray-100 px-1">["param1", "param2"]</code></li>
              <li>For object parameters: <code className="bg-gray-100 px-1">{'{"location": "Colombo", "type": "Mountain"}'}</code></li>
            </ul>
          </li>
          <li>Click "Execute Method" to call the API</li>
          <li>View the response on the right panel</li>
        </ul>
      </div>
    </div>
  );
};

export default TestPage;
