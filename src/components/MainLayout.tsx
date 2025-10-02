import React, { useState } from 'react';
import { Box, Drawer, AppBar, Toolbar, Typography, CssBaseline, IconButton, Divider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu'; // Ícone "Hamburger"

const drawerWidth = 240;

interface MainLayoutProps {
  children: React.ReactNode;
  drawerContent: React.ReactNode;
}

const MainLayout = ({ children, drawerContent }: MainLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false); // Estado para controlar o menu em telas pequenas
  const [isClosing, setIsClosing] = useState(false);

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      {drawerContent}
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: '#1E1E1E',
          // Em telas maiores, o App Bar fica ao lado do menu. Em menores, fica acima.
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }} // O botão só aparece em telas pequenas (mobile)
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Dashboard de Telemetria
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        {/* Drawer para telas pequenas (temporário, sobrepõe o conteúdo) */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onTransitionEnd={() => setIsClosing(false)}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Melhor performance de abertura em mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, backgroundColor: '#1E1E1E', color: '#FFFFFF' },
          }}
        >
          {drawer}
        </Drawer>
        {/* Drawer para telas grandes (permanente, como tínhamos antes) */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, backgroundColor: '#1E1E1E', color: '#FFFFFF' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, backgroundColor: '#121212', minHeight: '100vh' }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;