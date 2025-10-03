// EXPORT PAGE - ExportPage.tsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { Box, Typography, Button } from '@mui/material';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { createRoot } from 'react-dom/client';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import { useTelemetryData } from '../hooks/useTelemetryData';
import { sensorConfig } from '../config/dashboardConfig';
import logo from '../assets/logo.png';
import "react-datepicker/dist/react-datepicker.css";
import { styles } from '../config/dashboardConfig';

export default function ExportPage() {
  const { user, logout } = useAuth();
  const [startDate, setStartDate] = useState(new Date(Date.now() - 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const { historicalData, fetchHistory } = useTelemetryData();

  const handleExportCSV = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return alert("Token não encontrado. Faça login novamente.");

    try {
      const startDateISO = startDate.toISOString();
      const endDateISO = endDate.toISOString();
      const response = await fetch(
        `http://72.60.141.159:3000/api/telemetry/export?startDate=${startDateISO}&endDate=${endDateISO}&format=csv`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error("Falha na exportação CSV");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `telemetry_export.csv`;
      link.click();
    } catch (err) {
      console.error(err);
      alert("Erro ao exportar CSV.");
    }
  };

  const handleExportPDF = async () => {
    await fetchHistory(startDate, endDate); // atualiza historicalData
    if (!historicalData || historicalData.length === 0) {
      alert("Não há dados para gerar os gráficos.");
      return;
    }

    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    document.body.appendChild(container);

    const pdf = new jsPDF("landscape", "pt", "a4");
    let yOffset = 20;

    for (let i = 0; i < sensorConfig.length; i++) {
      const sensor = sensorConfig[i];
      const chartDiv = document.createElement("div");
      chartDiv.style.width = "600px";
      chartDiv.style.height = "300px";
      container.appendChild(chartDiv);

      const root = createRoot(chartDiv);
      root.render(
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={historicalData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="time" tickFormatter={(time) => new Date(time).toLocaleTimeString()} stroke="#DDD" />
            <YAxis stroke="#DDD" />
            <Tooltip contentStyle={{ backgroundColor: "#111" }} />
            <Legend />
            <Line type="monotone" dataKey={sensor.id} stroke={sensor.color} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      );

      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(chartDiv, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth - 40;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (yOffset + imgHeight > pdf.internal.pageSize.getHeight()) {
        pdf.addPage();
        yOffset = 20;
      }

      pdf.addImage(imgData, "PNG", 20, yOffset, imgWidth, imgHeight);
      yOffset += imgHeight + 20;
      root.unmount();
    }

    document.body.removeChild(container);
    pdf.save("dashboard_graficos.pdf");
  };

  return (
    <div
      style={{
        ...styles.pageContainer,
        minHeight: '100vh',
        backgroundColor: '#131E33',
        backgroundImage: `url(${logo})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        position: 'relative',
      }}
    >
      <div style={{ position: 'relative', zIndex: 1, padding: 20 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Typography variant="h4" sx={{ color: '#FFF' }}>Exportar Dados de Telemetria</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Link to="/"><Button variant="outlined" sx={{ color: '#FFF', borderColor: '#FFF' }}>Dashboard</Button></Link>
            <Typography sx={{ color: '#FFF' }}>{user?.email}</Typography>
            <Button variant="outlined" color="error" onClick={logout}>Sair</Button>
          </Box>
        </header>

        <main>
          <Box sx={{ p: 3, maxWidth: 700, backgroundColor: 'rgba(0,20,47,0.85)', borderRadius: 3 }}>
            <Typography sx={{ color: 'white', mb: 3 }}>
              Selecione o período desejado e o formato para fazer o download.
              A exportação em CSV contém os dados brutos de todos os sensores,
              enquanto o PDF gera um relatório visual com os gráficos.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Box sx={{ flex: 1 }}>
                <label style={{ color: 'white' }}>Início:</label>
                <DatePicker
                  selected={startDate}
                  onChange={(date: Date | null) => date && setStartDate(date)}
                  showTimeSelect
                  dateFormat="dd/MM/yyyy HH:mm"
                  customInput={<input style={styles.datePickerInput} />}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <label style={{ color: 'white' }}>Fim:</label>
                <DatePicker
                  selected={endDate}
                  onChange={(date: Date | null) => date && setEndDate(date)}
                  showTimeSelect
                  dateFormat="dd/MM/yyyy HH:mm"
                  customInput={<input style={styles.datePickerInput} />}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" fullWidth onClick={handleExportCSV} sx={{ color: '#FFF', borderColor: '#FFF' }}>Exportar .CSV</Button>
              <Button variant="outlined" fullWidth onClick={handleExportPDF} sx={{ color: '#FFF', borderColor: '#FFF' }}>Exportar .PDF</Button>
            </Box>
          </Box>
        </main>
      </div>
    </div>
  );
}
