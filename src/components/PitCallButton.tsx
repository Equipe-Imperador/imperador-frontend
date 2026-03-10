import React, { useState } from "react";
import { Button, Typography, Box, Stack } from "@mui/material";
import axios from "axios";
// IMPORTANTE: Ajuste o caminho de importação do useAuth de acordo com a estrutura da sua pasta
import { useAuth } from "../context/AuthContext";

const PitCallButton: React.FC = () => {
  const { role } = useAuth();
  const [pitActive, setPitActive] = useState(false);
  const [difActive, setDifActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastCall, setLastCalled] = useState<string | null>(null);

  // PROTEÇÃO DE ROTA FRONTEND: Se não for integrante, oculta o painel inteiro
  if (role !== "integrante") {
    return null;
  }

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const handlePitToggle = async () => {
    const confirmMessage = pitActive
      ? "Deseja confirmar o RETORNO à pista?"
      : "Tem certeza que deseja CHAMAR o piloto para o box?";

    if (!window.confirm(confirmMessage)) return;

    try {
      setLoading(true);
      const response = await axios.post(
        "http://72.60.141.159:3000/api/telemetry/pit-call",
        {},
        getAuthHeaders()
      );

      if (response.data.active !== undefined) setPitActive(response.data.active);
      if (response.data.timestamp) setLastCalled(new Date(response.data.timestamp).toLocaleString("pt-BR"));
      
    } catch (error) {
      console.error("Erro ao enviar comando para o box:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDifToggle = async () => {
    const confirmMessage = difActive
      ? "Deseja DESLIGAR o diferencial?"
      : "Deseja LIGAR o diferencial?";

    if (!window.confirm(confirmMessage)) return;

    try {
      setLoading(true);
      const newState = !difActive;
      await axios.post(
        "http://72.60.141.159:3000/api/telemetry/action/differential",
        { estado: newState },
        getAuthHeaders()
      );
      setDifActive(newState);
    } catch (error) {
      console.error("Erro ao acionar diferencial:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleHorn = async (estado: boolean) => {
    try {
      await axios.post(
        "http://72.60.141.159:3000/api/telemetry/action/horn",
        { estado },
        getAuthHeaders()
      );
    } catch (error) {
      console.error("Erro ao acionar buzina:", error);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#ccc", mb: 1 }}>
        Painel de Atuadores
      </Typography>

      <Stack spacing={2}>
        {/* BOTÃO DO BOX */}
        <Button
          fullWidth
          variant="outlined"
          disabled={loading}
          onClick={handlePitToggle}
          sx={{
            bgcolor: pitActive ? "#8d0a0a" : "#004080",
            color: "#fff",
            "&:hover": { bgcolor: pitActive ? "#a00" : "#0050a0" },
          }}
        >
          {pitActive ? "Retornar à Pista" : "Chamar para o Box"}
        </Button>

        {/* BOTÃO DO DIFERENCIAL */}
        <Button
          fullWidth
          variant="outlined"
          disabled={loading}
          onClick={handleDifToggle}
          sx={{
            bgcolor: difActive ? "#2e7d32" : "#333", // Fica verde quando ativo
            color: "#fff",
            "&:hover": { bgcolor: difActive ? "#1b5e20" : "#444" },
          }}
        >
          {difActive ? "Diferencial LIGADO" : "Ligar Diferencial"}
        </Button>

        {/* BOTÃO DA BUZINA (MOMENTÂNEO) */}
        <Button
          fullWidth
          variant="contained"
          disabled={loading}
          onMouseDown={() => handleHorn(true)}   // Dispara ao clicar
          onMouseUp={() => handleHorn(false)}    // Desliga ao soltar
          onMouseLeave={() => handleHorn(false)} // Desliga se o mouse arrastar para fora
          onTouchStart={() => handleHorn(true)}  // Suporte para toque na tela (Celular)
          onTouchEnd={() => handleHorn(false)}   // Suporte para soltar na tela (Celular)
          sx={{
            bgcolor: "#ed6c02",
            color: "#fff",
            "&:hover": { bgcolor: "#e65100" },
          }}
        >
          Buzina (Segure)
        </Button>
      </Stack>

      {lastCall && (
        <Typography variant="body2" sx={{ color: "#aaa", mt: 1, textAlign: "center" }}>
          Último PIT: {lastCall}
        </Typography>
      )}
    </Box>
  );
};

export default PitCallButton;