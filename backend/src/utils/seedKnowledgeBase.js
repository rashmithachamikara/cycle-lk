const mongoose = require('mongoose');
const { ChatbotKnowledge, User } = require('../models');

const knowledgeBaseData = [
  // Booking related
  {
    category: 'booking',
    question: 'How do I book a bike?',
    answer: 'To book a bike: 1) Search for available bikes in your preferred location 2) Select your desired bike and dates 3) Choose pickup/dropoff locations 4) Complete payment 5) Receive booking confirmation with QR code. You can book through our website or mobile app.',
    keywords: ['book', 'booking', 'reserve', 'rent', 'how to book'],
    intent: 'create_booking',
    priority: 10
  },
  {
    category: 'booking',
    question: 'Can I cancel my booking?',
    answer: 'Yes, you can cancel your booking up to 24 hours before your rental start time for a full refund. Cancellations within 24 hours may incur a 25% fee. To cancel, go to "My Bookings" in your account or contact our support team.',
    keywords: ['cancel', 'cancellation', 'refund', 'cancel booking'],
    intent: 'cancel_booking',
    priority: 9
  },
  {
    category: 'booking',
    question: 'How do I modify my booking?',
    answer: 'You can modify your booking dates, pickup location, or bike selection up to 12 hours before your rental start time. Login to your account, go to "My Bookings", and click "Modify" next to your reservation. Additional charges may apply for upgrades.',
    keywords: ['modify', 'change', 'edit', 'update booking'],
    intent: 'booking_status',
    priority: 8
  },
  
  // Bikes related
  {
    category: 'bikes',
    question: 'What types of bikes are available?',
    answer: 'We offer various bike types: Mountain bikes for off-road adventures, City bikes for urban exploration, Road bikes for speed and distance, Electric bikes for easy rides, and Hybrid bikes for versatility. All bikes are regularly maintained and include safety equipment.',
    keywords: ['bike types', 'bicycle types', 'mountain', 'city', 'road', 'electric', 'hybrid'],
    intent: 'find_bikes',
    priority: 10
  },
  {
    category: 'bikes',
    question: 'Are helmets and safety equipment included?',
    answer: 'Yes! All bike rentals include a helmet, basic repair kit, and lock. Additional safety gear like knee pads and reflective vests are available upon request. We prioritize your safety and ensure all equipment meets international standards.',
    keywords: ['helmet', 'safety', 'equipment', 'protection', 'gear'],
    intent: 'get_bike_details',
    priority: 8
  },
  {
    category: 'bikes',
    question: 'How do I choose the right bike size?',
    answer: 'Bike size depends on your height and riding preference. Our partners will help you choose the perfect fit during pickup. Generally: Small (5\'0"-5\'4"), Medium (5\'4"-5\'8"), Large (5\'8"-6\'0"), XL (6\'0"+). You can also check bike specifications in the listing.',
    keywords: ['bike size', 'frame size', 'height', 'fit', 'sizing'],
    intent: 'get_bike_details',
    priority: 7
  },
  
  // Locations related
  {
    category: 'locations',
    question: 'Where can I rent bikes in Sri Lanka?',
    answer: 'We have bike rental partners across Sri Lanka including Colombo, Kandy, Galle, Negombo, Ella, Nuwara Eliya, Anuradhapura, and many more locations. Each location offers different bike types suited for local terrain and attractions.',
    keywords: ['locations', 'where', 'cities', 'sri lanka', 'colombo', 'kandy', 'galle'],
    intent: 'find_locations',
    priority: 10
  },
  {
    category: 'locations',
    question: 'Can I pick up and drop off at different locations?',
    answer: 'Yes! We offer flexible pickup and dropoff options. You can collect your bike from one partner and return it to another location within the same city or even different cities. Additional delivery fees may apply for intercity transfers.',
    keywords: ['pickup', 'dropoff', 'different locations', 'flexible', 'delivery'],
    intent: 'find_locations',
    priority: 8
  },
  
  // Payment related
  {
    category: 'payment',
    question: 'What payment methods do you accept?',
    answer: 'We accept major credit cards (Visa, Mastercard), debit cards, PayPal, and mobile payments. All transactions are secured with encryption. Payment is required at the time of booking to confirm your reservation.',
    keywords: ['payment', 'pay', 'credit card', 'visa', 'mastercard', 'paypal'],
    intent: 'payment_info',
    priority: 9
  },
  {
    category: 'payment',
    question: 'Is there a security deposit required?',
    answer: 'Yes, a refundable security deposit is required for all rentals. The amount varies by bike type: ₹2,000-₹5,000 for standard bikes, ₹5,000-₹10,000 for premium/electric bikes. The deposit is fully refunded upon safe return of the bike.',
    keywords: ['deposit', 'security deposit', 'refundable', 'security'],
    intent: 'payment_info',
    priority: 8
  },
  
  // General/Support
  {
    category: 'general',
    question: 'What should I do if my bike breaks down?',
    answer: 'If you experience any issues: 1) Contact your rental partner immediately using the provided phone number 2) Don\'t attempt repairs yourself 3) Move to a safe location 4) We\'ll arrange roadside assistance or bike replacement. Emergency contact numbers are provided with every rental.',
    keywords: ['breakdown', 'problem', 'repair', 'emergency', 'roadside assistance'],
    intent: 'contact_support',
    priority: 9
  },
  {
    category: 'general',
    question: 'What are your rental rates?',
    answer: 'Rental rates vary by bike type and location: Hourly: ₹200-₹800, Daily: ₹800-₹2,500, Weekly: ₹4,000-₹15,000, Monthly: ₹15,000-₹50,000. Electric bikes and premium models cost more. Check specific bike listings for exact pricing and available packages.',
    keywords: ['rates', 'prices', 'cost', 'pricing', 'how much', 'rental rates'],
    intent: 'pricing_info',
    priority: 10
  },
  {
    category: 'general',
    question: 'Do you offer guided tours?',
    answer: 'Many of our partners offer guided cycling tours! These include city tours, cultural heritage rides, nature trails, and adventure tours. Guided tours include bikes, safety equipment, and local expert guides. Check with individual partners or contact us for tour packages.',
    keywords: ['tours', 'guided', 'guide', 'cycling tours', 'sightseeing'],
    intent: 'get_partners',
    priority: 7
  },
  
  // Account related
  {
    category: 'account',
    question: 'Do I need to create an account to rent a bike?',
    answer: 'Yes, creating an account helps us verify your identity, manage bookings, and provide better service. Account creation is quick and requires basic information. Verified accounts get priority booking and special offers.',
    keywords: ['account', 'register', 'signup', 'create account', 'membership'],
    intent: 'account_info',
    priority: 8
  },
  {
    category: 'account',
    question: 'How do I verify my account?',
    answer: 'Account verification requires email confirmation and phone verification. For bike rentals, you\'ll also need to upload a valid ID (National ID, Passport, or Driver\'s License). Verification typically takes 24-48 hours and is required before your first rental.',
    keywords: ['verify', 'verification', 'id verification', 'documents'],
    intent: 'account_info',
    priority: 8
  },
  
  // Support
  {
    category: 'support',
    question: 'How can I contact customer support?',
    answer: 'You can reach our support team via: Live chat on our website/app, Email: support@cycle.lk, Phone: +94 11 234 5678 (9 AM - 8 PM), WhatsApp: +94 77 123 4567. For emergencies during rentals, use the partner contact number provided with your booking.',
    keywords: ['support', 'contact', 'help', 'customer service', 'phone', 'email'],
    intent: 'contact_support',
    priority: 10
  },
  {
    category: 'support',
    question: 'What if I lose something during my rental?',
    answer: 'If you lose personal items during your rental, contact the partner immediately and file a report. For bike accessories (helmet, lock, etc.), replacement costs will be charged to your account. We recommend keeping valuable items secure and checking the bike before returning.',
    keywords: ['lost', 'lose', 'missing', 'items', 'accessories'],
    intent: 'contact_support',
    priority: 6
  }
];

async function seedKnowledgeBase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cycle-lk');
    console.log('Connected to MongoDB');

    // Find an admin user or create a system user for created_by field
    let systemUser = await User.findOne({ role: 'admin' });
    if (!systemUser) {
      // Create a system user if no admin exists
      systemUser = new User({
        firstName: 'System',
        lastName: 'Admin',
        email: 'system@cycle.lk',
        password: 'temporary', // This should be changed
        role: 'admin'
      });
      await systemUser.save();
      console.log('Created system user for knowledge base');
    }

    // Clear existing knowledge base
    await ChatbotKnowledge.deleteMany({});
    console.log('Cleared existing knowledge base');

    // Insert new knowledge base data
    const knowledgeEntries = knowledgeBaseData.map(entry => ({
      ...entry,
      createdBy: systemUser._id,
      active: true,
      usageCount: 0
    }));

    await ChatbotKnowledge.insertMany(knowledgeEntries);
    console.log(`Successfully seeded ${knowledgeEntries.length} knowledge base entries`);

    // Create text indexes for better search
    await ChatbotKnowledge.collection.createIndex({
      question: 'text',
      answer: 'text',
      keywords: 'text'
    }, {
      weights: {
        question: 10,
        keywords: 5,
        answer: 1
      },
      name: 'knowledge_text_search'
    });
    console.log('Created text search indexes');

    console.log('Knowledge base seeding completed successfully!');
    
  } catch (error) {
    console.error('Error seeding knowledge base:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seeding function if this file is executed directly
if (require.main === module) {
  require('dotenv').config();
  seedKnowledgeBase();
}

module.exports = seedKnowledgeBase;