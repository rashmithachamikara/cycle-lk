const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const firebaseAdmin = require('../config/firebase');

/**
 * @route   POST /api/events/create
 * @desc    Create a real-time event in Firestore
 * @access  Private
 */
router.post('/create', auth(), async (req, res) => {
  try {
    const { type, targetUserId, targetUserRole, data, metadata } = req.body;

    if (!firebaseAdmin) {
      return res.status(500).json({ message: 'Firebase not initialized' });
    }

    const db = firebaseAdmin.firestore();
    
    const eventData = {
      type,
      targetUserId,
      targetUserRole,
      data: data || {},
      timestamp: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      processed: false,
      metadata: {
        sourceUserId: req.user.id,
        sourceUserRole: req.user.role,
        ...metadata
      }
    };

    // Add event to Firestore
    const docRef = await db.collection('realtimeEvents').add(eventData);
    
    console.log(`[RealtimeEvents] Created event ${type} for user ${targetUserId}, docId: ${docRef.id}`);

    res.status(201).json({ 
      message: 'Real-time event created successfully',
      eventId: docRef.id,
      type,
      targetUserId
    });
  } catch (error) {
    console.error('[RealtimeEvents] Error creating event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/events/cleanup
 * @desc    Clean up old processed events
 * @access  Private (Admin only)
 */
router.post('/cleanup', auth(), async (req, res) => {
  try {
    // Only allow admins to cleanup
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    if (!firebaseAdmin) {
      return res.status(500).json({ message: 'Firebase not initialized' });
    }

    const db = firebaseAdmin.firestore();
    const { olderThanDays = 7 } = req.body;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    // Query old processed events
    const oldEventsQuery = db.collection('realtimeEvents')
      .where('processed', '==', true)
      .where('timestamp', '<', cutoffDate);

    const snapshot = await oldEventsQuery.get();
    
    // Delete in batches (Firestore allows max 500 operations per batch)
    const batch = db.batch();
    let deleteCount = 0;
    
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
      deleteCount++;
    });

    if (deleteCount > 0) {
      await batch.commit();
    }

    console.log(`[RealtimeEvents] Cleaned up ${deleteCount} old events`);
    
    res.json({ 
      message: `Successfully cleaned up ${deleteCount} old events`,
      deletedCount: deleteCount
    });
  } catch (error) {
    console.error('[RealtimeEvents] Error during cleanup:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/events/stats
 * @desc    Get event statistics
 * @access  Private (Admin only)
 */
router.get('/stats', auth(), async (req, res) => {
  try {
    // Only allow admins to view stats
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    if (!firebaseAdmin) {
      return res.status(500).json({ message: 'Firebase not initialized' });
    }

    const db = firebaseAdmin.firestore();
    
    // Get counts for different event states
    const [unprocessedSnapshot, processedSnapshot] = await Promise.all([
      db.collection('realtimeEvents').where('processed', '==', false).get(),
      db.collection('realtimeEvents').where('processed', '==', true).get()
    ]);

    const stats = {
      totalEvents: unprocessedSnapshot.size + processedSnapshot.size,
      unprocessedEvents: unprocessedSnapshot.size,
      processedEvents: processedSnapshot.size,
      timestamp: new Date().toISOString()
    };

    res.json(stats);
  } catch (error) {
    console.error('[RealtimeEvents] Error getting stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
