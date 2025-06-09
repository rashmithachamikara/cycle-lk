module.exports = {
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/cycle-lk',
  jwtSecret: process.env.JWT_SECRET || 'cycle-lk-secret-key',
  jwtExpiration: '24h'
};
