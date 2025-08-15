# Payment System Implementation Guide

## Overview
This document describes the implementation of a comprehensive payment system for the Cycle.LK bike booking platform, including real-time notifications to partners when payments are completed.

## Features Implemented

### 1. User Dashboard Payments Section
- **Location**: `src/components/DashboardPage/PaymentsSection.tsx`
- **Functionality**: 
  - Displays all bookings requiring payment (status: 'confirmed')
  - Shows pending payment notifications prominently
  - Allows users to pay directly from the dashboard
  - Real-time updates when bookings are accepted

### 2. Payment Service Integration
- **Location**: `src/services/paymentService.ts`
- **Key Methods**:
  - `getPendingPayments()`: Fetches bookings requiring payment
  - `processInitialPayment()`: Handles payment processing
  - Enhanced with new interfaces for payment workflow

### 3. Enhanced Dashboard
- **Location**: `src/pages/DashboardPage.tsx`
- **New Features**:
  - Added "Payments" tab to main navigation
  - Prominent payment alert banner when payments are pending
  - Real-time notification integration
  - Automatic refresh when payment events occur

### 4. Backend Payment Processing
- **Location**: `backend/src/controllers/paymentController.js`
- **New Endpoints**:
  - `GET /api/payments/pending`: Get pending payments for user
  - `POST /api/payments/initial`: Process initial payment
- **Real-time Integration**: Sends Firebase events to partners

## Workflow

### Payment Process Flow
1. **Booking Accepted**: Partner approves booking → status changes to 'confirmed'
2. **Payment Notification**: User sees payment alert in dashboard
3. **Payment Processing**: User clicks "Pay Now" → payment processed
4. **Status Update**: Booking status changes from 'confirmed' to 'active'
5. **Partner Notification**: Real-time event sent to partner dashboard

### Real-time Event Types
- `BOOKING_UPDATED`: When booking status changes
- `PAYMENT_COMPLETED`: When initial payment is processed

## UI Components

### PaymentsSection Component
```typescript
interface PaymentPendingBooking {
  id: string;
  bikeName: string;
  bikeImage?: string;
  partnerName: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  status: 'requested' | 'confirmed' | 'active';
  bookingNumber: string;
  dueDate?: string;
}
```

### Key Features
- **Visual Indicators**: Different styles for overdue/failed payments
- **Action Buttons**: Pay Now button with loading states
- **Booking Details**: Comprehensive booking information display
- **Status Tracking**: Clear payment status indicators

## Backend Implementation

### Payment Controller Methods
```javascript
// Get pending payments for current user
exports.getPendingPayments = async (req, res) => {
  // Returns confirmed bookings requiring payment
}

// Process initial payment
exports.processInitialPayment = async (req, res) => {
  // Validates booking, processes payment, updates status
  // Sends real-time notification to partner
}
```

### Database Updates
- **Booking Model**: Enhanced with payment tracking
- **Payment Status**: 'pending' → 'paid' workflow
- **Real-time Events**: Firebase integration for partner notifications

## Security Features
- **User Authorization**: Only booking owner can make payments
- **Booking Validation**: Ensures booking is in correct state
- **Transaction IDs**: Unique transaction tracking
- **Error Handling**: Comprehensive error responses

## Real-time Integration

### Firebase Events
When payment is completed, the system:
1. Updates booking status to 'active'
2. Creates Firebase event for partner
3. Partner dashboard receives real-time notification
4. Event includes payment details and customer information

### Event Structure
```javascript
{
  type: 'PAYMENT_COMPLETED',
  userId: partnerId.userId,
  data: {
    bookingId: booking._id,
    amount: paymentAmount,
    transactionId: generatedId,
    paymentMethod: 'card',
    customerName: 'User Name',
    timestamp: new Date().toISOString()
  }
}
```

## Testing the System

### 1. Create a Booking
- User creates a booking request
- Partner approves the booking (status: 'confirmed')

### 2. Payment Process
- User sees payment notification in dashboard
- Click "View Payments" or payment alert
- Click "Pay Now" on specific booking
- Payment processes successfully

### 3. Real-time Updates
- Partner dashboard receives payment notification
- User dashboard updates booking status to 'active'
- Both parties see updated information

## Configuration

### Environment Variables
Ensure these are set in backend:
- Firebase Admin SDK credentials
- Database connection
- Payment gateway configuration (if using real payments)

### Frontend Configuration
- Firebase config for real-time events
- API endpoints properly configured
- Authentication context working

## Future Enhancements

### Payment Gateway Integration
- Stripe/PayPal integration
- Multiple payment methods
- Recurring payments
- Payment scheduling

### Enhanced Notifications
- Email confirmations
- SMS notifications
- Push notifications
- Payment reminders

### Analytics
- Payment success rates
- Revenue tracking
- Partner earnings dashboard
- User payment history

## Troubleshooting

### Common Issues
1. **Payment Not Appearing**: Check booking status is 'confirmed'
2. **Real-time Events Not Working**: Verify Firebase configuration
3. **Payment Fails**: Check backend logs for detailed errors
4. **UI Not Updating**: Ensure real-time event hooks are working

### Debug Commands
```bash
# Check backend logs
cd backend && npm run dev

# Check frontend console
# Open browser dev tools → Console tab

# Verify Firebase connection
# Check network tab for Firebase requests
```

## API Documentation

### GET /api/payments/pending
**Description**: Get pending payments for current user
**Auth**: Required (User role)
**Response**: Array of pending payment bookings

### POST /api/payments/initial
**Description**: Process initial payment for booking
**Auth**: Required (User role)
**Body**:
```json
{
  "bookingId": "string",
  "amount": "number",
  "paymentMethod": "card|bank_transfer|mobile_payment",
  "paymentDetails": {
    "cardNumber": "string",
    "expiryDate": "string",
    "cvv": "string",
    "cardHolderName": "string"
  }
}
```

**Response**:
```json
{
  "success": true,
  "transactionId": "string",
  "paymentStatus": "completed",
  "message": "Payment processed successfully"
}
```

## Deployment Notes

### Production Considerations
- Use real payment gateway instead of simulation
- Implement proper payment security (PCI compliance)
- Add payment retry mechanisms
- Implement webhook handling for payment status updates
- Add comprehensive logging and monitoring

This payment system provides a complete solution for handling initial payments in the bike booking workflow with real-time partner notifications.
