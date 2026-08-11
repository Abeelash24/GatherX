# GatherX Server

Express.js backend API for the GatherX event management platform.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Server runs at `http://localhost:5000`

## 📁 Structure

```
server/
├── index.js           # Express app entry point
├── database.js        # SQLite connection setup
├── middleware/         # Auth, upload, error handlers
├── routes/            # API route definitions
├── uploads/           # Payment screenshots / file uploads
├── gatherx.db         # SQLite database file
└── package.json
```

## 🔧 Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start server in production mode |
| `npm run dev` | Start server with nodemon (auto-reload) |

## 🔐 Default Admin

- Username: `admin`
- Password: `admin123`

## 📦 Dependencies

- Express
- SQLite3
- bcryptjs
- jsonwebtoken
- multer
- cors
- dotenv

## 🔗 API Base URL

```
http://localhost:5000/api
```
