
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import type { JSX } from 'react';
import ExportPage from './pages/ExportPage'; // 1. Importa a nova página


function PrivateRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Routes>
  <Route path="/login" element={<LoginPage />} />

  {/* Dashboard na raiz */}
  <Route
    path="/"
    element={
      <PrivateRoute>
        <DashboardPage />
      </PrivateRoute>
    }
  />

  {/* Dashboard também acessível via /dashboard */}
  <Route
    path="/dashboard"
    element={
      <PrivateRoute>
        <DashboardPage />
      </PrivateRoute>
    }
  />

  {/* Exportação */}
  <Route
    path="/export"
    element={
      <PrivateRoute>
        <ExportPage />
      </PrivateRoute>
    }
  />
</Routes>

  );
}

export default App;