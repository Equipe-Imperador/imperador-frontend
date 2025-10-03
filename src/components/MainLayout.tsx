import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

interface MainLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
}

export default function MainLayout({ children, pageTitle }: MainLayoutProps) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#131E33',
        backgroundImage: 'url(/assets/logo.png)', // fundo da equipe
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(19,30,51,0.85)', // sobreposição escura
          zIndex: 0,
          opacity: 0.07, // logo semi-transparente
          filter: 'blur(5px)',
        },
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" color="#FFF">{pageTitle}</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link to="/">
              <Button variant="outlined" sx={{ color: '#FFF', borderColor: '#FFF' }}>Dashboard</Button>
            </Link>
            <Link to="/export">
              <Button variant="outlined" sx={{ color: '#FFF', borderColor: '#FFF' }}>Exportar</Button>
            </Link>
          </Box>
        </Box>

        <Box>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
