import React from 'react';
import { ChatWidget } from '../components/ChatWidget';

const ChatbotDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚲 Cycle.LK AI Assistant
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Experience our intelligent chatbot powered by Google Gemini AI
          </p>
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              What can I help you with?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">🔍 Find Bikes</h3>
                <p className="text-blue-600 text-sm">
                  Search for available bikes near your location
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">📍 Locations</h3>
                <p className="text-green-600 text-sm">
                  Get information about rental locations
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-2">📋 Bookings</h3>
                <p className="text-purple-600 text-sm">
                  Check your booking status and history
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-semibold text-orange-800 mb-2">💰 Pricing</h3>
                <p className="text-orange-600 text-sm">
                  Learn about rental rates and packages
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold text-red-800 mb-2">❓ Support</h3>
                <p className="text-red-600 text-sm">
                  Get help with any issues or questions
                </p>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h3 className="font-semibold text-indigo-800 mb-2">📱 How to Use</h3>
                <p className="text-indigo-600 text-sm">
                  Learn how to rent and return bikes
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              🤖 AI-Powered Intelligence
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Natural language understanding</li>
              <li>• Context-aware conversations</li>
              <li>• Real-time database queries</li>
              <li>• Personalized responses</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              🚀 Key Features
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li>• 24/7 availability</li>
              <li>• Instant responses</li>
              <li>• Multi-language support</li>
              <li>• Session persistence</li>
            </ul>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            💬 How to Use the Chat
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <p className="text-sm text-gray-600">
                Click the chat button in the bottom-right corner
              </p>
            </div>
            <div className="p-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <p className="text-sm text-gray-600">
                Type your question or select a suggestion
              </p>
            </div>
            <div className="p-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <p className="text-sm text-gray-600">
                Get instant AI-powered responses
              </p>
            </div>
            <div className="p-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-orange-600 font-bold">4</span>
              </div>
              <p className="text-sm text-gray-600">
                Follow suggestions for more help
              </p>
            </div>
          </div>
        </div>

        {/* Sample Questions */}
        <div className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-xl font-semibold mb-4">💡 Try These Sample Questions:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">🚲 Bike Queries:</h4>
              <ul className="text-sm space-y-1 opacity-90">
                <li>"Show me available bikes in Colombo"</li>
                <li>"What types of bikes do you have?"</li>
                <li>"I need a bike for 2 hours"</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">❓ General Help:</h4>
              <ul className="text-sm space-y-1 opacity-90">
                <li>"How do I create an account?"</li>
                <li>"What are your rental rates?"</li>
                <li>"How do I cancel a booking?"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Chatbot Widget */}
      <ChatWidget
        position="bottom-right"
        theme="light"
        showWelcomeMessage={true}
      />
    </div>
  );
};

export default ChatbotDemo;