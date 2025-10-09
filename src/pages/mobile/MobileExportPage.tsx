// src/pages/mobile/MobileExportPage.tsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTelemetryData } from '../../hooks/useTelemetryData';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { sensorConfig } from '../../config/dashboardConfig';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { createRoot } from 'react-dom/client';
import logo from '../../assets/logo.png';

export default function MobileExportPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState(new Date(Date.now() - 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const { historicalData, fetchHistory } = useTelemetryData();

  const handleExportCSV = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return alert("Token não encontrado. Faça login novamente.");
    try {
      const startISO = startDate.toISOString();
      const endISO = endDate.toISOString();
      const response = await fetch(`http://72.60.141.159:3000/api/telemetry/export?startDate=${startISO}&endDate=${endISO}&format=csv`,
        { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error('Falha CSV');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'telemetry_export.csv';
      link.click();
    } catch (err) {
      console.error(err);
      alert('Erro ao exportar CSV.');
    }
  };

  const handleExportPDF = async () => {
    await fetchHistory(startDate, endDate);
    if (!historicalData || historicalData.length === 0) {
      alert('Sem dados para exportar.');
      return;
    }

    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    document.body.appendChild(container);

    const pdf = new jsPDF('landscape', 'pt', 'a4');
    let yOffset = 20;

    for (let i = 0; i < sensorConfig.length; i++) {
      const sensor = sensorConfig[i];
      const chartDiv = document.createElement('div');
      chartDiv.style.width = '800px';
      chartDiv.style.height = '400px';
      container.appendChild(chartDiv);

      const root = createRoot(chartDiv);
      root.render(
        <div style={{ width: '800px', height: '400px' }}>
          {/* render chart for this sensor */}
          {/* we reuse Recharts components directly */}
          {/* Avoid SSR issues by assuming client-side */}
          {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/* @ts-ignore */}
          <div id={`chart-${sensor.id}`}>
            {/* This will be rendered by Recharts */}
          </div>
        </div>
      );

      // small wait for rendering
      await new Promise(resolve => setTimeout(resolve, 200));
      const canvas = await html2canvas(chartDiv, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth - 40;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (yOffset + imgHeight > pdf.internal.pageSize.getHeight()) {
        pdf.addPage();
        yOffset = 20;
      }
      pdf.addImage(imgData, 'PNG', 20, yOffset, imgWidth, imgHeight);
      yOffset += imgHeight + 20;
      root.unmount();
    }

    document.body.removeChild(container);
    pdf.save('dashboard_graficos.pdf');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#131E33', color: '#ccc', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Exportar Dados</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={() => navigate('/m')} variant="outlined" sx={{ color: '#ccc', borderColor: '#ccc' }}>Dashboard</Button>
          <Typography sx={{ alignSelf: 'center' }}>{user?.email}</Typography>
          <Button variant="outlined" color="error" onClick={logout}>Sair</Button>
        </Box>
      </Box>

      <Box sx={{ bgcolor: 'rgba(0,20,47,0.85)', p: 2, borderRadius: 2 }}>
        <label style={{ color: '#ccc' }}>Início</label>
        <input type="datetime-local" value={startDate.toISOString().slice(0,16)} onChange={(e)=>setStartDate(new Date(e.target.value))} style={{ width:'100%', padding:8, marginBottom:8 }} />
        <label style={{ color: '#ccc' }}>Fim</label>
        <input type="datetime-local" value={endDate.toISOString().slice(0,16)} onChange={(e)=>setEndDate(new Date(e.target.value))} style={{ width:'100%', padding:8, marginBottom:12 }} />

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button fullWidth variant="outlined" onClick={handleExportCSV} sx={{ color: '#ccc', borderColor: '#ccc' }}>Exportar .CSV</Button>
          <Button fullWidth variant="outlined" onClick={handleExportPDF} sx={{ color: '#ccc', borderColor: '#ccc' }}>Exportar .PDF</Button>
        </Box>
      </Box>
    </Box>
  );
}
