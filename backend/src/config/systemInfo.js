/**
 * System Information Configuration
 * Update this file to modify chatbot system information
 */

const SYSTEM_INFO = {
  // Platform Information
  PLATFORM_NAME: "Cycle.LK",
  PLATFORM_DESCRIPTION: "A bike rental platform connecting rental businesses across Sri Lanka",
  
  // Service Coverage
  MAJOR_CITIES: [
    "Colombo", "Kandy", "Galle", "Negombo", "Ella", 
    "Nuwara Eliya", "Jaffna", "Trincomalee", "Anuradhapura", "Sigiriya"
  ],
  
  // Available Bike Types
  BIKE_TYPES: [
    {
      name: "Mountain Bikes",
      description: "For off-road and hill country adventures",
      suitableFor: ["Hill country exploration", "Off-road trails", "Adventure cycling"]
    },
    {
      name: "Road Bikes", 
      description: "For speed and long-distance touring",
      suitableFor: ["Long-distance travel", "Speed cycling", "Fitness rides"]
    },
    {
      name: "City Bikes",
      description: "For urban commuting and casual rides", 
      suitableFor: ["City commuting", "Casual rides", "Short trips"]
    },
    {
      name: "Electric Bikes",
      description: "For effortless cycling with motor assistance",
      suitableFor: ["Easy rides", "Elderly riders", "Long distances with less effort"]
    },
    {
      name: "Hybrid Bikes",
      description: "Versatile for both city and light trail use",
      suitableFor: ["Mixed terrain", "Versatile riding", "City and light trails"]
    },
    {
      name: "Touring Bikes", 
      description: "For long-distance travel with luggage capacity",
      suitableFor: ["Multi-day trips", "Luggage carrying", "Long-distance touring"]
    }
  ],
  
  // Service Areas with Specialties
  SERVICE_AREAS: {
    "Colombo": {
      specialty: "Urban cycling, city tours, commuting",
      highlights: ["Business district access", "Harbor area", "Galle Face Green", "Shopping areas"]
    },
    "Kandy": {
      specialty: "Hill country exploration, cultural sites",
      highlights: ["Temple of Tooth", "Kandy Lake", "Royal Botanical Gardens", "Hill trails"]
    },
    "Galle": {
      specialty: "Coastal rides, fort area cycling", 
      highlights: ["Galle Fort", "Beach routes", "Historic sites", "Coastal paths"]
    },
    "Negombo": {
      specialty: "Beach cycling, airport transfers",
      highlights: ["Beach promenade", "Fish market", "Lagoon area", "Airport connectivity"]
    },
    "Ella": {
      specialty: "Mountain trails, scenic routes",
      highlights: ["Nine Arch Bridge", "Little Adam's Peak", "Tea plantations", "Mountain views"]
    },
    "Nuwara Eliya": {
      specialty: "Tea plantation tours, cool climate cycling", 
      highlights: ["Tea estates", "Cool weather", "Lake Gregory", "Colonial architecture"]
    }
  },
  
  // Rental Options
  RENTAL_PERIODS: [
    { period: "Hourly", minDuration: 1, unit: "hours", suitableFor: "Short trips and quick errands" },
    { period: "Daily", minDuration: 1, unit: "days", suitableFor: "Day trips and city exploration" },
    { period: "Weekly", minDuration: 1, unit: "weeks", suitableFor: "Extended stays and thorough exploration" },
    { period: "Monthly", minDuration: 1, unit: "months", suitableFor: "Long-term stays and regular commuting" }
  ],
  
  // Features and Benefits
  PLATFORM_FEATURES: [
    "Safety gear and insurance included with all rentals",
    "24/7 customer support available",
    "GPS tracking on all bikes for security",
    "Flexible pickup/dropoff locations through partner network", 
    "Multiple payment options accepted",
    "Verified and trusted rental partners",
    "Real-time availability checking",
    "Damage protection coverage",
    "Emergency roadside assistance"
  ],
  
  // Contact and Support
  SUPPORT_INFO: {
    available: "24/7",
    channels: ["Phone support", "Live chat", "Email support", "WhatsApp"],
    emergencySupport: "Available for breakdowns and emergencies"
  },
  
  // Booking Process - How to book a bike step by step
  BOOKING_PROCESS: {
    steps: [
      "1. Visit our website",
      "2. Enter your pickup location and preferred dates/times",
      "3. Browse available bikes by type and features",
      "4. Select your preferred bike and rental duration",
      "5. Choose pickup and drop-off locations from our partner network",
      "6. Upload required documents (valid ID and driving license)",
      "7. Complete identity verification process",
      "8. Select your preferred payment method",
      "9. Review booking details and make payment",
      "10. Receive booking confirmation through system notificatoins",
      "11. Arrive at pickup location at scheduled time",
      "12. Complete safety briefing and bike inspection with partner",
      "13. Start your adventure and enjoy the ride!"
    ],
    requirements: [
      "Valid government-issued ID (passport or NIC)",
      "Valid driving license (for motorized bikes)",
      "Active mobile number for SMS confirmations",
      "Email address for booking confirmations",
      "Emergency contact details",
      "Payment method (credit card, debit card, cash, ...)"
    ],
    tips: [
      "Book in advance for better bike availability and rates",
      "Check weather conditions before booking outdoor rides",
      "Consider traffic patterns when planning pickup times",
      "Download our mobile app for real-time tracking and support",
      "Read partner reviews to choose the best pickup location",
      "Verify bike condition during pickup inspection",
      "Keep emergency contact numbers handy during your ride"
    ]
  },

  // Payment Methods - Available payment options
  PAYMENT_METHODS: {
    accepted: [
      "Credit Cards (Visa, Mastercard, American Express)",
      "Debit Cards (all major banks)",
      "Bank Transfer (BOC, People's Bank, Commercial Bank)",
      "Cash payments at partner locations"
    ],
    currencies: [
      "LKR (Sri Lankan Rupee) - Primary currency",
      "USD (US Dollar) - Online payments only",
      "EUR (Euro) - Online payments only",
      "GBP (British Pound) - Online payments only"
    ],
    policies: [
      "Security deposit required for all rentals (LKR 5,000-15,000 depending on bike type)",
      "Full payment due at booking confirmation",
      "Refund policy: Full refund if cancelled 24+ hours before pickup",
      "50% refund if cancelled 12-24 hours before pickup",
      "No refund for cancellations less than 12 hours before pickup",
      "Payment disputes handled within 7 business days",
      "LKR only for cash payments. For card payments, we accept other currencies",
      "All transactions are secured with 256-bit SSL encryption"
    ]
  },

  // Safety Features - Safety equipment and measures
  SAFETY_FEATURES: {
    equipment: [
      "High-quality helmets (all sizes: XS to XXL)",
      "Reflective safety vests (mandatory for night rides)",
      "LED lights - front white and rear red (rechargeable)",
      "First aid kit available at all pickup locations", 
      "Basic repair kit with essential tools",
      "Emergency whistle and contact card",
      "Knee and elbow pads (available on request)",
      "Phone mount and charging cable",
      "Rain poncho (monsoon season)",
      "Lock and security chain for bike parking"
    ],
    measures: [
      "Daily bike maintenance and safety inspection before each rental",
      "Real-time GPS tracking on every rental bike",
      "24/7 emergency contact system and roadside assistance",
      "Comprehensive insurance coverage (accidents, theft, damage)",
      "Partner background verification and regular training",
      "Bike condition monitoring and predictive maintenance",
      "Emergency response team in major cities",
      "Integration with local hospitals and police stations",
      "Weather alert system and ride recommendations",
      "Incident reporting and rapid response protocol"
    ],
    guidelines: [
      "Always wear the provided helmet - it's mandatory and saves lives",
      "Follow all traffic rules and local regulations",
      "Use designated bike lanes and paths when available",
      "Stay visible - use lights and reflective gear, especially at dawn/dusk",
      "Report any bike issues, accidents, or safety concerns immediately",
      "Check bike condition before starting your ride",
      "Keep emergency contact numbers readily accessible",
      "Avoid riding in heavy rain or severe weather conditions",
      "Inform someone about your planned route and expected return time",
      "Stay hydrated and take breaks on longer rides"
    ]
  },

  // Legacy booking steps (for backward compatibility)
  BOOKING_STEPS: [
    "Search for bikes by location and date",
    "Compare options and select preferred bike",
    "Choose rental duration and add-ons", 
    "Provide required documentation",
    "Complete secure payment",
    "Receive booking confirmation and pickup details"
  ]
};

// Helper function to get formatted platform info
function getPlatformInfo() {
  return {
    name: SYSTEM_INFO.PLATFORM_NAME,
    description: SYSTEM_INFO.PLATFORM_DESCRIPTION,
    cities: SYSTEM_INFO.MAJOR_CITIES.join(', '),
    bikeTypes: SYSTEM_INFO.BIKE_TYPES.map(bike => bike.name).join(', '),
    features: SYSTEM_INFO.PLATFORM_FEATURES
  };
}

// Helper function to get service area info
function getServiceAreaInfo(city) {
  return SYSTEM_INFO.SERVICE_AREAS[city] || null;
}

// Helper function to get bike type info
function getBikeTypeInfo(bikeType) {
  return SYSTEM_INFO.BIKE_TYPES.find(bike => 
    bike.name.toLowerCase().includes(bikeType.toLowerCase())
  );
}

// Helper function to get booking process info
function getBookingProcessInfo() {
  return SYSTEM_INFO.BOOKING_PROCESS;
}

// Helper function to get payment methods info
function getPaymentMethodsInfo() {
  return SYSTEM_INFO.PAYMENT_METHODS;
}

// Helper function to get safety features info
function getSafetyFeaturesInfo() {
  return SYSTEM_INFO.SAFETY_FEATURES;
}

module.exports = {
  SYSTEM_INFO,
  getPlatformInfo,
  getServiceAreaInfo,
  getBikeTypeInfo,
  getBookingProcessInfo,
  getPaymentMethodsInfo,
  getSafetyFeaturesInfo
};