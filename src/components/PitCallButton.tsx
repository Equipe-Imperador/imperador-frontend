import React, { useState } from "react";
import { Button, Typography, Box } from "@mui/material";
import axios from "axios";

const PitCallButton: React.FC = () => {
  const [pitActive, setPitActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastCall, setLastCalled] = useState<string | null>(null);

  const handlePitToggle = async () => {
    const confirmMessage = pitActive
      ? "Deseja confirmar o RETORNO à pista?"
      : "Tem certeza que deseja CHAMAR o piloto para o box?";

    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) return;

    try {
    setLoading(true);
    const token = localStorage.getItem("authToken");

    const response = await axios.post(
      "http://72.60.141.159:3000/api/telemetry/pit-call",
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.data.active !== undefined) {
      setPitActive(response.data.active);
    }
    if (response.data.timestamp) {
        setLastCalled(new Date(response.data.timestamp).toLocaleString("pt-BR"));
      }
    
    console.log(response.data.message);
  } catch (error) {
    console.error("Erro ao enviar comando para o box:", error);
  } finally {
    setLoading(false);
  }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: "bold", color: "#ccc", mb: 1 }}
      >
        Comandos
      </Typography>

      <Button
        fullWidth
        variant="outlined"
        disabled={loading}
        onClick={handlePitToggle}
        sx={{
          bgcolor: pitActive ? "#8d0a0a" : "#004080",
          color: "#fff",
          "&:hover": {
            bgcolor: pitActive ? "#a00" : "#0050a0",
          },
        }}
      >
        {pitActive ? "Retornar à Pista" : "Chamar para o Box"}
      </Button>

      {lastCall && (
        <Typography
          variant="body2"
          sx={{ color: "#aaa", mt: 1, textAlign: "center" }}
        >
          Última chamada: {lastCall}
        </Typography>
      )}
    </Box>
  );
};

export default PitCallButton;
