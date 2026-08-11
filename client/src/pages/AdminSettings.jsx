import { useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { User, Lock, Bell, Palette, Save, Loader2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

export default function AdminSettings() {
  const { addToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [saving, setSaving] = useState(false);
  const [account, setAccount] = useState({
    username: 'admin',
    email: 'admin@gatherx.io',
    profile: ''
  });
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notifications, setNotifications] = useState({
    email: true,
    registrations: true,
    payments: true,
    weeklyReport: false
  });

  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setAccount(prev => ({ ...prev, [name]: value }));
  };

  const handleSecurityChange = (e) => {
    const { name, value } = e.target;
    setSecurity(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotifications(prev => ({ ...prev, [name]: checked }));
  };

  const handleSaveAccount = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      addToast('Account settings updated', 'success');
    }, 800);
  };

  const handleSaveSecurity = (e) => {
    e.preventDefault();
    if (security.newPassword !== security.confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
      addToast('Password updated successfully', 'success');
    }, 800);
  };

  const handleSaveNotifications = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      addToast('Notification preferences updated', 'success');
    }, 800);
  };

  const sections = [
    {
      id: 'account',
      title: 'Account',
      icon: User,
      description: 'Update your account information and profile details.',
      content: (
        <form onSubmit={handleSaveAccount} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Username</label>
              <input
                type="text"
                name="username"
                value={account.username}
                onChange={handleAccountChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={account.email}
                onChange={handleAccountChange}
                className="input-field"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">Profile Bio</label>
            <textarea
              name="profile"
              value={account.profile}
              onChange={handleAccountChange}
              rows={3}
              className="input-field resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <><Loader2 className="w-5 h-5 animate-spin mr-2" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save Changes</>}
          </button>
        </form>
      )
    },
    {
      id: 'security',
      title: 'Security',
      icon: Lock,
      description: 'Update your password and manage session security.',
      content: (
        <form onSubmit={handleSaveSecurity} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={security.currentPassword}
              onChange={handleSecurityChange}
              className="input-field"
              placeholder="Enter current password"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={security.newPassword}
                onChange={handleSecurityChange}
                className="input-field"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={security.confirmPassword}
                onChange={handleSecurityChange}
                className="input-field"
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <><Loader2 className="w-5 h-5 animate-spin mr-2" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Update Password</>}
          </button>
        </form>
      )
    },
    {
      id: 'appearance',
      title: 'Appearance',
      icon: Palette,
      description: 'Customize the look and feel of your dashboard.',
      content: (
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h4 className="text-white font-semibold mb-4">Theme</h4>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={toggleTheme}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  theme === 'dark'
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                    : 'bg-dark-700/30 text-dark-300 hover:bg-dark-700/50 hover:text-white'
                }`}
              >
                Dark Mode
              </button>
              <button
                onClick={toggleTheme}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  theme === 'light'
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                    : 'bg-dark-700/30 text-dark-300 hover:bg-dark-700/50 hover:text-white'
                }`}
              >
                Light Mode
              </button>
            </div>
            <p className="text-dark-400 text-sm mt-3">Current theme: <span className="text-white font-medium capitalize">{theme}</span></p>
          </div>
        </div>
      )
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      description: 'Manage how you receive notifications.',
      content: (
        <form onSubmit={handleSaveNotifications} className="space-y-6">
          {[
            { name: 'email', label: 'Email Notifications', description: 'Receive general updates via email' },
            { name: 'registrations', label: 'Registration Alerts', description: 'Get notified when new registrations come in' },
            { name: 'payments', label: 'Payment Updates', description: 'Receive alerts for payment status changes' },
            { name: 'weeklyReport', label: 'Weekly Report', description: 'Get a weekly summary of events and registrations' },
          ].map(item => (
            <div key={item.name} className="glass-card p-5 flex items-start justify-between">
              <div>
                <h4 className="text-white font-medium">{item.label}</h4>
                <p className="text-dark-400 text-sm">{item.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  name={item.name}
                  checked={notifications[item.name]}
                  onChange={handleNotificationChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          ))}
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <><Loader2 className="w-5 h-5 animate-spin mr-2" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save Preferences</>}
          </button>
        </form>
      )
    }
  ];

  return (
    <AdminSidebar>
      <div className="p-6 md:p-8">
        <BackButton to="/admin/dashboard" label="Dashboard" className="mb-6" />
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Settings</h1>
          <p className="text-dark-400 mt-1">Manage your account and preferences</p>
        </div>

        <div className="space-y-8 max-w-4xl">
          {sections.map(section => (
            <div key={section.id} className="glass-card p-6 md:p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-primary-500/10 rounded-xl">
                  <section.icon className="w-6 h-6 text-primary-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{section.title}</h2>
                  <p className="text-dark-400 text-sm">{section.description}</p>
                </div>
              </div>
              {section.content}
            </div>
          ))}
        </div>
      </div>
    </AdminSidebar>
  );
}
