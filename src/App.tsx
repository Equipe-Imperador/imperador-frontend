// src/App.tsx
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ExportPage from './pages/ExportPage';
import MobileLoginPage from './pages/mobile/MobileLoginPage';
import MobileDashboardPage from './pages/mobile/MobileDashboardPage';
import MobileExportPage from './pages/mobile/MobileExportPage';
import { useEffect, useState, type JSX } from 'react';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

// Hook: detectar mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
}

function App() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // 🚫 Evita redirecionar durante login
    if (!isAuthenticated) return;

    const current = location.pathname;

    if (isMobile) {
      if (current === '/login' || current === '/dashboard' || current === '/export') {
        navigate('/mobile/dashboard', { replace: true });
      }
    } else {
      if (current === '/mobile/login' || current === '/mobile/dashboard' || current === '/mobile/export') {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isMobile, isAuthenticated, location.pathname, navigate]);

  return (
    <Routes>
      {/* --- DESKTOP --- */}
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/export"
        element={
          <PrivateRoute>
            <ExportPage />
          </PrivateRoute>
        }
      />

      {/* --- MOBILE --- */}
      <Route path="/mobile/login" element={<MobileLoginPage />} />
      <Route
        path="/mobile/dashboard"
        element={
          <PrivateRoute>
            <MobileDashboardPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/mobile/export"
        element={
          <PrivateRoute>
            <MobileExportPage />
          </PrivateRoute>
        }
      />

      {/* --- Fallback --- */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
