# Cycle.LK Backend API

This is the backend API for the Cycle.LK bike rental platform. It provides a comprehensive RESTful API for managing bikes, bookings, users, partners, and more.

## Database Structure

The database uses MongoDB and consists of the following collections:

1. **Users** - User accounts and profiles
2. **Partners** - Bike rental businesses
3. **Bikes** - Available bikes for rent
4. **Bookings** - Bike rental reservations
5. **Locations** - Cities and areas where bikes are available
6. **Payments** - Payment records for bookings
7. **Reviews** - User reviews for bikes and partners
8. **Notifications** - User notifications
9. **Support** - Customer support tickets
10. **PaymentMethods** - Saved payment methods
11. **FAQ** - Frequently asked questions

For detailed schema information, see the `database-structure.md` file in the project root.

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Express middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # Express routes
│   ├── utils/          # Utility functions
│   └── index.js        # Entry point
├── uploads/            # Uploaded files
├── .env                # Environment variables
└── package.json        # Dependencies
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB

### Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Configure environment variables in `.env`:
   ```
   MONGODB_URI=your_mongodb_connection_string
   PORT=5000
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRATION=30d
   ```

3. Run the server:
   ```
   npm run dev
   ```

## API Documentation

Detailed API documentation can be found in the `API_DOCS.md` file.

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Register a user
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user

### Bikes
- `GET /api/bikes` - Get all bikes
- `GET /api/bikes/:id` - Get bike by ID
- `POST /api/bikes` - Add a new bike
- `PUT /api/bikes/:id` - Update a bike
- `DELETE /api/bikes/:id` - Delete a bike

### Partners
- `GET /api/partners` - Get all partners
- `GET /api/partners/:id` - Get partner by ID
- `POST /api/partners` - Register a new partner
- `PUT /api/partners/:id` - Update partner profile
- `DELETE /api/partners/:id` - Delete partner profile

### Bookings
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/:id` - Get booking by ID
- `POST /api/bookings` - Create a new booking
- `PUT /api/bookings/:id` - Update booking status
- `DELETE /api/bookings/:id` - Cancel a booking

### Locations
- `GET /api/locations` - Get all locations
- `GET /api/locations/:id` - Get location by ID
- `POST /api/locations` - Create a new location
- `PUT /api/locations/:id` - Update a location
- `DELETE /api/locations/:id` - Delete a location

### Payments
- `GET /api/payments` - Get all payments
- `GET /api/payments/:id` - Get payment by ID
- `POST /api/payments` - Process a new payment
- `PUT /api/payments/:id/refund` - Process a refund

### Reviews
- `GET /api/reviews` - Get all reviews
- `GET /api/reviews/:id` - Get review by ID
- `POST /api/reviews` - Create a new review
- `PUT /api/reviews/:id` - Update a review
- `PUT /api/reviews/:id/helpful` - Mark a review as helpful
- `DELETE /api/reviews/:id` - Delete a review

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread-count/:userId` - Get count of unread notifications
- `GET /api/notifications/:id` - Get notification by ID
- `POST /api/notifications` - Create a new notification
- `PUT /api/notifications/:id/mark-read` - Mark a notification as read
- `PUT /api/notifications/mark-all-read` - Mark all notifications as read
- `DELETE /api/notifications/:id` - Delete a notification

### Support
- `GET /api/support` - Get all support tickets
- `GET /api/support/:id` - Get support ticket by ID
- `POST /api/support` - Create a new support ticket
- `PUT /api/support/:id` - Update a support ticket
- `POST /api/support/:id/response` - Add a response to a ticket
- `PUT /api/support/:id/resolve` - Resolve a support ticket
- `PUT /api/support/:id/assign` - Assign a support ticket

### FAQs
- `GET /api/faqs` - Get all FAQs
- `GET /api/faqs/:id` - Get FAQ by ID
- `POST /api/faqs` - Create a new FAQ
- `PUT /api/faqs/:id` - Update an FAQ
- `PUT /api/faqs/:id/order` - Update an FAQ's order
- `DELETE /api/faqs/:id` - Delete an FAQ
