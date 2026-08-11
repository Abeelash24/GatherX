import express from 'express';
import db from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', (req, res) => {
  const { eventId, name, college, noOfEvents, participationType, teamMembers, departments, paymentAmount, paymentMethod, transactionId, paymentScreenshot } = req.body;

  if (!eventId || !name || !college || !noOfEvents || !departments) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  if (!['upi', 'card', 'cash'].includes(paymentMethod)) {
    return res.status(400).json({ message: 'Select a valid payment method' });
  }
  if (paymentMethod === 'upi' && !transactionId) {
    return res.status(400).json({ message: 'Transaction ID is required for UPI payments' });
  }

  db.get('SELECT id, title, date, capacity, upi_qr_url FROM events WHERE id = ?', [eventId], (err, event) => {
    if (err) return res.status(500).json({ message: 'Failed to find event' });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (paymentMethod === 'upi' && !event.upi_qr_url) {
      return res.status(400).json({ message: 'UPI is not available for this event' });
    }

    db.get('SELECT COUNT(*) AS count FROM registrations WHERE event_id = ?', [event.id], (countErr, row) => {
      if (countErr) return res.status(500).json({ message: 'Failed to check event capacity' });
      if (event.capacity > 0 && row.count >= event.capacity) {
        return res.status(409).json({ message: 'This event is fully booked' });
      }

      db.run(
        'INSERT INTO registrations (event_id, name, college, event, noOfEvents, participationType, teamMembers, departments, date, paymentAmount, paymentStatus, paymentMethod, transactionId, paymentScreenshot) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [event.id, name, college, event.title, noOfEvents, participationType || 'individual', teamMembers || '', departments, event.date, paymentAmount || 0, 'pending', paymentMethod || '', transactionId || '', paymentScreenshot || ''],
        function(insertErr) {
          if (insertErr) {
            console.error('Database error:', insertErr);
            return res.status(500).json({ message: 'Failed to create registration' });
          }
          db.get('SELECT * FROM registrations WHERE id = ?', [this.lastID], (fetchErr, registration) => {
            if (fetchErr) return res.status(500).json({ message: 'Failed to fetch registration' });
            res.status(201).json({ registration, registrationId: `GX-${String(registration.id).padStart(6, '0')}` });
          });
        }
      );
    });
  });
});

router.get('/all', authenticateToken, (req, res) => {
  db.all('SELECT * FROM registrations ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Failed to fetch registrations' });
    }
    res.json(rows);
  });
});

router.get('/search', authenticateToken, (req, res) => {
  const { q, paymentStatus } = req.query;
  let query = 'SELECT * FROM registrations WHERE 1=1';
  const params = [];

  if (q) {
    query += ' AND (name LIKE ? OR college LIKE ? OR event LIKE ? OR transactionId LIKE ?)';
    const term = `%${q}%`;
    params.push(term, term, term, term);
  }

  if (paymentStatus && paymentStatus !== 'all') {
    query += ' AND paymentStatus = ?';
    params.push(paymentStatus);
  }

  query += ' ORDER BY created_at DESC';
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ message: 'Failed to fetch registrations' });
    res.json(rows);
  });
});

router.put('/:id/payment-status', authenticateToken, (req, res) => {
  const { paymentStatus } = req.body;
  if (!['pending', 'completed', 'failed'].includes(paymentStatus)) {
    return res.status(400).json({ message: 'Invalid payment status' });
  }

  db.run('UPDATE registrations SET paymentStatus = ? WHERE id = ?', [paymentStatus, req.params.id], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Failed to update registration' });
    }
    if (this.changes === 0) return res.status(404).json({ message: 'Registration not found' });
    res.json({ message: 'Registration updated' });
  });
});

export default router;
