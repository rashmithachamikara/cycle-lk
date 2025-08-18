require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Import models
const models = require('./models');

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cycle-lk')
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Define API routes
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const bikeRoutes = require('./routes/bikeRoutes');
const partnerRoutes = require('./routes/partnerRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const locationRoutes = require('./routes/locationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const supportRoutes = require('./routes/supportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const faqRoutes = require('./routes/faqRoutes');
const uploadRoutes = require('./routes/uploadRoutes'); //cloudinary upload routes
const eventRoutes = require('./routes/eventRoutes'); // real-time event routes

// Use API routes
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bikes', bikeRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/upload', uploadRoutes); // cloudinary upload routes
app.use('/api/events', eventRoutes); // real-time event routes

// Health check endpoint
app.get('/', (req, res) => {
  res.send({
    status: 'ok',
    message: 'Cycle.LK API is running',
    version: '1.0.0',
    timestamp: new Date()
  });
});

// Import error handlers
const { notFound, errorHandler } = require('./middleware/errorHandler');

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

//Start server
function startServer(port) {
  const server = app.listen(port);
  
  // Handle server ready
  server.on('listening', () => {
    const address = server.address();
    if (address) {
      const actualPort = address.port;
      console.log(`🚲 Cycle.LK API Server running on port ${actualPort}`);
      console.log(`🌐 Server URL: http://${HOST}:${actualPort}`);
    } else {
      console.log(`🚲 Cycle.LK API Server running, but address information is not available`);
    }
  });
  
  // Handle server errors
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️ Port ${port} is already in use, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
  
  return server;
}

startServer(PORT);
