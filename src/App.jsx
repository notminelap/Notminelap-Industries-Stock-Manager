import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SplashScreen from './components/SplashScreen';
import CustomCursor from './components/CustomCursor';
import { api, getStoredUser, setToken, setStoredUser } from './utils/api';
import './index.css';

/* ── Error Boundary ── */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error('App Error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)', color: 'var(--text)', gap: '16px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Something went wrong</h1>
          <button onClick={() => window.location.reload()} style={{ padding: '12px 24px', borderRadius: '999px', background: 'var(--blue)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '16px' }}>Reload App</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppRoutes({ isAuthenticated, handleLogin, handleLogout, theme, setTheme, currentUser }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/login"
          element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/" />}
        />
        <Route
          path="/"
          element={isAuthenticated
            ? <Dashboard onLogout={handleLogout} user={currentUser} theme={theme} setTheme={setTheme} />
            : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem('splashed'));
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  // Apply theme to <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Validate stored token on mount
  useEffect(() => {
    const validateAuth = async () => {
      const stored = getStoredUser();
      if (!stored) {
        setAuthLoading(false);
        return;
      }
      try {
        const user = await api('/auth/me');
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch {
        // Token invalid/expired
        setToken(null);
        setStoredUser(null);
      } finally {
        setAuthLoading(false);
      }
    };
    validateAuth();
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setToken(null);
    setStoredUser(null);
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const handleSplashComplete = () => {
    sessionStorage.setItem('splashed', 'true');
    setShowSplash(false);
  };

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <CustomCursor />
        <Toaster position="top-right" toastOptions={{ className: 'glass-toast' }} />
        <AnimatePresence>
          {showSplash && <SplashScreen key="splash" onComplete={handleSplashComplete} />}
        </AnimatePresence>
        {!showSplash && (
          authLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)', color: 'var(--text)' }}><p>Loading...</p></div>
          ) : (
            <AppRoutes
              isAuthenticated={isAuthenticated}
              handleLogin={handleLogin}
              handleLogout={handleLogout}
              theme={theme}
              setTheme={setTheme}
              currentUser={currentUser}
            />
          )
        )}
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
