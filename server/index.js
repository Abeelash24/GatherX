import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './database.js';
import eventsRoutes from './routes/events.js';
import adminRoutes from './routes/admin.js';
import registrationRoutes from './routes/register.js';
import announcementsRoutes from './routes/announcements.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.use('/api/events', eventsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/register', registrationRoutes);
app.use('/api/announcements', announcementsRoutes);

app.get('/api/categories', (req, res) => {
  db.all('SELECT DISTINCT category FROM events', (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Failed to fetch categories' });
    }
    const categories = rows.map(r => r.category);
    res.json(categories);
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Kill the existing process or use a different PORT.`);
    process.exit(0);
  } else {
    console.error('Server error:', e);
    process.exit(1);
  }
});

process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});
