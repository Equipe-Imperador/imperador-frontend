// src/pages/mobile/MobileLoginPage.tsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import axios from 'axios';

export default function MobileLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 🔗 Requisição para seu backend na VPS
      const response = await axios.post('/api/users/login', {
        email,
        password,
      });

      // Armazena o token e autentica
      login(response.data.token);

      // ✅ Redireciona corretamente para o dashboard mobile
      navigate('/mobile/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao fazer login.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#131E33',
        position: 'relative',
        overflow: 'hidden',
        p: 2,
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${logo})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.08,
          filter: 'blur(2px)',
          zIndex: 0,
        },
      }}
    >
      <Paper
        elevation={8}
        sx={{
          position: 'relative',
          zIndex: 1,
          p: 3,
          width: '100%',
          maxWidth: 400,
          bgcolor: 'rgba(0, 0, 0, 0.75)',
          borderRadius: 3,
          color: '#FFF',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          backdropFilter: 'blur(5px)',
        }}
      >
        <Typography variant="h5" textAlign="center" sx={{ fontWeight: 'bold', mb: 1 }}>
          Login Imperador
        </Typography>

        {error && (
          <Typography color="#FF6B6B" textAlign="center" sx={{ fontSize: 14 }}>
            {error}
          </Typography>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
            InputLabelProps={{ style: { color: '#bdbdbd' } }}
            inputProps={{ style: { color: '#fff' } }}
            sx={{ input: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 1 } }}
          />

          <TextField
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
            InputLabelProps={{ style: { color: '#bdbdbd' } }}
            inputProps={{ style: { color: '#fff' } }}
            sx={{ input: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 1 } }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              backgroundColor: '#004aad',
              color: '#FFF',
              fontWeight: 'bold',
              '&:hover': { backgroundColor: '#0070f3' },
              mt: 1,
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <Typography
          variant="body2"
          textAlign="center"
          sx={{ color: '#a8a8a8', fontSize: 12, mt: 1 }}
        >
          © 2025 Equipe Imperador
        </Typography>
      </Paper>
    </Box>
  );
}
