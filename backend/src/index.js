require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Models
const bikeSchema = new mongoose.Schema({
  model: String,
  location: String,
  available: Boolean,
  partnerId: mongoose.Schema.Types.ObjectId,
  condition: String,
  images: [String],
});
const Bike = mongoose.model('Bike', bikeSchema);

const partnerSchema = new mongoose.Schema({
  name: String,
  address: String,
  contact: String,
  rating: Number,
});
const Partner = mongoose.model('Partner', partnerSchema);

const bookingSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  bikeId: mongoose.Schema.Types.ObjectId,
  startDate: Date,
  endDate: Date,
  pickupLocation: String,
  dropoffLocation: String,
  status: String,
  total: Number,
});
const Booking = mongoose.model('Booking', bookingSchema);

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  password: String, // In production, hash this!
  language: String,
});
const User = mongoose.model('User', userSchema);

// RESTful API Endpoints
// Bikes
app.get('/api/bikes', async (req, res) => {
  const bikes = await Bike.find();
  res.json(bikes);
});

app.post('/api/bikes', async (req, res) => {
  const bike = new Bike(req.body);
  await bike.save();
  res.status(201).json(bike);
});

// Partners
app.get('/api/partners', async (req, res) => {
  const partners = await Partner.find();
  res.json(partners);
});

app.post('/api/partners', async (req, res) => {
  const partner = new Partner(req.body);
  await partner.save();
  res.status(201).json(partner);
});

// Bookings
app.get('/api/bookings', async (req, res) => {
  const bookings = await Booking.find();
  res.json(bookings);
});

app.post('/api/bookings', async (req, res) => {
  const booking = new Booking(req.body);
  await booking.save();
  res.status(201).json(booking);
});

// Users
app.get('/api/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.post('/api/users', async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.status(201).json(user);
});

// Health check
app.get('/', (req, res) => {
  res.send('Cycle.LK backend is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
