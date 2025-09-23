import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RegisterPage from './pages/RegisterPage';
import type { JSX } from 'react';

// Componente especial para proteger rotas
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth(); // Usa nosso contexto para ver se o usuário está logado
  
  if (!isAuthenticated) {
    // Se não estiver logado, redireciona para a página de login
    return <Navigate to="/login" replace />;
  }

  // Se estiver logado, mostra a página que está sendo protegida
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota pública para a página de login */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Rota pública para a página de cadastro */}
        <Route path="/register" element={<RegisterPage />} />

        {/* Rota principal e protegida para o Dashboard */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Se o usuário digitar qualquer outra URL, ele é redirecionado para a página principal */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;