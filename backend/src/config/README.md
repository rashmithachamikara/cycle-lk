# Chatbot Configuration Guide

This directory contains the configuration files for the Cycle.LK chatbot system.

## Files Overview

### 📄 `systemInfo.js`
**Main configuration file for system information**

This is where you update:
- Platform details (name, description)
- Supported cities and service areas
- Available bike types and their descriptions  
- Platform features and benefits
- Support information
- Booking process steps

### 📄 `prompts.js`
**AI prompt templates and system instructions**

Contains the AI system prompts that automatically use information from `systemInfo.js`. You typically don't need to edit this file unless you want to change the AI's personality or response style.

## How to Update System Information

### Adding a New City

1. Open `systemInfo.js`
2. Add the city to `MAJOR_CITIES` array:
```javascript
MAJOR_CITIES: [
  "Colombo", "Kandy", "Galle", "YourNewCity"
]
```
3. Add city details to `SERVICE_AREAS`:
```javascript
"YourNewCity": {
  specialty: "What makes this city special for cycling",
  highlights: ["Popular spot 1", "Popular spot 2", "Popular spot 3"]
}
```

### Adding a New Bike Type

1. Open `systemInfo.js`  
2. Add to `BIKE_TYPES` array:
```javascript
{
  name: "New Bike Type",
  description: "Description of when to use this bike",
  suitableFor: ["Use case 1", "Use case 2", "Use case 3"]
}
```

### Updating Platform Features

1. Open `systemInfo.js`
2. Modify the `PLATFORM_FEATURES` array:
```javascript
PLATFORM_FEATURES: [
  "Your new feature",
  "Another feature",
  // ... existing features
]
```

### Updating Support Information

1. Open `systemInfo.js`
2. Modify the `SUPPORT_INFO` object:
```javascript
SUPPORT_INFO: {
  available: "24/7", // or "Business hours only", etc.
  channels: ["Phone", "Email", "Chat", "WhatsApp"],
  emergencySupport: "Available for emergencies"
}
```

### Adding Booking Process Details

1. Open `systemInfo.js`
2. Update the `BOOKING_PROCESS` object:
```javascript
BOOKING_PROCESS: {
  steps: [
    "Visit our website or mobile app",
    "Enter your pickup location and dates",
    "Browse available bikes and select one",
    "Provide required documentation",
    "Complete payment and confirmation"
  ],
  requirements: [
    "Valid ID or passport required",
    "Credit card for security deposit",
    "Minimum age 18 years"
  ],
  tips: [
    "Book in advance for better availability",
    "Check weather conditions",
    "Review pickup location details"
  ]
}
```

### Adding Payment Methods

1. Open `systemInfo.js`
2. Update the `PAYMENT_METHODS` object:
```javascript
PAYMENT_METHODS: {
  accepted: [
    "Credit Cards (Visa, Mastercard, Amex)",
    "Debit Cards", 
    "Digital Wallets (PayPal, Google Pay)",
    "Bank Transfer",
    "Cash (for local bookings)"
  ],
  currencies: [
    "LKR (Sri Lankan Rupee)",
    "USD (US Dollar)"
  ],
  policies: [
    "Security deposit required",
    "Full payment due at booking",
    "24-hour cancellation policy"
  ]
}
```

### Adding Safety Features

1. Open `systemInfo.js`
2. Update the `SAFETY_FEATURES` object:
```javascript
SAFETY_FEATURES: {
  equipment: [
    "High-quality helmets (all sizes)",
    "Reflective safety vests",
    "LED front and rear lights",
    "Basic repair kit",
    "First aid kit"
  ],
  measures: [
    "Regular bike maintenance",
    "GPS tracking on all bikes",
    "24/7 emergency support",
    "Comprehensive insurance coverage"
  ],
  guidelines: [
    "Always wear provided helmet",
    "Follow local traffic rules",
    "Stay on designated bike paths",
    "Report issues immediately"
  ]
}
```

## Important Notes

- ⚠️ **Restart the backend server** after making changes to see them in effect
- ✅ The chatbot automatically uses updated information in conversations
- 🔄 Changes are applied to all new chat sessions immediately
- 📝 Keep descriptions concise and user-friendly
- 🌍 Focus on Sri Lankan context and local information

## Testing Your Changes

1. Make your changes to `systemInfo.js`
2. Restart the backend server
3. Start a new chat session
4. Ask the chatbot about the information you updated
5. Verify the response includes your new information

## Examples

**Ask the bot:** "What cities do you serve?"
**Expected response should include:** All cities from your `MAJOR_CITIES` array

**Ask the bot:** "What bike types are available?"  
**Expected response should include:** All bike types from your `BIKE_TYPES` array

**Ask the bot:** "What features do you offer?"
**Expected response should include:** Features from your `PLATFORM_FEATURES` array

---

*For technical questions about the configuration system, contact the development team.*