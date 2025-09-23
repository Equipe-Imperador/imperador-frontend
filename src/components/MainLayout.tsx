import React from 'react';
import { Box, Drawer, AppBar, Toolbar, Typography, List, ListItemButton, ListItemText, Divider } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import SpeedIcon from '@mui/icons-material/Speed';

const drawerWidth = 240;

// 1. O componente agora aceita uma nova propriedade: onPresetChange
interface MainLayoutProps {
  children: React.ReactNode;
  onPresetChange: (preset: string) => void;
}

const MainLayout = ({ children, onPresetChange }: MainLayoutProps) => {
  return (
    <Box sx={{ display: 'flex' }}>
      {/* ... (AppBar e outras partes do layout continuam iguais) ... */}
      <AppBar
        position="fixed"
        sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px`, backgroundColor: '#1E1E1E' }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Dashboard de Telemetria
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', backgroundColor: '#1E1E1E', color: '#FFFFFF' },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <Typography variant="h6" sx={{ p: 2, textAlign: 'center' }}>
            Equipe Imperador
          </Typography>
          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }}/>
          <List>
            <Typography sx={{ p: 2, color: 'gray' }}>Presets</Typography>
            {/* 2. Cada botão agora chama a função onPresetChange com um valor diferente */}
            <ListItemButton onClick={() => onPresetChange('powertrain')}>
              <SpeedIcon sx={{ mr: 1 }} />
              <ListItemText primary="Powertrain" />
            </ListItemButton>
            <ListItemButton onClick={() => onPresetChange('freios')}>
              <BarChartIcon sx={{ mr: 1 }} />
              <ListItemText primary="Freios" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, backgroundColor: '#121212', minHeight: '100vh' }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;