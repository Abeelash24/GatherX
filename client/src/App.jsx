import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AnnouncementBar from './components/AnnouncementBar';
import ProtectedRoute from './components/ProtectedRoute';
import UserAuthGuard from './components/UserAuthGuard';
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Register from './pages/Register';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminEvents from './pages/AdminEvents';
import AdminEventDashboard from './pages/AdminEventDashboard';
import AdminRegistrations from './pages/AdminRegistrations';
import AdminSettings from './pages/AdminSettings';
import EventAnalytics from './pages/EventAnalytics';
import NotFound from './pages/NotFound';

function App() {
  return (
    <div className="min-h-screen bg-dark-950 flex flex-col transition-colors duration-300">
        <Routes>
          <Route path="/admin/*" element={null} />
          <Route path="*" element={<Navbar />} />
        </Routes>
        <Routes>
          <Route path="/admin/*" element={null} />
          <Route path="*" element={<AnnouncementBar />} />
        </Routes>
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route
              path="/events/:id"
              element={
                <UserAuthGuard>
                  <EventDetails />
                </UserAuthGuard>
              }
            />
            <Route path="/register/:eventId" element={<Register />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/events" element={
              <ProtectedRoute>
                <AdminEvents />
              </ProtectedRoute>
            } />
            <Route path="/admin/events/:eventId/dashboard" element={
              <ProtectedRoute>
                <AdminEventDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/registrations" element={
              <ProtectedRoute>
                <AdminRegistrations />
              </ProtectedRoute>
            } />
            <Route path="/admin/analytics" element={
              <ProtectedRoute>
                <EventAnalytics />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Routes>
          <Route path="/admin/*" element={null} />
          <Route path="*" element={<Footer />} />
        </Routes>
    </div>
  );
}

export default App;
