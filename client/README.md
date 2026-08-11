# GatherX Client

React + Vite frontend for the GatherX event management platform.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`

## 📁 Structure

```
src/
├── components/   # Reusable UI components
├── pages/        # Route pages
├── services/     # API client with mock fallback
├── context/      # Auth, Toast, Theme providers
├── data/         # Mock data
└── index.css     # Tailwind + theme overrides
```

## 🔧 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## 🌓 Theme

- Dark mode is default
- Toggle via Navbar
- Persists in `localStorage`
- Light mode overrides in `src/index.css`

## 🔐 Admin Preview

Use these credentials on the Admin Login page:
- Username: `admin`
- Password: `admin123`

## 📦 Key Dependencies

- React 18
- React Router DOM
- Tailwind CSS
- Lucide React
- Axios
