# Notification Integration Test Guide

## Overview

This document describes how to test the integrated notification system that bridges Firebase real-time events with MongoDB notifications.

## System Architecture

### Backend Components

1. **MongoDB Notification Model** (`backend/src/models/Notification.js`)

   - Stores persistent notifications in database
   - Fields: userId, type, title, message, read status, etc.

2. **Notification Controller** (`backend/src/controllers/notificationController.js`)

   - CRUD operations for notifications
   - Enhanced with real-time event creation

3. **Booking Controller** (`backend/src/controllers/bookingController.js`)

   - Creates both FCM notifications and database notifications
   - Triggers real-time events via Firebase

4. **Firebase Real-time Events** (`backend/src/routes/eventRoutes.js`)
   - Creates events in Firestore for real-time updates

### Frontend Components

1. **Notifications Page** (`frontend-web/src/pages/Notifications.tsx`)

   - Displays persistent notifications from MongoDB
   - Allows marking as read/unread, deletion, filtering

2. **Notification Integration Service** (`frontend-web/src/services/notificationIntegrationService.ts`)

   - Bridges real-time events with notifications
   - Handles FCM token registration
   - Creates database notifications from real-time events

3. **Real-time Event Service** (`frontend-web/src/services/realtimeEventService.ts`)

   - Listens to Firebase real-time events
   - Processes events and triggers callbacks

4. **Notification Hook** (`frontend-web/src/hooks/useNotifications.ts`)
   - Manages notification state
   - Provides unread count for UI

## Testing Steps

### 1. Setup

```bash
# Backend
cd backend
npm install
node src/index.js

# Frontend
cd frontend-web
npm install
npm run dev
```

### 2. User Registration/Login

1. Open frontend at http://localhost:5173
2. Register/login as both user and partner
3. Check browser console for FCM token registration

### 3. Test Booking Flow

1. **As User**: Create a booking request

   - Should trigger notification to partner
   - Check partner's notification page
   - Verify real-time event in browser console

2. **As Partner**: Accept/reject booking

   - Should trigger notification to user
   - Check user's notification page
   - Verify payment notification if accepted

3. **Check Database**: MongoDB notifications collection should have entries

### 4. Test Real-time Features

1. Keep both user and partner dashboards open
2. Perform booking actions
3. Verify:
   - Toast notifications appear immediately
   - Notification bell count updates
   - Real-time events logged in console

### 5. Test Notification Management

1. Visit `/notifications` page
2. Filter by type, read/unread status
3. Mark notifications as read
4. Delete notifications
5. Mark all as read

## API Endpoints

### Notifications

- `GET /api/notifications` - Get user notifications
- `POST /api/notifications` - Create notification
- `PUT /api/notifications/:id/mark-read` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification

### FCM Tokens

- `POST /api/notifications/register-token` - Register FCM token
- `DELETE /api/notifications/remove-token` - Remove FCM token

### Real-time Events

- `POST /api/events/create` - Create real-time event
- `GET /api/events/stats` - Get event statistics

## Debugging

### Backend Logs

```bash
# Check notification creation
[Notification] Created BOOKING_ACCEPTED notification for user...

# Check real-time events
[RealtimeEvents] Created event BOOKING_ACCEPTED for user...

# Check FCM
FCM token registered for user..., role: user
```

### Frontend Console

```bash
# Notification integration
Notification integration initialized successfully

# Real-time events
[RealtimeEvents] Firestore snapshot received. Size: 1
[UserRealtime] Booking accepted: {...}

# FCM token
FCM Token: xyz...
```

## Troubleshooting

### No Real-time Updates

1. Check Firebase configuration in `.env`
2. Verify FCM token registration
3. Check browser console for Firestore errors

### Notifications Not Persisting

1. Check MongoDB connection
2. Verify notification model schema
3. Check backend notification creation logs

### Permission Issues

1. Ensure browser notifications are enabled
2. Check Firebase project permissions
3. Verify VAPID key configuration

## Expected Behavior

1. **Booking Created**: Partner gets real-time notification + database entry
2. **Booking Accepted**: User gets real-time notification + database entry
3. **Payment Required**: User gets payment notification
4. **Booking Completed**: Both parties get completion notifications
5. **All Events**: Appear in respective notification pages with correct timestamps and details
