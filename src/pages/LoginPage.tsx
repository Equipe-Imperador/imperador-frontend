import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png'; // coloque sua logo em src/assets/logo.png
import axios from 'axios';





export default function LoginPage() {
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
      const response = await axios.post('http://72.60.141.159:3000/api/users/login', { email, password });
      login(response.data.token);
      navigate('/'); // redireciona para Dashboard após login
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
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${logo})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.27, // logo semi-transparente
          filter: 'blur(1px)',
          zIndex: 0,
        },
      }}
    >
      <Paper
        elevation={10}
        sx={{
          position: 'relative',
          zIndex: 1,
          p: 4,
          maxWidth: 400,
          width: '100%',
          backgroundColor: 'rgba(0, 20, 47, 0.75)',
          borderRadius: 3,
          color: '#FFF',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        <Typography variant="h4" textAlign="center" sx={{ mb: 2 }}>
          Login Imperador
        </Typography>

        {error && (
          <Typography color="#FF6B6B" textAlign="center">
            {error}
          </Typography>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
            InputLabelProps={{ style: { color: '#797878' } }}
            inputProps={{ style: { color: '#FFF' } }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#797878' },
                '&:hover fieldset': { borderColor: '#FFF' },
                '&.Mui-focused fieldset': { borderColor: '#FFF' },
              },
            }}
          />
          <TextField
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
            InputLabelProps={{ style: { color: '#797878' } }}
            inputProps={{ style: { color: '#FFF' } }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#797878' },
                '&:hover fieldset': { borderColor: '#FFF' },
                '&.Mui-focused fieldset': { borderColor: '#FFF' },
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              backgroundColor: '#00142F',
              color: '#FFF',
              '&:hover': { backgroundColor: '#131E33' },
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <Typography variant="body2" textAlign="center" sx={{ color: '#797878', mt: 2 }}>
          © 2025 Equipe Imperador
        </Typography>
      </Paper>
    </Box>
  );
}
