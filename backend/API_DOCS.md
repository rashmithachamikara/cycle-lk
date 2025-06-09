# Cycle.LK API Documentation

This document provides details about the Cycle.LK API endpoints, their functionality, required parameters, and expected responses.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Many endpoints require authentication using a JWT token. Include the token in the request header:

```
x-auth-token: <your_token_here>
```

## User Endpoints

### Register User

- **URL**: `/users/register`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "0771234567"
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
  ```

### Login User

- **URL**: `/users/login`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
  ```

### Get User Profile

- **URL**: `/users/:id`
- **Method**: `GET`
- **Auth Required**: Yes
- **Success Response**: `200 OK`
  ```json
  {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "0771234567",
    "role": "user",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
  ```

### Update User Profile

- **URL**: `/users/:id`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "firstName": "Johnny",
    "phone": "0779876543"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "id": "user_id",
    "firstName": "Johnny",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "0779876543",
    "role": "user"
  }
  ```

### Change Password

- **URL**: `/users/:id/password`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "currentPassword": "password123",
    "newPassword": "newPassword123"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "message": "Password updated successfully"
  }
  ```

## Bike Endpoints

### Get All Bikes

- **URL**: `/bikes`
- **Method**: `GET`
- **Auth Required**: No
- **Query Parameters**:
  - `location`: Filter by location name
  - `type`: Filter by bike type (mountain, road, etc.)
  - `minPrice`: Minimum daily price
  - `maxPrice`: Maximum daily price
  - `available`: Filter only available bikes (`true`/`false`)
  - `partnerId`: Filter by partner ID
  - `limit`: Limit number of results
  - `sort`: Sort order (`price-asc`, `price-desc`, `rating`)
- **Success Response**: `200 OK`
  ```json
  [
    {
      "id": "bike_id",
      "name": "Mountain Bike Pro",
      "type": "mountain",
      "brand": "Trek",
      "model": "X500",
      "images": ["url1", "url2"],
      "pricing": {
        "perHour": 5,
        "perDay": 25,
        "deliveryFee": 10
      },
      "location": "Colombo",
      "availability": {
        "status": true
      },
      "rating": 4.5,
      "reviewCount": 10,
      "partnerId": {
        "id": "partner_id",
        "companyName": "City Bikes",
        "rating": 4.8
      }
    }
  ]
  ```

### Get Bike by ID

- **URL**: `/bikes/:id`
- **Method**: `GET`
- **Auth Required**: No
- **Success Response**: `200 OK`
  ```json
  {
    "id": "bike_id",
    "name": "Mountain Bike Pro",
    "type": "mountain",
    "brand": "Trek",
    "model": "X500",
    "images": ["url1", "url2"],
    "pricing": {
      "perHour": 5,
      "perDay": 25,
      "deliveryFee": 10
    },
    "specifications": {
      "frameSize": "Large",
      "gears": "21-speed",
      "brakes": "Disc brakes"
    },
    "description": "A professional mountain bike perfect for off-road trails.",
    "location": "Colombo",
    "availability": {
      "status": true
    },
    "rating": 4.5,
    "reviewCount": 10,
    "partnerId": {
      "id": "partner_id",
      "companyName": "City Bikes",
      "rating": 4.8,
      "contact": {
        "email": "citybikes@example.com",
        "phone": "0771234567"
      },
      "location": "Colombo"
    }
  }
  ```

### Add New Bike

- **URL**: `/bikes`
- **Method**: `POST`
- **Auth Required**: Yes (Partner role)
- **Request Body**:
  ```json
  {
    "name": "Mountain Bike Pro",
    "type": "mountain",
    "brand": "Trek",
    "model": "X500",
    "pricing": {
      "perHour": 5,
      "perDay": 25,
      "deliveryFee": 10
    },
    "specifications": {
      "frameSize": "Large",
      "gears": "21-speed",
      "brakes": "Disc brakes"
    },
    "description": "A professional mountain bike perfect for off-road trails.",
    "location": "Colombo"
  }
  ```
- **Success Response**: `201 Created`

### Update Bike

- **URL**: `/bikes/:id`
- **Method**: `PUT`
- **Auth Required**: Yes (Partner role)
- **Request Body**: Same as Add New Bike (partial updates allowed)
- **Success Response**: `200 OK`

### Upload Bike Images

- **URL**: `/bikes/:id/images`
- **Method**: `POST`
- **Auth Required**: Yes (Partner role)
- **Content Type**: `multipart/form-data`
- **Request Body**:
  - `images`: Up to 5 image files
- **Success Response**: `200 OK`
  ```json
  {
    "message": "Images uploaded successfully",
    "images": ["url1", "url2"]
  }
  ```

### Update Bike Availability

- **URL**: `/bikes/:id/availability`
- **Method**: `PUT`
- **Auth Required**: Yes (Partner role)
- **Request Body**:
  ```json
  {
    "status": true,
    "unavailableDates": ["2023-06-10", "2023-06-11"]
  }
  ```
- **Success Response**: `200 OK`

### Delete Bike

- **URL**: `/bikes/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes (Partner role)
- **Success Response**: `200 OK`
  ```json
  {
    "message": "Bike removed"
  }
  ```

## Booking Endpoints

### Create Booking

- **URL**: `/bookings`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "bikeId": "bike_id",
    "startTime": "2023-06-15T10:00:00Z",
    "endTime": "2023-06-16T10:00:00Z",
    "deliveryAddress": "123 Main St, Colombo"
  }
  ```
- **Success Response**: `201 Created`

### Get All Bookings

- **URL**: `/bookings`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `userId`: Filter by user ID
  - `bikeId`: Filter by bike ID
  - `partnerId`: Filter by partner ID
  - `status`: Filter by status
  - `startDate`: Filter by start date
  - `endDate`: Filter by end date
- **Success Response**: `200 OK`

### Get Booking by ID

- **URL**: `/bookings/:id`
- **Method**: `GET`
- **Auth Required**: Yes
- **Success Response**: `200 OK`

### Update Booking Status

- **URL**: `/bookings/:id/status`
- **Method**: `PUT`
- **Auth Required**: Yes (Partner/Admin role)
- **Request Body**:
  ```json
  {
    "status": "confirmed"
  }
  ```
- **Success Response**: `200 OK`

### Cancel Booking

- **URL**: `/bookings/:id/cancel`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Success Response**: `200 OK`
  ```json
  {
    "message": "Booking cancelled successfully",
    "booking": { /* booking object */ }
  }
  ```

## Payment Endpoints

### Process Payment

- **URL**: `/payments`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "bookingId": "booking_id",
    "paymentMethod": "credit_card",
    "transactionId": "tx_123456789"
  }
  ```
- **Success Response**: `201 Created`

### Get All Payments

- **URL**: `/payments`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `userId`: Filter by user ID
  - `partnerId`: Filter by partner ID
  - `bookingId`: Filter by booking ID
  - `status`: Filter by payment status
  - `startDate`: Filter by start date
  - `endDate`: Filter by end date
- **Success Response**: `200 OK`

### Get Payment by ID

- **URL**: `/payments/:id`
- **Method**: `GET`
- **Auth Required**: Yes
- **Success Response**: `200 OK`

### Process Refund

- **URL**: `/payments/:id/refund`
- **Method**: `POST`
- **Auth Required**: Yes (Admin role)
- **Request Body**:
  ```json
  {
    "reason": "Customer requested cancellation",
    "amount": 100
  }
  ```
- **Success Response**: `200 OK`

## Partner Endpoints

### Register Partner

- **URL**: `/partners`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "userId": "user_id",
    "companyName": "City Bikes",
    "companyAddress": "123 Main St, Colombo",
    "businessRegNumber": "BR123456",
    "contactPhone": "0771234567"
  }
  ```
- **Success Response**: `201 Created`

### Get All Partners

- **URL**: `/partners`
- **Method**: `GET`
- **Auth Required**: No
- **Success Response**: `200 OK`

### Get Partner by ID

- **URL**: `/partners/:id`
- **Method**: `GET`
- **Auth Required**: No
- **Success Response**: `200 OK`

### Get Partner Bikes

- **URL**: `/partners/:id/bikes`
- **Method**: `GET`
- **Auth Required**: No
- **Success Response**: `200 OK`

## Location Endpoints

### Get All Locations

- **URL**: `/locations`
- **Method**: `GET`
- **Auth Required**: No
- **Success Response**: `200 OK`
  ```json
  [
    {
      "id": "location_id",
      "name": "Colombo",
      "city": "Colombo",
      "province": "Western",
      "coordinates": {
        "latitude": 6.927079,
        "longitude": 79.861243
      },
      "bikeCount": 25,
      "partnerCount": 5
    }
  ]
  ```

### Search Locations

- **URL**: `/locations/search`
- **Method**: `GET`
- **Auth Required**: No
- **Query Parameters**:
  - `query`: Search term for location name, city or province
- **Success Response**: `200 OK`

## Review Endpoints

### Get All Reviews

- **URL**: `/reviews`
- **Method**: `GET`
- **Auth Required**: No
- **Query Parameters**:
  - `bikeId`: Filter by bike ID
  - `userId`: Filter by user ID
  - `rating`: Filter by rating
  - `sort`: Sort order (`latest`, `rating-high`, `rating-low`)
- **Success Response**: `200 OK`

### Create Review

- **URL**: `/reviews`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "bikeId": "bike_id",
    "bookingId": "booking_id",
    "rating": 5,
    "comment": "Excellent bike, very well maintained!"
  }
  ```
- **Success Response**: `201 Created`
