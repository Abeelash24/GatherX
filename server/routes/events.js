import express from 'express';
import multer from 'multer';
import { extname, join } from 'path';
import { mkdirSync } from 'fs';
import db from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const uploadsDirectory = join(process.cwd(), 'uploads');

mkdirSync(uploadsDirectory, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDirectory,
    filename: (req, file, callback) => {
      callback(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname).toLowerCase()}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    callback(null, file.mimetype.startsWith('image/'));
  },
});

router.get('/', (req, res) => {
  const { search, category, sort } = req.query;

  let query = 'SELECT * FROM events';
  const params = [];
  const conditions = [];

  if (search) {
    conditions.push('(title LIKE ? OR description LIKE ? OR location LIKE ?)');
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (category && category !== 'All') {
    conditions.push('category = ?');
    params.push(category);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  if (sort === 'date_asc') {
    query += ' ORDER BY date ASC';
  } else if (sort === 'date_desc') {
    query += ' ORDER BY date DESC';
  } else {
    query += ' ORDER BY date ASC';
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Failed to fetch events' });
    }
    res.json(rows);
  });
});

router.get('/:id', (req, res) => {
  const eventId = req.params.id;

  db.get('SELECT * FROM events WHERE id = ?', [eventId], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Failed to fetch event' });
    }
    if (!row) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(row);
  });
});

router.post('/upload', authenticateToken, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    if (!req.file) return res.status(400).json({ message: 'A valid image file is required' });
    res.status(201).json({ image_url: `/uploads/${req.file.filename}` });
  });
});

router.post('/', authenticateToken, (req, res) => {
  const { title, date, time, location, description, category, image_url, upi_qr_url, capacity, registration_link } = req.body;

  if (!title || !date || !time || !location || !description || !category) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  db.run(
    'INSERT INTO events (title, date, time, location, description, category, image_url, upi_qr_url, capacity, registration_link) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [title, date, time, location, description, category, image_url || '', upi_qr_url || '', capacity || 0, registration_link || ''],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Failed to create event' });
      }
      db.get('SELECT * FROM events WHERE id = ?', [this.lastID], (err, row) => {
        if (err) return res.status(500).json({ message: 'Failed to fetch created event' });
        res.status(201).json(row);
      });
    }
  );
});

router.put('/:id', authenticateToken, (req, res) => {
  const { title, date, time, location, description, category, image_url, upi_qr_url, capacity, registration_link } = req.body;

  if (!title || !date || !time || !location || !description || !category) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  db.run(
    'UPDATE events SET title = ?, date = ?, time = ?, location = ?, description = ?, category = ?, image_url = ?, upi_qr_url = ?, capacity = ?, registration_link = ? WHERE id = ?',
    [title, date, time, location, description, category, image_url || '', upi_qr_url || '', capacity || 0, registration_link || '', req.params.id],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Failed to update event' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Event not found' });
      }
      db.get('SELECT * FROM events WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ message: 'Failed to fetch updated event' });
        res.json(row);
      });
    }
  );
});

router.delete('/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM events WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Failed to delete event' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully' });
  });
});

export default router;