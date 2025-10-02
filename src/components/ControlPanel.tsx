import React from 'react';
import { List, ListItemButton, ListItemText, Typography, Divider, Checkbox, ListItem } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DownloadIcon from '@mui/icons-material/Download';
import SpeedIcon from '@mui/icons-material/Speed';
import BarChartIcon from '@mui/icons-material/BarChart';
import { sensorConfig } from 'c:/Baja/imperador-frontend/src/config/dashboardconfig';
import type { WidgetConfig } from 'c:/Baja/imperador-frontend/src/config/dashboardconfig';

interface ControlPanelProps {
  onPresetChange?: (preset: string) => void;
  visibleSensors?: string[];
  onSensorToggle?: (sensorId: string) => void;
}

const ControlPanel = ({ onPresetChange, visibleSensors, onSensorToggle }: ControlPanelProps) => {
  const location = useLocation();

  return (
    <>
      <Typography variant="h6" sx={{ p: 2, textAlign: 'center' }}>Equipe Imperador</Typography>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />
      <List>
        <Typography sx={{ p: 2, color: 'gray' }}>Navegação</Typography>
        <ListItemButton component={RouterLink} to="/"><DashboardIcon sx={{ mr: 1 }} /><ListItemText primary="Dashboard" /></ListItemButton>
        <ListItemButton component={RouterLink} to="/export"><DownloadIcon sx={{ mr: 1 }} /><ListItemText primary="Exportar Dados" /></ListItemButton>
      </List>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />
      {location.pathname === '/' && onPresetChange && visibleSensors && onSensorToggle && (
        <>
          <List>
            <Typography sx={{ p: 2, color: 'gray' }}>Presets</Typography>
            <ListItemButton onClick={() => onPresetChange('powertrain')}><SpeedIcon sx={{ mr: 1 }} /><ListItemText primary="Powertrain" /></ListItemButton>
            <ListItemButton onClick={() => onPresetChange('freios')}><BarChartIcon sx={{ mr: 1 }} /><ListItemText primary="Freios" /></ListItemButton>
          </List>
          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />
          <List>
            <Typography sx={{ p: 2, color: 'gray' }}>Sensores Visíveis</Typography>
            {sensorConfig.map(sensor => (
              <ListItem key={sensor.id} dense>
                <Checkbox edge="start" checked={visibleSensors.includes(sensor.id)} onChange={() => onSensorToggle(sensor.id)} sx={{color: 'gray', py: 0}} />
                <ListItemText primary={sensor.label} />
              </ListItem>
            ))}
          </List>
        </>
      )}
    </>
  );
};

export default ControlPanel;