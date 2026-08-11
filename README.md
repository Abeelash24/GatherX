# GatherX - Premium Event Management Platform

Discover. Connect. Experience.

A modern, full-stack event management platform built with React, Node.js, Express, and SQLite. GatherX enables users to discover events, register seamlessly, and allows administrators to manage events, registrations, and payments through a comprehensive dashboard.

## 🚀 Features

### Public Website
- **Homepage** - Hero section, featured events, statistics, event categories
- **Events Discovery** - Search, filter by category, sort by date
- **Event Details** - Full event information, image gallery, registration CTA
- **Registration** - Multi-step registration form with payment integration
- **About & Contact** - Platform information and contact form
- **Responsive Design** - Fully responsive for desktop, tablet, and mobile
- **Dark/Light Theme** - Persistent theme switching

### Admin Dashboard
- **Dashboard** - Statistics overview, recent events and registrations
- **Event Management** - Create, edit, delete events with image preview
- **Registration Management** - Search, filter, approve/reject registrations
- **Settings** - Account, security, appearance, and notification preferences
- **Authentication** - Secure admin login with session management

### Technical Features
- Mock data layer for frontend-only development
- API-ready service architecture
- Toast notifications for user feedback
- Loading skeletons and empty states
- Debounced search across all list views
- Modal system for confirmations and details
- Reusable component library

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Vite** - Build tool and dev server

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite** - Database (via better-sqlite3)
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Backend Setup
```bash
npm install
npm run dev
```

The backend will be available at `http://5000`

## 🏗️ Project Structure

```
GatherX/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── AdminSidebar.jsx
│   │   │   ├── BackButton.jsx
│   │   │   ├── EventCard.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── LoadingSkeleton.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── Toast.jsx
│   │   │   ├── ToastProvider.jsx
│   │   │   └── EmptyState.jsx
│   │   ├── pages/          # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Events.jsx
│   │   │   ├── EventDetails.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── About.jsx
│   │   │   ├── Contact.jsx
│   │   │   ├── NotFound.jsx
│   │   │   ├── AdminLogin.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminEvents.jsx
│   │   │   ├── AdminRegistrations.jsx
│   │   │   └── AdminSettings.jsx
│   │   ├── services/       # API service layer
│   │   │   └── api.js
│   │   ├── context/        # React context providers
│   │   │   ├── AuthContext.jsx
│   │   │   ├── ToastContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── data/           # Mock data
│   │   │   ├── mockEvents.js
│   │   │   ├── mockRegistrations.js
│   │   │   └── mockStats.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
├── routes/                 # Backend API routes
├── middleware/             # Express middleware
├── db.js                   # SQLite database configuration
├── server.js               # Express server entry point
├── package.json
└── README.md
```

## 🎨 Design System

### Colors
- **Primary**: Sky blue (`#0ea5e9`)
- **Accent**: Purple (`#d946ef`)
- **Dark**: Slate gray scale (`#020617` to `#f8fafc`)

### Typography
- **Font Family**: Inter (system fallback)
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold), 900 (black)

### Components
- **Cards**: Glass-morphism with backdrop blur
- **Buttons**: Rounded-xl with gradient shadows
- **Inputs**: Dark backgrounds with focus rings
- **Modals**: Centered with backdrop overlay

## 🔐 Admin Access

Default admin credentials:
- **Username**: `admin`
- **Password**: `admin123`

## 📱 Responsive Breakpoints

- **Mobile**: 320px - 425px
- **Tablet**: 768px
- **Desktop**: 1024px
- **Large Desktop**: 1440px

## 🎯 Key Components

### AnnouncementBar
Dismissible promotional banner displayed on all public pages. Persists dismissal state via sessionStorage.

### BackButton
Smart navigation component with history-aware routing and fallback paths. Debounced to prevent double-clicks.

### EventCard
Reusable event display component with image zoom, category badges, date/time/location info, and hover effects.

### Modal
Accessible modal component with backdrop click, escape key, and focus trap support.

### Toast Notifications
Reusable notification system with success, error, warning, and info variants.

## 🔄 State Management

- **AuthContext**: Admin authentication state and login/logout functions
- **ToastContext**: Global toast notification system
- **ThemeContext**: Dark/light theme switching with localStorage persistence

## 📊 Mock Data

The frontend includes comprehensive mock data for development:
- 12 sample events across multiple categories
- 8 sample registrations with various payment statuses
- Dashboard statistics

Mock data is isolated in `client/src/data/` and can be easily replaced with API calls.

## 🚢 Deployment

### Build for Production
```bash
cd client
npm run build
```

### Environment Variables
Create a `.env` file in the client directory:
```
VITE_API_URL=http://localhost:5000/api
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 👨‍💻 Author

Built with ❤️ by the GatherX Team

## 📞 Support

For support, email contact@gatherx.io or open an issue on GitHub.
