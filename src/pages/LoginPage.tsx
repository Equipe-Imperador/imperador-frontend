import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://72.60.141.159:3000/api/users/login', { email, password });
      login(response.data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao fazer login.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#121212', fontFamily: 'sans-serif' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem', backgroundColor: '#1E1E1E', borderRadius: '8px', color: 'white' }}>
        <h2>Telemetria Imperador</h2>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required style={{ padding: '0.5rem' }} />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha" required style={{ padding: '0.5rem' }} />
        <button type="submit" style={{ padding: '0.5rem', cursor: 'pointer' }}>Entrar</button>
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      </form>
    </div>
  );
}