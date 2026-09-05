import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminToken = localStorage.getItem('admin_token');
    const adminData = localStorage.getItem('admin_user');
    if (adminToken && adminData) {
      try {
        setAdmin(JSON.parse(adminData));
      } catch {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      }
    }

    const userToken = localStorage.getItem('user_token');
    const userData = localStorage.getItem('user_data');
    if (userToken && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_data');
      }
    }

    setLoading(false);
  }, []);

  const loginUser = (userData, token) => {
    localStorage.setItem('user_token', token);
    localStorage.setItem('user_data', JSON.stringify(userData));
    setUser(userData);
  };

  const logoutUser = () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_data');
    setUser(null);
  };

  const loginAdmin = (adminData, token) => {
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify(adminData));
    setAdmin(adminData);
  };

  const logoutAdmin = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setAdmin(null);
  };

  const isAuthenticated = Boolean(user || admin);
  const isAdmin = Boolean(admin);
  const hasPermission = Boolean(admin);

  return (
    <AuthContext.Provider
      value={{
        user,
        admin,
        login: loginAdmin,
        logout: logoutAdmin,
        loginAdmin,
        logoutAdmin,
        loginUser,
        logoutUser,
        isAuthenticated,
        isAdmin,
        hasPermission,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
