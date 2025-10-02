import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/MainLayout';
import ControlPanel from '../components/ControlPanel';
import DatePicker from 'react-datepicker';
import { Box, Typography, Button } from '@mui/material';

// Estilos que podemos reutilizar
const styles: { [key: string]: React.CSSProperties } = {
  datePickerInput: { width: '100%', padding: '8px', backgroundColor: '#333', color: 'white', border: '1px solid #555', borderRadius: '4px', boxSizing: 'border-box' },
};

export default function ExportPage() {
  const { user, logout } = useAuth(); // Usamos para o cabeçalho
  
  // Estados para controlar o período de tempo selecionado para a exportação
  const [startDate, setStartDate] = useState(new Date(Date.now() - 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());

  // Função que é chamada quando um dos botões de exportação é clicado
  const handleExport = (format: 'csv' | 'pdf') => {
    const startDateISO = startDate.toISOString();
    const endDateISO = endDate.toISOString();
    
    // Pegamos o token do localStorage para autenticar o download
    const token = localStorage.getItem('authToken');

    // Se não houver token, não fazemos nada e avisamos o usuário
    if (!token) {
        alert("Sua sessão expirou. Por favor, faça o login novamente.");
        return;
    }

    // Montamos a URL completa para o endpoint de exportação do back-end
    // Lembre-se que ajustamos nosso back-end para aceitar o token na URL para esta rota
    const url = `http://72.60.141.159:3000/api/telemetry/export?startDate=${startDateISO}&endDate=${endDateISO}&format=${format}&token=${token}`;
    
    // Abrir a URL em uma nova aba inicia o download do arquivo
    window.open(url, '_blank');
  };

  return (
    // Reutilizamos nosso MainLayout para manter a consistência visual
    <MainLayout
      drawerContent={
        <ControlPanel />
      }
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #444', paddingBottom: '1rem' }}>
        <h1>Exportar Dados de Telemetria</h1>
        <div>
          <span>{user?.email}</span>
          <button onClick={logout} style={{ marginLeft: '1rem' }}>Sair</button>
        </div>
      </header>

      <main style={{ marginTop: '2rem' }}>
        <Typography sx={{ color: 'gray', mb: 4, maxWidth: '600px' }}>
          Selecione o período desejado e o formato para fazer o download. A exportação em CSV contém os dados brutos de todos os sensores, enquanto o PDF gera um relatório visual com os gráficos.
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>
          <div>
            <label>Início:</label>
            <DatePicker
              selected={startDate}
              onChange={(date: Date | null) => date && setStartDate(date)}
              showTimeSelect
              dateFormat="dd/MM/yyyy HH:mm"
              customInput={<input style={styles.datePickerInput} />}
            />
          </div>
          <div>
            <label>Fim:</label>
            <DatePicker
              selected={endDate}
              onChange={(date: Date | null) => date && setEndDate(date)}
              showTimeSelect
              dateFormat="dd/MM/yyyy HH:mm"
              customInput={<input style={styles.datePickerInput} />}
            />
          </div>
          <Box sx={{display: 'flex', gap: '10px', marginTop: '1rem'}}>
             <Button onClick={() => handleExport('csv')} variant="contained" sx={{ flex: 1 }}>Exportar .CSV</Button>
             <Button onClick={() => handleExport('pdf')} variant="contained" sx={{ flex: 1 }}>Exportar .PDF</Button>
          </Box>
        </Box>
      </main>
    </MainLayout>
  );
};