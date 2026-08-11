import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  db.get('SELECT * FROM admin WHERE username = ?', [username], (err, admin) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const validPassword = bcrypt.compareSync(password, admin.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET || 'gatherx_super_secret_jwt_key_change_in_production',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      admin: {
        id: admin.id,
        username: admin.username
      }
    });
  });
});

router.get('/stats', authenticateToken, (req, res) => {
  const stats = {};

  db.get('SELECT COUNT(*) as total FROM events', (err, row) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    stats.totalEvents = row.total;

    db.get("SELECT COUNT(*) as total FROM events WHERE date >= date('now')", (err, row) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      stats.upcomingEvents = row.total;

      db.get('SELECT COUNT(*) as total FROM registrations', (err, row) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        stats.totalRegistrations = row.total;

        db.get("SELECT COUNT(*) as total FROM registrations WHERE paymentStatus = 'pending'", (err, row) => {
          if (err) return res.status(500).json({ message: 'Server error' });
          stats.pendingPayments = row.total;

          res.json(stats);
        });
      });
    });
  });
});

export default router;
