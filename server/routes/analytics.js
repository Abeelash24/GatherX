import express from 'express';
import db from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get event analytics data
router.get('/events/:id/analytics', authenticateToken, (req, res) => {
  const eventId = req.params.id;

  // First verify that the user has access to this event
  const userEventAccess = JSON.parse(req.user.eventAccess || '[]');
  const userRoles = req.user.roles || [];

  // Check if user has admin role or specific event access
  const isAdmin = userRoles.includes('admin');
  const hasEventAccess = isAdmin || userEventAccess.includes(parseInt(eventId));

  if (!hasEventAccess) {
    return res.status(403).json({ message: 'Access denied: You do not have permission to access this event\'s data' });
  }

  // Get event details
  db.get('SELECT * FROM events WHERE id = ?', [eventId], (err, event) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Failed to fetch event' });
    }
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Get registrations for this event
    const getRegistrationsQuery = 'SELECT * FROM registrations WHERE event_id = ?';
    db.all(getRegistrationsQuery, [eventId], (err, registrations) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Failed to fetch registrations' });
      }

      // Calculate analytics data
      const analytics = calculateEventAnalytics(event, registrations);

      res.json({
        event,
        analytics,
        registrations
      });
    });
  });
});

// Get user-accessible events list
router.get('/events/accessible', authenticateToken, (req, res) => {
  const userRoles = req.user.roles || [];
  const userEventAccess = JSON.parse(req.user.eventAccess || '[]');

  const isAdmin = userRoles.includes('admin');

  let query, params = [];

  if (isAdmin) {
    // Admin can see all events
    query = 'SELECT * FROM events ORDER BY date DESC';
  } else {
    // Users can only see events they have access to
    query = 'SELECT * FROM events WHERE id IN (?) ORDER BY date DESC';
    params = [userEventAccess];
  }

  db.all(query, params, (err, events) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Failed to fetch events' });
    }

    res.json(events);
  });
});

// Cross-event comparison (for users with multiple event permissions)
router.get('/events/comparison', authenticateToken, (req, res) => {
  const userRoles = req.user.roles || [];
  const userEventAccess = JSON.parse(req.user.eventAccess || '[]');

  const isAdmin = userRoles.includes('admin');

  // Get basic event summary for all accessible events
  let query, params = [];

  if (isAdmin) {
    query = 'SELECT id, title, date, capacity FROM events ORDER BY date DESC';
  } else {
    query = 'SELECT id, title, date, capacity FROM events WHERE id IN (?) ORDER BY date DESC';
    params = [userEventAccess];
  }

  db.all(query, params, async (err, events) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Failed to fetch events for comparison' });
    }

    // For each event, get summary statistics
    const comparisonData = [];
    for (const event of events) {
      const stats = await getEventComparisonStats(event.id);
      comparisonData.push({
        ...event,
        stats
      });
    }

    res.json(comparisonData);
  });
});

function calculateEventAnalytics(event, registrations) {
  const totalTeams = registrations.length;
  let totalMembers = 0;
  let totalExpectedAmount = 0;
  let totalPaidAmount = 0;
  let totalPendingAmount = 0;
  let completedPayments = 0;
  let pendingPayments = 0;
  let failedPayments = 0;

  registrations.forEach(reg => {
    // Calculate team members (assuming teamMembers is JSON stringified array)
    let memberCount = 1;
    try {
      const teamMembers = JSON.parse(reg.teamMembers || '[]');
      memberCount = teamMembers.length;
    } catch {
      memberCount = 1;
    }
    totalMembers += memberCount;

    const paymentAmount = parseFloat(reg.paymentAmount) || 0;
    totalExpectedAmount += paymentAmount;

    if (reg.paymentStatus === 'completed') {
      totalPaidAmount += paymentAmount;
      completedPayments++;
    } else if (reg.paymentStatus === 'pending') {
      totalPendingAmount += paymentAmount;
      pendingPayments++;
    } else if (reg.paymentStatus === 'failed') {
      totalPendingAmount += paymentAmount;
      failedPayments++;
    }
  });

  const paidPercentage = totalExpectedAmount > 0 ? (totalPaidAmount / totalExpectedAmount) * 100 : 0;
  const pendingPercentage = totalExpectedAmount > 0 ? (totalPendingAmount / totalExpectedAmount) * 100 : 0;

  return {
    totalTeams,
    totalMembers,
    totalExpectedAmount,
    totalPaidAmount,
    totalPendingAmount,
    paidPercentage,
    pendingPercentage,
    completedPayments,
    pendingPayments,
    failedPayments
  };
}

async function getEventComparisonStats(eventId) {
  return new Promise((resolve) => {
    const query = `SELECT 
      COUNT(*) as totalRegistrations,
      COUNT(DISTINCT CASE WHEN r.paymentStatus = 'completed' THEN 1 END) as completedRegistrations,
      COUNT(DISTINCT CASE WHEN r.paymentStatus = 'pending' THEN 1 END) as pendingRegistrations,
      COUNT(DISTINCT CASE WHEN r.paymentStatus = 'failed' THEN 1 END) as failedRegistrations,
      SUM(r.paymentAmount) as totalCollected,
      SUM(CASE WHEN r.paymentStatus = 'completed' THEN r.paymentAmount ELSE 0 END) as totalPaid,
      SUM(CASE WHEN r.paymentStatus IN ('pending', 'failed') THEN r.paymentAmount ELSE 0 END) as totalPending
    FROM registrations r 
    WHERE r.event_id = ?`;

    db.get(query, [eventId], (err, stats) => {
      if (err) {
        console.error('Database error:', err);
        resolve({
          totalRegistrations: 0,
          completedRegistrations: 0,
          pendingRegistrations: 0,
          failedRegistrations: 0,
          totalCollected: 0,
          totalPaid: 0,
          totalPending: 0
        });
        return;
      }

      resolve(stats);
    });
  });
}

export default router;