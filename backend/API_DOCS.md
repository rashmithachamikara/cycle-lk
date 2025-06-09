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

## FAQ Endpoints

### Get All FAQs

- **URL**: `/faqs`
- **Method**: `GET`
- **Auth Required**: No
- **Query Parameters**:
  - `category`: Filter by category name
  - `active`: Filter by active status (`true`/`false`)
- **Success Response**: `200 OK`
  ```json
  [
    {
      "id": "faq_id",
      "question": "How do I book a bike?",
      "answer": "You can book a bike by navigating to the bike's detail page and selecting your desired dates.",
      "category": "booking",
      "active": true,
      "order": 1
    }
  ]
  ```

### Get FAQ by ID

- **URL**: `/faqs/:id`
- **Method**: `GET`
- **Auth Required**: No
- **Success Response**: `200 OK`
  ```json
  {
    "id": "faq_id",
    "question": "How do I book a bike?",
    "answer": "You can book a bike by navigating to the bike's detail page and selecting your desired dates.",
    "category": "booking",
    "active": true,
    "order": 1
  }
  ```

### Create FAQ

- **URL**: `/faqs`
- **Method**: `POST`
- **Auth Required**: Yes (Admin role)
- **Request Body**:
  ```json
  {
    "question": "How do I book a bike?",
    "answer": "You can book a bike by navigating to the bike's detail page and selecting your desired dates.",
    "category": "booking",
    "active": true
  }
  ```
- **Success Response**: `201 Created`

### Update FAQ

- **URL**: `/faqs/:id`
- **Method**: `PUT`
- **Auth Required**: Yes (Admin role)
- **Request Body**:
  ```json
  {
    "question": "Updated question",
    "answer": "Updated answer",
    "active": false
  }
  ```
- **Success Response**: `200 OK`

### Update FAQ Order

- **URL**: `/faqs/:id/order`
- **Method**: `PUT`
- **Auth Required**: Yes (Admin role)
- **Request Body**:
  ```json
  {
    "newOrder": 3
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "message": "FAQ order updated"
  }
  ```

### Delete FAQ

- **URL**: `/faqs/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes (Admin role)
- **Success Response**: `200 OK`
  ```json
  {
    "message": "FAQ removed"
  }
  ```

### Get FAQ Categories

- **URL**: `/faqs/categories/list`
- **Method**: `GET`
- **Auth Required**: No
- **Success Response**: `200 OK`
  ```json
  ["booking", "payment", "locations", "bikes", "safety", "account", "other"]
  ```

## Notification Endpoints

### Get User Notifications

- **URL**: `/notifications`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `userId`: Filter by user ID (required)
  - `read`: Filter by read status (`true`/`false`)
  - `type`: Filter by notification type
  - `limit`: Limit number of results
- **Success Response**: `200 OK`
  ```json
  [
    {
      "id": "notification_id",
      "userId": "user_id",
      "type": "booking",
      "title": "Booking Confirmed",
      "message": "Your booking has been confirmed.",
      "read": false,
      "relatedTo": {
        "type": "booking",
        "id": "booking_id"
      },
      "sentVia": ["app"],
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  ]
  ```

### Get Notification by ID

- **URL**: `/notifications/:id`
- **Method**: `GET`
- **Auth Required**: Yes
- **Success Response**: `200 OK`
  ```json
  {
    "id": "notification_id",
    "userId": "user_id",
    "type": "booking",
    "title": "Booking Confirmed",
    "message": "Your booking has been confirmed.",
    "read": false,
    "relatedTo": {
      "type": "booking",
      "id": "booking_id"
    },
    "sentVia": ["app"],
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
  ```

### Get Unread Notification Count

- **URL**: `/notifications/unread-count/:userId`
- **Method**: `GET`
- **Auth Required**: Yes
- **Success Response**: `200 OK`
  ```json
  {
    "count": 5
  }
  ```

### Create Notification

- **URL**: `/notifications`
- **Method**: `POST`
- **Auth Required**: Yes (Admin role)
- **Request Body**:
  ```json
  {
    "userId": "user_id",
    "type": "booking",
    "title": "Booking Confirmed",
    "message": "Your booking has been confirmed.",
    "relatedTo": {
      "type": "booking",
      "id": "booking_id"
    },
    "sentVia": ["app", "email"]
  }
  ```
- **Success Response**: `201 Created`

### Create Bulk Notifications

- **URL**: `/notifications/bulk`
- **Method**: `POST`
- **Auth Required**: Yes (Admin role)
- **Request Body**:
  ```json
  {
    "userIds": ["user_id1", "user_id2"],
    "type": "system",
    "title": "System Maintenance",
    "message": "The system will be under maintenance tonight.",
    "sentVia": ["app", "email"]
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "message": "2 notifications sent successfully",
    "count": 2
  }
  ```

### Mark Notification as Read

- **URL**: `/notifications/:id/mark-read`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Success Response**: `200 OK`

### Mark All Notifications as Read

- **URL**: `/notifications/mark-all-read`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Success Response**: `200 OK`
  ```json
  {
    "message": "All notifications marked as read"
  }
  ```

### Delete Notification

- **URL**: `/notifications/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Success Response**: `200 OK`
  ```json
  {
    "message": "Notification removed"
  }
  ```

### Delete All User Notifications

- **URL**: `/notifications/:userId`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Success Response**: `200 OK`
  ```json
  {
    "message": "All notifications deleted"
  }
  ```

## Support Endpoints

### Get All Support Tickets

- **URL**: `/support`
- **Method**: `GET`
- **Auth Required**: Yes (Admin role)
- **Query Parameters**:
  - `userId`: Filter by user ID
  - `category`: Filter by ticket category
  - `status`: Filter by ticket status
  - `priority`: Filter by priority level
- **Success Response**: `200 OK`
  ```json
  [
    {
      "id": "ticket_id",
      "ticketNumber": "TKT-202300001",
      "userId": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "0771234567"
      },
      "subject": "Issue with booking",
      "category": "booking",
      "message": "I'm having trouble with my booking.",
      "status": "open",
      "priority": "medium",
      "assignedTo": null,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
  ```

### Get Support Ticket by ID

- **URL**: `/support/:id`
- **Method**: `GET`
- **Auth Required**: Yes
- **Success Response**: `200 OK`
  ```json
  {
    "id": "ticket_id",
    "ticketNumber": "TKT-202300001",
    "userId": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "0771234567",
      "profileImage": "url_to_image"
    },
    "subject": "Issue with booking",
    "category": "booking",
    "message": "I'm having trouble with my booking.",
    "status": "open",
    "priority": "medium",
    "assignedTo": null,
    "responses": [
      {
        "responder": {
          "id": {
            "firstName": "Admin",
            "lastName": "User",
            "profileImage": "url_to_image"
          },
          "type": "staff"
        },
        "message": "We're looking into this issue.",
        "attachments": [],
        "createdAt": "2023-01-02T00:00:00.000Z"
      }
    ],
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-02T00:00:00.000Z"
  }
  ```

### Get User Tickets

- **URL**: `/support/user/:userId`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `status`: Filter by ticket status
- **Success Response**: `200 OK`

### Create Support Ticket

- **URL**: `/support`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "subject": "Issue with booking",
    "category": "booking",
    "message": "I'm having trouble with my booking.",
    "priority": "medium"
  }
  ```
- **Success Response**: `201 Created`

### Update Ticket Status

- **URL**: `/support/:id/status`
- **Method**: `PUT`
- **Auth Required**: Yes (Admin role)
- **Request Body**:
  ```json
  {
    "status": "in-progress"
  }
  ```
- **Success Response**: `200 OK`

### Assign Ticket

- **URL**: `/support/:id/assign`
- **Method**: `PUT`
- **Auth Required**: Yes (Admin role)
- **Request Body**:
  ```json
  {
    "staffId": "staff_user_id"
  }
  ```
- **Success Response**: `200 OK`

### Add Response to Ticket

- **URL**: `/support/:id/response`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "message": "This is my response to the ticket.",
    "attachments": ["url_to_attachment"]
  }
  ```
- **Success Response**: `200 OK`

### Update Ticket Priority

- **URL**: `/support/:id/priority`
- **Method**: `PUT`
- **Auth Required**: Yes (Admin role)
- **Request Body**:
  ```json
  {
    "priority": "high"
  }
  ```
- **Success Response**: `200 OK`

### Close Ticket

- **URL**: `/support/:id/close`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "resolution": "Issue was resolved by providing instructions."
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "message": "Ticket closed successfully",
    "ticket": { /* ticket object */ }
  }
  ```
