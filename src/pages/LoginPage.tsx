import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Para redirecionar o usuário
import { useAuth } from '../context/AuthContext';   // Para usar nossa função de login

// A interface que descreve a resposta de sucesso da nossa API
interface LoginSuccessResponse {
  message: string;
  token: string;
}

const LoginPage = () => {
  // Hooks que vamos usar
  const navigate = useNavigate();    // Hook para nos permitir navegar entre páginas
  const { login } = useAuth();       // Pegamos a função 'login' do nosso AuthContext
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      // Usamos o NOVO IP da sua VPS
      const response = await axios.post<LoginSuccessResponse>('http://72.60.141.159:3000/api/users/login', {
        email,
        password,
      });

      if (response.status === 200) {
        const { token } = response.data;
        
        // Usamos a função 'login' do nosso contexto. 
        // Ela vai salvar o token no localStorage e atualizar o estado global da aplicação.
        login(token);

        // Navega o usuário para a página principal (o Dashboard)
        navigate('/');
      }
    } catch (err: any) {
      if (err.response) {
        setError(err.response.data.message || 'Erro no login.');
      } else {
        setError('Erro de conexão. Verifique sua rede ou o status do servidor.');
      }
      console.error('Erro de login:', err);
    }
  };

  return (
    <div>
      <h2>Login - Telemetria Imperador</h2>
      <form onSubmit={handleSubmit} method="post">
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Senha:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
};

export default LoginPage;
