# Partner Registration System

## Overview

The Partner Registration system allows local bike rental businesses in Sri Lanka to join the Cycle.LK platform. This creates a unified network where partners can list their bikes and tourists can rent bikes from one location and drop them off at another.

## Features Implemented

### 1. Partner Registration Page (`/partner-registration`)

- **Multi-step Registration Form**: 4-step process for comprehensive partner onboarding
- **Authentication Required**: Users must be logged in to register as partners
- **Comprehensive Data Collection**: Captures all necessary business information

#### Step 1: Company Information

- Company Name (required)
- Business Category (required) - Options include:
  - Bike Rental Shop
  - Tour Operator
  - Hotel & Resort
  - Adventure Sports
  - Transport Service
  - Other
- Primary Location (required) - Covers all major Sri Lankan cities
- Business Description (optional)

#### Step 2: Contact Information

- Full Business Address (required)
- Contact Person Name (required)
- Phone Number (required)
- Email Address (pre-filled from user account)
- Years in Business (optional)

#### Step 3: Business Hours

- Operating hours for each day of the week
- Time picker interface for open/close times
- Flexible scheduling (different hours per day)

#### Step 4: Services & Features

- Bike Specialties (checkboxes):
  - Mountain Bikes, City Bikes, Electric Bikes, etc.
- Additional Features (checkboxes):
  - Helmet Included, GPS Navigation, Delivery Service, etc.

### 2. Navigation Integration

- **"Become a Partner" Button**: Located on the Partners page
- **Route Protection**: Registration page accessible to authenticated users only
- **Success Handling**: Shows confirmation and redirects to partners page

### 3. Backend Integration

- **Extended API Support**: Backend now accepts comprehensive registration data
- **Backward Compatibility**: Still supports legacy registration format
- **User Role Update**: Automatically updates user role to 'partner' upon registration
- **Data Validation**: Server-side validation for all fields

### 4. User Experience Features

- **Step Validation**: Prevents proceeding without required fields
- **Progress Indicator**: Visual step indicator showing registration progress
- **Error Handling**: Comprehensive error messages and retry options
- **Loading States**: Shows loading indicators during submission
- **Success Feedback**: Clear confirmation of successful registration

## Technical Implementation

### Frontend Components

```typescript
// Main registration page
src / pages / PartnerRegistrationPage.tsx;

// Reusable form component
src / components / forms / FormField.tsx;

// Updated partner benefits with correct navigation
src / components / PartnersPage / PartnerBenefits.tsx;
```

### Backend Updates

```javascript
// Enhanced partner registration controller
backend / src / controllers / partnerController.js;

// Partner model with comprehensive schema
backend / src / models / Partner.js;
```

### Service Integration

```typescript
// Partner service with extended registration support
src / services / partnerService.ts;
```

## Usage Flow

1. **User Access**: Tourist or business owner visits `/partners` page
2. **Partner Interest**: Clicks "Become a Partner" button in the Partner Benefits section
3. **Authentication Check**: System verifies user is logged in (redirects to login if not)
4. **Registration Process**: User completes 4-step registration form
5. **Submission**: Data is sent to backend API for processing
6. **Account Creation**: Partner account created with 'pending' verification status
7. **Role Update**: User account role updated to 'partner'
8. **Confirmation**: Success message displayed and redirect to partners page

## Benefits for Partners

### Increased Bookings

- Access to thousands of tourists looking for authentic local experiences
- Exposure through Cycle.LK's marketing channels

### Secure Payments

- Guaranteed payments with comprehensive insurance coverage
- No payment processing hassles

### Marketing Support

- Professional photography and listing optimization
- Promotional campaigns and SEO benefits

## Integration with Cycle.LK Platform

### Network Effect

- Partners become part of a unified bike rental network
- Enables cross-location rentals (rent in Colombo, drop in Kandy)
- Standardized quality and availability across all locations

### Tourism Integration

- Solves key transportation challenges for tourists
- Bridges language barriers with standardized platform
- Provides reliable, quality-assured bike rental options

### Environmental Impact

- Promotes eco-friendly transportation in tourist areas
- Reduces reliance on motorized transport in sensitive areas
- Supports sustainable tourism practices

## Future Enhancements

1. **Document Upload**: Allow partners to upload business registration documents
2. **Photo Gallery**: Enable partners to upload photos of their shop and bikes
3. **Bank Details**: Collect payment information for revenue sharing
4. **Verification Workflow**: Admin dashboard for partner verification
5. **Performance Analytics**: Dashboard showing bookings and revenue
6. **Mobile Responsiveness**: Optimize registration form for mobile devices

## Setup Instructions

1. Ensure both backend and frontend servers are running
2. Navigate to `http://localhost:5174/partners`
3. Click "Become a Partner" button
4. Complete the registration process
5. Check backend logs for successful partner creation

The system is now ready for local bike rental businesses to register and join the Cycle.LK network!
