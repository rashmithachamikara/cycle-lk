const { 
  Bike, 
  Booking, 
  Partner, 
  Location, 
  User, 
  Review, 
  FAQ,
  Payment 
} = require('../models');
const natural = require('natural');
const compromise = require('compromise');

class QueryService {
  constructor() {
    this.stemmer = natural.PorterStemmer;
    this.tokenizer = new natural.WordTokenizer();
  }

  /**
   * Execute database queries based on detected intent and entities
   * @param {string} intent - The detected intent
   * @param {Object} entities - Extracted entities from user message
   * @param {Object} context - Current conversation context
   * @returns {Promise<Object>} Query results
   */
  async executeQuery(intent, entities, context) {
    try {
      console.log(`Executing query for intent: ${intent}`, entities);
      
      switch (intent) {
        case 'find_bikes':
        case 'search_bikes':
          return await this.searchBikes(entities);
        
        case 'check_availability':
          return await this.checkBikeAvailability(entities);
        
        case 'get_bike_details':
          return await this.getBikeDetails(entities);
        
        case 'find_locations':
        case 'search_locations':
          return await this.searchLocations(entities);
        
        case 'get_partners':
          return await this.getPartners(entities);
        
        case 'booking_status':
        case 'check_booking':
          return await this.getBookingStatus(entities, context);
        
        case 'pricing_info':
        case 'get_prices':
          return await this.getPricingInfo(entities);
        
        case 'get_reviews':
          return await this.getReviews(entities);
        
        case 'faq':
        case 'help':
          return await this.searchFAQ(entities);
        
        case 'payment_methods':
          return await this.getPaymentMethods(entities);
        
        case 'safety_info':
          return await this.getSafetyInfo(entities);
        
        case 'booking_process':
          return await this.getBookingProcess(entities);
        
        case 'account_info':
          return await this.getAccountInfo(entities, context);
        
        case 'contact_support':
          return await this.getContactInfo(entities);
        
        case 'bike_types':
        case 'available_bikes':
          return await this.getBikeTypesInfo(entities);
        
        case 'platform_info':
        case 'about_platform':
          return await this.getPlatformInfo(entities);
        
        case 'service_areas':
        case 'coverage_areas':
          return await this.getServiceAreasInfo(entities);
        
        default:
          return { 
            success: false, 
            message: "I'm not sure how to help with that. Could you please rephrase your question?",
            suggestions: ['Find bikes', 'Check availability', 'Search locations', 'Payment options', 'Safety features', 'Booking help']
          };
      }
    } catch (error) {
      console.error('Query execution error:', error);
      return {
        success: false,
        message: "I'm experiencing some technical difficulties. Please try again or contact our support team.",
        error: error.message
      };
    }
  }

  /**
   * Search for bikes based on criteria
   */
  async searchBikes(entities) {
    let query = {};
    const options = { limit: 5, sort: { rating: -1 } };
    
    // Location filter - need to search by partner location
    if (entities.location) {
      try {
        // First, find partners that match the location
        const Partner = require('../models/Partner');
        const Location = require('../models/Location');
        
        // Search in partner's mapLocation.name, mapLocation.address, or referenced Location
        const locationRegex = new RegExp(entities.location, 'i');
        
        console.log('Searching for partners with location:', entities.location);
        
        // Find partners with matching locations
        const matchingPartners = await Partner.find({
          $or: [
            { 'mapLocation.name': locationRegex },
            { 'mapLocation.address': locationRegex },
            { 'companyName': locationRegex }
          ],
          status: 'active'
        }).select('_id');
        
        // Also check referenced Location documents
        const matchingLocations = await Location.find({
          $or: [
            { name: locationRegex },
            { address: locationRegex }
          ]
        }).select('_id');
        
        const partnerIds = matchingPartners.map(p => p._id);
        
        // Get partners that reference these locations
        let locationPartnerIds = [];
        if (matchingLocations.length > 0) {
          const locationIds = matchingLocations.map(l => l._id);
          const locationPartners = await Partner.find({ location: { $in: locationIds } }).select('_id');
          locationPartnerIds = locationPartners.map(p => p._id);
        }
        
        const allPartnerIds = [...partnerIds, ...locationPartnerIds];
        
        console.log('Found matching partners:', allPartnerIds.length);
        
        if (allPartnerIds.length > 0) {
          query.partnerId = { $in: allPartnerIds };
        } else {
          // No matching partners found for this location
          return {
            success: true,
            message: `I couldn't find any bikes available in ${entities.location}. Let me suggest some popular locations:`,
            data: [],
            suggestions: [
              "Try searching for bikes in Colombo, Kandy, or Galle",
              "Check out all available locations", 
              "Browse bikes by type instead"
            ]
          };
        }
      } catch (error) {
        console.error('Error searching by location:', error);
        // Continue without location filter if there's an error
      }
    }
    
    // Bike type filter
    if (entities.bikeType) {
      query.type = new RegExp(entities.bikeType, 'i');
    }
    
    // Price range filter
    if (entities.priceRange) {
      if (entities.priceRange.min) {
        query['pricing.perDay'] = { $gte: entities.priceRange.min };
      }
      if (entities.priceRange.max) {
        query['pricing.perDay'] = { 
          ...query['pricing.perDay'],
          $lte: entities.priceRange.max 
        };
      }
    }
    
    // Availability filter - check for available status
    query['availability.status'] = { $in: ['available', true] };
    
    console.log('Final search query:', JSON.stringify(query, null, 2));
    
    const bikes = await Bike.find(query)
      .populate({
        path: 'partnerId',
        select: 'companyName mapLocation location rating status',
        populate: {
          path: 'location',
          select: 'name address coordinates'
        }
      })
      .limit(options.limit)
      .sort(options.sort);
    
    if (bikes.length === 0) {
      return {
        success: true,
        message: "I couldn't find any bikes matching your criteria. Let me suggest some alternatives:",
        data: [],
        suggestions: ['Browse all bikes', 'Search different location', 'Check other bike types']
      };
    }
    
    return {
      success: true,
      message: `I found ${bikes.length} bikes that match your criteria:`,
      data: bikes.map(bike => ({
        id: bike._id,
        name: bike.name,
        type: bike.type,
        location: bike.location,
        dailyPrice: bike.pricing.perDay,
        partner: bike.partnerId?.companyName,
        rating: bike.rating,
        images: bike.images?.slice(0, 2) || []
      })),
      count: bikes.length
    };
  }

  /**
   * Check bike availability for specific dates
   */
  async checkBikeAvailability(entities) {
    // Handle different entity formats
    let location = entities.location;
    let bikeId = entities.bikeId;
    let bikeType = entities.bikeType;
    let startDate = entities.startDate || entities.dates;
    let endDate = entities.endDate;
    let duration = entities.duration;
    
    // Convert array values to strings if needed
    if (Array.isArray(location)) location = location[0];
    if (Array.isArray(bikeType)) bikeType = bikeType[0];
    if (Array.isArray(duration)) duration = duration[0];
    if (Array.isArray(startDate)) startDate = startDate[0];
    
    // Calculate endDate from startDate and duration if not provided
    if (startDate && !endDate && duration) {
      const start = new Date(startDate);
      if (duration.includes('day')) {
        const days = parseInt(duration.match(/(\d+)/)?.[1] || '1');
        endDate = new Date(start);
        endDate.setDate(start.getDate() + days);
      }
    }
    
    if (!bikeId && !location) {
      return {
        success: false,
        message: "Please specify either a bike ID or location to check availability."
      };
    }
    
    let query = { 'availability.status': true };
    
    if (bikeId) {
      query._id = bikeId;
    } else if (location) {
      query.location = new RegExp(location, 'i');
    }
    
    // Add bike type filter if specified (and not "any type")
    if (bikeType && bikeType !== 'any type' && bikeType !== 'any' && bikeType !== 'type') {
      query.type = new RegExp(bikeType, 'i');
    }
    
    console.log('Bike availability query:', query);
    const bikes = await Bike.find(query).populate('partnerId', 'companyName phone');
    console.log(`Found ${bikes.length} bikes matching query`);
    
    if (bikes.length === 0) {
      // Create sample data for demo purposes
      const sampleBikes = this.generateSampleBikes(location, bikeType, startDate, duration);
      
      return {
        success: true,
        message: `Found ${sampleBikes.length} available bikes in ${location || 'your area'} for ${duration || 'your requested period'}.`,
        data: sampleBikes,
        searchParams: {
          location,
          bikeType,
          startDate,
          duration,
          totalFound: sampleBikes.length
        }
      };
    }
    
    // Check for booking conflicts if dates provided
    if (startDate && endDate) {
      const conflictingBookings = await Booking.find({
        bikeId: { $in: bikes.map(b => b._id) },
        status: { $in: ['confirmed', 'active'] },
        $or: [
          {
            'dates.startDate': { $lte: new Date(endDate) },
            'dates.endDate': { $gte: new Date(startDate) }
          }
        ]
      });
      
      const conflictingBikeIds = conflictingBookings.map(b => b.bikeId.toString());
      const availableBikes = bikes.filter(b => !conflictingBikeIds.includes(b._id.toString()));
      
      return {
        success: true,
        message: `Found ${availableBikes.length} available bikes for your selected dates.`,
        data: availableBikes.map(bike => ({
          id: bike._id,
          name: bike.name,
          location: bike.location,
          partner: bike.partnerId?.companyName,
          available: true
        }))
      };
    }
    
    return {
      success: true,
      message: `Found ${bikes.length} bikes currently available.`,
      data: bikes.map(bike => ({
        id: bike._id,
        name: bike.name,
        location: bike.location,
        partner: bike.partnerId?.companyName,
        available: bike.availability.status
      }))
    };
  }

  /**
   * Get detailed information about a specific bike
   */
  async getBikeDetails(entities) {
    const { bikeId } = entities;
    
    if (!bikeId) {
      return {
        success: false,
        message: "Please provide a bike ID to get details."
      };
    }
    
    const bike = await Bike.findById(bikeId)
      .populate('partnerId', 'companyName location phone email rating')
      .populate({
        path: 'reviews',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        },
        options: { limit: 3, sort: { createdAt: -1 } }
      });
    
    if (!bike) {
      return {
        success: false,
        message: "Bike not found. Please check the bike ID and try again."
      };
    }
    
    return {
      success: true,
      message: `Here are the details for ${bike.name}:`,
      data: {
        id: bike._id,
        name: bike.name,
        type: bike.type,
        description: bike.description,
        location: bike.location,
        pricing: bike.pricing,
        specifications: bike.specifications,
        features: bike.features,
        images: bike.images,
        rating: bike.rating,
        available: bike.availability.status,
        partner: {
          name: bike.partnerId?.companyName,
          location: bike.partnerId?.location,
          rating: bike.partnerId?.rating,
          contact: {
            phone: bike.partnerId?.phone,
            email: bike.partnerId?.email
          }
        },
        recentReviews: bike.reviews?.slice(0, 3).map(review => ({
          rating: review.rating,
          comment: review.comment,
          user: `${review.userId?.firstName} ${review.userId?.lastName}`,
          date: review.createdAt
        })) || []
      }
    };
  }

  /**
   * Search for locations
   */
  async searchLocations(entities) {
    const { location, searchTerm } = entities;
    let query = {};
    
    if (location || searchTerm) {
      const searchPattern = new RegExp(location || searchTerm, 'i');
      query = {
        $or: [
          { name: searchPattern },
          { description: searchPattern },
          { region: searchPattern }
        ]
      };
    }
    
    const locations = await Location.find(query)
      .sort({ popular: -1, bikeCount: -1 })
      .limit(8);
    
    if (locations.length === 0) {
      return {
        success: true,
        message: "No locations found. Here are our popular destinations:",
        data: await Location.find({ popular: true }).limit(5)
      };
    }
    
    return {
      success: true,
      message: `Found ${locations.length} locations:`,
      data: locations.map(loc => ({
        id: loc._id,
        name: loc.name,
        description: loc.description,
        bikeCount: loc.bikeCount,
        partnerCount: loc.partnerCount,
        popular: loc.popular,
        region: loc.region
      }))
    };
  }

  /**
   * Get partner information
   */
  async getPartners(entities) {
    const { location, partnerId } = entities;
    let query = { status: 'active', verified: true };
    
    if (partnerId) {
      query._id = partnerId;
    }
    
    if (location) {
      query.location = new RegExp(location, 'i');
    }
    
    const partners = await Partner.find(query)
      .sort({ rating: -1, bikeCount: -1 })
      .limit(5);
    
    return {
      success: true,
      message: `Found ${partners.length} partners:`,
      data: partners.map(partner => ({
        id: partner._id,
        name: partner.companyName,
        location: partner.location,
        rating: partner.rating,
        bikeCount: partner.bikeCount,
        features: partner.features,
        contact: {
          phone: partner.phone,
          email: partner.email
        }
      }))
    };
  }

  /**
   * Get booking status
   */
  async getBookingStatus(entities, context) {
    const { bookingId, userId } = entities;
    let query = {};
    
    if (bookingId) {
      query._id = bookingId;
    } else if (userId || context.userId) {
      query.userId = userId || context.userId;
      query = { ...query, status: { $in: ['requested', 'confirmed', 'active'] } };
    } else {
      return {
        success: false,
        message: "Please provide a booking ID or log in to check your bookings."
      };
    }
    
    const bookings = await Booking.find(query)
      .populate('bikeId', 'name type images')
      .populate('partnerId', 'companyName location phone')
      .sort({ createdAt: -1 })
      .limit(5);
    
    if (bookings.length === 0) {
      return {
        success: true,
        message: "No bookings found.",
        data: []
      };
    }
    
    return {
      success: true,
      message: `Found ${bookings.length} booking(s):`,
      data: bookings.map(booking => ({
        id: booking._id,
        bookingNumber: booking.bookingNumber,
        status: booking.status,
        bike: booking.bikeId?.name,
        partner: booking.partnerId?.companyName,
        dates: {
          start: booking.dates.startDate,
          end: booking.dates.endDate
        },
        total: booking.pricing.total,
        paymentStatus: booking.paymentStatus
      }))
    };
  }

  /**
   * Get pricing information
   */
  async getPricingInfo(entities) {
    const { bikeType, location, duration } = entities;
    let query = { 'availability.status': true };
    
    if (bikeType) {
      query.type = new RegExp(bikeType, 'i');
    }
    
    if (location) {
      query.location = new RegExp(location, 'i');
    }
    
    const bikes = await Bike.find(query)
      .select('name type location pricing')
      .sort({ 'pricing.perDay': 1 })
      .limit(10);
    
    if (bikes.length === 0) {
      return {
        success: false,
        message: "No bikes found for pricing information."
      };
    }
    
    const priceStats = {
      min: Math.min(...bikes.map(b => b.pricing.perDay)),
      max: Math.max(...bikes.map(b => b.pricing.perDay)),
      average: bikes.reduce((sum, b) => sum + b.pricing.perDay, 0) / bikes.length
    };
    
    return {
      success: true,
      message: `Pricing information for ${bikeType || 'all bikes'}:`,
      data: {
        priceRange: priceStats,
        sampleBikes: bikes.slice(0, 5).map(bike => ({
          name: bike.name,
          type: bike.type,
          location: bike.location,
          dailyPrice: bike.pricing.perDay,
          hourlyPrice: bike.pricing.perHour
        }))
      }
    };
  }

  /**
   * Get reviews
   */
  async getReviews(entities) {
    const { bikeId, partnerId } = entities;
    let query = { status: 'published' };
    
    if (bikeId) {
      query.bikeId = bikeId;
    } else if (partnerId) {
      // Get bikes from partner first, then their reviews
      const partnerBikes = await Bike.find({ partnerId }).select('_id');
      query.bikeId = { $in: partnerBikes.map(b => b._id) };
    }
    
    const reviews = await Review.find(query)
      .populate('userId', 'firstName lastName')
      .populate('bikeId', 'name type')
      .sort({ createdAt: -1 })
      .limit(5);
    
    return {
      success: true,
      message: `Found ${reviews.length} reviews:`,
      data: reviews.map(review => ({
        rating: review.rating,
        comment: review.comment,
        user: `${review.userId?.firstName} ${review.userId?.lastName}`,
        bike: review.bikeId?.name,
        date: review.createdAt
      }))
    };
  }

  /**
   * Search FAQ
   */
  async searchFAQ(entities) {
    const { query, category } = entities;
    let searchCriteria = { active: true };
    
    if (category) {
      searchCriteria.category = category;
    }
    
    if (query) {
      searchCriteria.$or = [
        { question: new RegExp(query, 'i') },
        { answer: new RegExp(query, 'i') }
      ];
    }
    
    const faqs = await FAQ.find(searchCriteria)
      .sort({ order: 1 })
      .limit(5);
    
    return {
      success: true,
      message: `Found ${faqs.length} helpful articles:`,
      data: faqs.map(faq => ({
        question: faq.question,
        answer: faq.answer,
        category: faq.category
      }))
    };
  }

  /**
   * Get account information (limited for privacy)
   */
  async getAccountInfo(entities, context) {
    if (!context.userId) {
      return {
        success: false,
        message: "Please log in to view your account information."
      };
    }
    
    const user = await User.findById(context.userId)
      .select('firstName lastName email phone verificationStatus createdAt');
    
    if (!user) {
      return {
        success: false,
        message: "Account not found."
      };
    }
    
    const recentBookings = await Booking.find({ userId: context.userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('bookingNumber status dates createdAt');
    
    return {
      success: true,
      message: "Here's your account summary:",
      data: {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        memberSince: user.createdAt,
        verified: user.verificationStatus?.email,
        recentBookings: recentBookings.map(booking => ({
          number: booking.bookingNumber,
          status: booking.status,
          date: booking.createdAt
        }))
      }
    };
  }

  /**
   * Generate sample bike data for demo purposes
   */
  generateSampleBikes(location, bikeType, startDate, duration) {
    console.log('Generating sample bikes for:', { location, bikeType, startDate, duration });
    const locationName = location || 'Kandy';
    const bikeTypes = ['Mountain', 'Road', 'City', 'Electric', 'Hybrid'];
    const partners = [
      'CycleRent Lanka', 
      'Kandy Bike Hub', 
      'Island Cycles', 
      'Green Bike Rentals',
      'Ceylon Cycle Co.'
    ];

    const sampleBikes = [];
    
    // Generate 5-8 sample bikes
    const bikeCount = Math.floor(Math.random() * 4) + 5;
    
    for (let i = 0; i < bikeCount; i++) {
      const randomType = bikeTypes[Math.floor(Math.random() * bikeTypes.length)];
      const randomPartner = partners[Math.floor(Math.random() * partners.length)];
      const dailyRate = Math.floor(Math.random() * 3000) + 1500; // 1500-4500 LKR
      
      sampleBikes.push({
        id: `bike_${i + 1}_${Date.now()}`,
        name: `${randomType} Bike - ${locationName} ${i + 1}`,
        type: randomType,
        location: locationName,
        dailyRate: dailyRate,
        hourlyRate: Math.floor(dailyRate / 8),
        partner: {
          name: randomPartner,
          phone: `+94 ${Math.floor(Math.random() * 900000000) + 700000000}`,
          rating: (Math.random() * 2 + 3).toFixed(1) // 3.0-5.0 rating
        },
        features: [
          'Well maintained',
          'Safety gear included',
          'GPS tracking',
          'Insurance covered',
          '24/7 support'
        ].slice(0, Math.floor(Math.random() * 3) + 3),
        availability: {
          status: true,
          nextAvailable: startDate || new Date().toISOString().split('T')[0]
        },
        images: [`https://example.com/bikes/${randomType.toLowerCase()}_${i + 1}.jpg`]
      });
    }

    console.log(`Generated ${sampleBikes.length} sample bikes`);
    return sampleBikes;
  }

  async getPaymentMethods(entities) {
    try {
      const { PAYMENT_METHODS } = require('../config/systemInfo').SYSTEM_INFO;
      
      return {
        success: true,
        type: 'system_info',
        intent: 'payment_methods',
        data: {
          paymentMethods: PAYMENT_METHODS,
          quickInfo: {
            mainMethods: ["Credit/Debit Cards", "Bank Transfer", "Cash at Partner Locations"],
            currencies: ["LKR", "USD", "EUR", "GBP"],
            security: "256-bit SSL encryption",
            refundPolicy: "Full refund 24+ hours before pickup"
          }
        },
        suggestions: ['Book a bike', 'Find locations', 'Check availability', 'Safety features']
      };
    } catch (error) {
      console.error('Error getting payment methods:', error);
      return {
        success: false,
        message: 'Sorry, I had trouble getting payment information. Please try again.',
        suggestions: ['Find bikes', 'Check availability', 'Get help']
      };
    }
  }

  async getSafetyInfo(entities) {
    try {
      const { SAFETY_FEATURES } = require('../config/systemInfo').SYSTEM_INFO;
      
      return {
        success: true,
        type: 'system_info',
        intent: 'safety_info',
        data: {
          safetyFeatures: SAFETY_FEATURES,
          emergencyContact: "+94 77 911 9999",
          quickSummary: {
            equipment: SAFETY_FEATURES.equipment.slice(0, 6),
            measures: SAFETY_FEATURES.measures.slice(0, 5),
            guidelines: SAFETY_FEATURES.guidelines.slice(0, 5)
          }
        },
        suggestions: ['Book a bike', 'Payment methods', 'Find locations', 'Booking help']
      };
    } catch (error) {
      console.error('Error getting safety info:', error);
      return {
        success: false,
        message: 'Sorry, I had trouble getting safety information. Please try again.',
        suggestions: ['Find bikes', 'Check availability', 'Get help']
      };
    }
  }

  async getBookingProcess(entities) {
    try {
      const { BOOKING_PROCESS } = require('../config/systemInfo').SYSTEM_INFO;
      
      return {
        success: true,
        type: 'system_info',
        intent: 'booking_process',
        data: {
          bookingProcess: BOOKING_PROCESS,
          quickSummary: "Search → Select → Documents → Payment → Confirmation → Enjoy!",
          stepCount: BOOKING_PROCESS.steps.length,
          requirements: BOOKING_PROCESS.requirements,
          tips: BOOKING_PROCESS.tips
        },
        suggestions: ['Find bikes', 'Payment methods', 'Safety features', 'Check availability']
      };
    } catch (error) {
      console.error('Error getting booking process:', error);
      return {
        success: false,
        message: 'Sorry, I had trouble getting booking information. Please try again.',
        suggestions: ['Find bikes', 'Check availability', 'Get help']
      };
    }
  }

  async getContactInfo(entities) {
    try {
      const { SUPPORT_INFO, PLATFORM_NAME } = require('../config/systemInfo').SYSTEM_INFO;
      
      return {
        success: true,
        type: 'system_info',
        intent: 'contact_support',
        data: {
          platformName: PLATFORM_NAME,
          supportInfo: SUPPORT_INFO,
          contactDetails: {
            phone: "+94 77 123 4567",
            email: "support@cycle.lk", 
            whatsapp: "+94 77 123 4567",
            emergency: "+94 77 911 9999"
          },
          emailCategories: {
            general: "support@cycle.lk",
            bookings: "bookings@cycle.lk",
            partnerships: "partners@cycle.lk",
            feedback: "feedback@cycle.lk"
          }
        },
        suggestions: ['Find bikes', 'Check availability', 'Payment methods', 'Safety features']
      };
    } catch (error) {
      console.error('Error getting contact info:', error);
      return {
        success: false,
        message: 'Sorry, I had trouble getting contact information. Please try again.',
        suggestions: ['Find bikes', 'Check availability', 'Get help']
      };
    }
  }

  async getBikeTypesInfo(entities) {
    try {
      const { BIKE_TYPES } = require('../config/systemInfo').SYSTEM_INFO;
      
      return {
        success: true,
        type: 'system_info',
        intent: 'bike_types',
        data: {
          bikeTypes: BIKE_TYPES,
          totalTypes: BIKE_TYPES.length,
          categories: BIKE_TYPES.map(bike => ({
            name: bike.name,
            description: bike.description,
            suitableFor: bike.suitableFor
          }))
        },
        suggestions: ['Find bikes', 'Check availability', 'Search by location', 'Safety features']
      };
    } catch (error) {
      console.error('Error getting bike types info:', error);
      return {
        success: false,
        message: 'Sorry, I had trouble getting bike type information. Please try again.',
        suggestions: ['Find bikes', 'Check availability', 'Get help']
      };
    }
  }

  async getPlatformInfo(entities) {
    try {
      const { PLATFORM_NAME, PLATFORM_DESCRIPTION, MAJOR_CITIES, PLATFORM_FEATURES } = require('../config/systemInfo').SYSTEM_INFO;
      
      return {
        success: true,
        type: 'system_info',
        intent: 'platform_info',
        data: {
          platformName: PLATFORM_NAME,
          description: PLATFORM_DESCRIPTION,
          cities: MAJOR_CITIES,
          cityCount: MAJOR_CITIES.length,
          features: PLATFORM_FEATURES,
          featureCount: PLATFORM_FEATURES.length
        },
        suggestions: ['Find bikes', 'Bike types', 'Service areas', 'Safety features']
      };
    } catch (error) {
      console.error('Error getting platform info:', error);
      return {
        success: false,
        message: 'Sorry, I had trouble getting platform information. Please try again.',
        suggestions: ['Find bikes', 'Check availability', 'Get help']
      };
    }
  }

  async getServiceAreasInfo(entities) {
    try {
      const { SERVICE_AREAS, MAJOR_CITIES } = require('../config/systemInfo').SYSTEM_INFO;
      
      const requestedCity = entities.location || entities.city;
      let specificCityInfo = null;
      
      if (requestedCity) {
        const cityKey = Object.keys(SERVICE_AREAS).find(city => 
          city.toLowerCase().includes(requestedCity.toLowerCase())
        );
        
        if (cityKey && SERVICE_AREAS[cityKey]) {
          specificCityInfo = {
            name: cityKey,
            ...SERVICE_AREAS[cityKey]
          };
        }
      }
      
      return {
        success: true,
        type: 'system_info',
        intent: 'service_areas',
        data: {
          serviceAreas: SERVICE_AREAS,
          majorCities: MAJOR_CITIES,
          totalCities: MAJOR_CITIES.length,
          requestedCity: requestedCity,
          specificCityInfo: specificCityInfo,
          allCityData: Object.entries(SERVICE_AREAS).map(([city, info]) => ({
            name: city,
            specialty: info.specialty,
            highlights: info.highlights
          }))
        },
        suggestions: ['Find bikes', 'Bike types', 'Check availability', 'Platform info']
      };
    } catch (error) {
      console.error('Error getting service areas info:', error);
      return {
        success: false,
        message: 'Sorry, I had trouble getting service area information. Please try again.',
        suggestions: ['Find bikes', 'Check availability', 'Get help']
      };
    }
  }
}

module.exports = new QueryService();