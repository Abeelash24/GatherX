import express from 'express';
import db from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', (req, res) => {
  db.all('SELECT * FROM announcements WHERE is_active = 1 ORDER BY updated_at DESC LIMIT 1', (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Failed to fetch announcement' });
    }
    res.json(rows[0] || null);
  });
});

router.get('/all', authenticateToken, (req, res) => {
  db.all('SELECT * FROM announcements ORDER BY updated_at DESC', (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Failed to fetch announcements' });
    }
    res.json(rows);
  });
});

router.post('/', authenticateToken, (req, res) => {
  const { text, is_active } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ message: 'Announcement text is required' });
  }

  db.run(
    'INSERT INTO announcements (text, is_active) VALUES (?, ?)',
    [text.trim(), is_active ? 1 : 0],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Failed to create announcement' });
      }
      db.get('SELECT * FROM announcements WHERE id = ?', [this.lastID], (err, row) => {
        if (err) return res.status(500).json({ message: 'Failed to fetch created announcement' });
        res.status(201).json(row);
      });
    }
  );
});

router.put('/:id', authenticateToken, (req, res) => {
  const { text, is_active } = req.body;
  const { id } = req.params;

  if (!text || !text.trim()) {
    return res.status(400).json({ message: 'Announcement text is required' });
  }

  db.run(
    'UPDATE announcements SET text = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [text.trim(), is_active ? 1 : 0, id],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Failed to update announcement' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Announcement not found' });
      }
      db.get('SELECT * FROM announcements WHERE id = ?', [id], (err, row) => {
        if (err) return res.status(500).json({ message: 'Failed to fetch updated announcement' });
        res.json(row);
      });
    }
  );
});

router.delete('/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM announcements WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Failed to delete announcement' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    res.json({ message: 'Announcement deleted successfully' });
  });
});

export default router;
