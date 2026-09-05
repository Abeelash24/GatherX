import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link, useSearchParams } from 'react-router-dom';
import { LogIn, UserPlus, Eye, EyeOff, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userAuthAPI } from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, loginUser } = useAuth();
  const { addToast } = useToast();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Compute the return URL
  const redirectParam = searchParams.get('redirect');
  const locationFrom = location.state?.from?.pathname ? (location.state.from.pathname + (location.state.from.search || '')) : null;
  const returnUrl = redirectParam || locationFrom || '/events';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(returnUrl, { replace: true });
    }
  }, [isAuthenticated, navigate, returnUrl]);

  const handleFillDemo = () => {
    setMode('login');
    setFormData({
      name: '',
      email: 'user@gatherx.com',
      password: 'user123',
    });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const response = await userAuthAPI.login({
          email: formData.email,
          password: formData.password,
        });
        loginUser(response.data.user, response.data.token);
        addToast(`Welcome back, ${response.data.user.name || 'User'}!`, 'success');
      } else {
        const response = await userAuthAPI.register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
        loginUser(response.data.user, response.data.token);
        addToast('Account created successfully!', 'success');
      }
      navigate(returnUrl, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || (mode === 'login' ? 'Login failed' : 'Registration failed');
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center relative overflow-hidden py-12 px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-dark-950 to-accent-900/10" />
      <div className="absolute top-20 left-20 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
              <LogIn className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              Gather<span className="text-primary-400">X</span>
            </span>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-dark-400">
            {redirectParam || locationFrom
              ? 'Please log in to view event details'
              : 'Sign in to discover and register for events'}
          </p>
        </div>

        <div className="glass-card p-6 md:p-8">
          {/* Mode Switcher */}
          <div className="flex bg-dark-900/80 p-1 rounded-xl mb-6 border border-dark-800">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'login'
                  ? 'bg-primary-500 text-white shadow'
                  : 'text-dark-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'register'
                  ? 'bg-primary-500 text-white shadow'
                  : 'text-dark-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  placeholder="John Doe"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                className="input-field"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  className="input-field pr-11"
                  placeholder={mode === 'login' ? '••••••••' : 'Min 6 characters'}
                  required
                  minLength={mode === 'register' ? 6 : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 mt-6 font-semibold disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Quick-fill demo credentials */}
          <div className="mt-6 pt-6 border-t border-dark-800/80">
            <button
              type="button"
              onClick={handleFillDemo}
              className="w-full p-3 bg-dark-900/60 hover:bg-dark-800/60 border border-dark-700/60 rounded-xl flex items-center justify-between text-left group transition-all"
            >
              <div>
                <div className="flex items-center gap-1.5 text-xs text-primary-400 font-medium mb-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Demo User Account
                </div>
                <div className="text-xs text-dark-300">
                  user@gatherx.com &bull; pass: user123
                </div>
              </div>
              <span className="text-xs font-medium text-primary-400 group-hover:underline">
                Auto-fill
              </span>
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-dark-400">
              Are you an administrator?{' '}
              <Link to="/admin/login" className="text-primary-400 hover:text-primary-300 font-medium">
                Admin Login &rarr;
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
