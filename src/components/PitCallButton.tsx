import React, { useState } from "react";
import { Button, Typography, Box, Stack } from "@mui/material";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const PitCallButton: React.FC = () => {
  const { role } = useAuth();
  const [pitActive, setPitActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastCall, setLastCalled] = useState<string | null>(null);

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

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#ccc", mb: 1 }}>
        Painel de Atuadores
      </Typography>

      <Stack spacing={2}>
        {/* APENAS O BOTÃO DO BOX PERMANECE */}
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
