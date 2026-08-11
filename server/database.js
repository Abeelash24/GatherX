import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new sqlite3.Database(join(__dirname, 'gatherx.db'), (err) => {
  if (err) {
    console.error('Failed to connect to database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT DEFAULT '',
    upi_qr_url TEXT DEFAULT '',
    capacity INTEGER DEFAULT 0,
    registration_link TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER,
    name TEXT NOT NULL,
    college TEXT NOT NULL,
    event TEXT NOT NULL,
    noOfEvents TEXT NOT NULL,
    participationType TEXT NOT NULL,
    teamMembers TEXT NOT NULL,
    departments TEXT NOT NULL,
    date TEXT NOT NULL,
    paymentAmount REAL DEFAULT 0,
    paymentStatus TEXT DEFAULT 'pending',
    paymentMethod TEXT DEFAULT '',
    transactionId TEXT DEFAULT '',
    paymentScreenshot TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.all('PRAGMA table_info(registrations)', (err, columns) => {
    if (err || columns.some((column) => column.name === 'event_id')) return;
    db.run('ALTER TABLE registrations ADD COLUMN event_id INTEGER');
  });

  db.all('PRAGMA table_info(events)', (err, columns) => {
    if (err || columns.some((column) => column.name === 'upi_qr_url')) return;
    db.run("ALTER TABLE events ADD COLUMN upi_qr_url TEXT DEFAULT ''");
  });

  const adminCount = db.get('SELECT COUNT(*) as count FROM admin', (err, row) => {
    if (err) return;
    if (row.count === 0) {
      const defaultPassword = bcrypt.hashSync('admin123', 10);
      db.run(
        'INSERT INTO admin (username, password_hash) VALUES (?, ?)',
        ['admin', defaultPassword],
        (err) => {
          if (err) console.error('Failed to create default admin:', err.message);
          else console.log('Default admin created: admin / admin123');
        }
      );
    }
  });
});

export default db;
