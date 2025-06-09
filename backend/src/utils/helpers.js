/**
 * Generate a unique booking number
 * @param {string} prefix - Prefix for the booking number (e.g., 'CL')
 * @param {number} count - The current number of bookings
 * @returns {string} A unique booking number
 */
exports.generateBookingNumber = (prefix = 'CL', count) => {
  const year = new Date().getFullYear();
  return `${prefix}${year}${(count + 1).toString().padStart(3, '0')}`;
};

/**
 * Generate a simple QR code string (in a real app, this would be more complex)
 * @param {string} bookingId - The ID of the booking
 * @returns {string} A unique QR code string
 */
exports.generateQRCode = (bookingId) => {
  return `QR${bookingId.substring(0, 6)}${Date.now().toString().substring(7)}`;
};

/**
 * Format price with currency
 * @param {number} price - The price value
 * @param {string} currency - The currency code (USD, EUR, etc.)
 * @returns {string} Formatted price with currency symbol
 */
exports.formatPrice = (price, currency = 'USD') => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  });
  return formatter.format(price);
};

/**
 * Calculate the number of days between two dates
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {number} Number of days
 */
exports.calculateDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Calculate booking price based on rental package and duration
 * @param {Object} bike - The bike object with pricing
 * @param {string} packageType - The package type (day, week, month)
 * @param {number} duration - Duration in days
 * @returns {Object} Pricing details
 */
exports.calculateBookingPrice = (bike, packageType, duration) => {
  let basePrice = 0;
  const pricing = bike.pricing;

  switch (packageType) {
    case 'day':
      basePrice = pricing.perDay * duration;
      break;
    case 'week':
      const weeks = Math.ceil(duration / 7);
      basePrice = pricing.perWeek * weeks;
      break;
    case 'month':
      const months = Math.ceil(duration / 30);
      basePrice = pricing.perMonth * months;
      break;
    default:
      basePrice = pricing.perDay * duration;
  }

  // Default insurance is 10% of base price
  const insurance = basePrice * 0.1;
  
  return {
    basePrice,
    insurance,
    extras: 0,
    discount: 0,
    total: basePrice + insurance
  };
};
