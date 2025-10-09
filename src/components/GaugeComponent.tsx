import React from 'react';

// Estilos para o nosso mostrador
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: '125px',
    height: '125px',
    padding: '12px',
    backgroundColor: '#1E1E1E',
    borderRadius: '6px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #444',
  },
  label: {
    fontSize: '1em',
    color: '#AAA',
  },
  value: {
    fontSize: '2.5em',
    fontWeight: 'bold',
    color: 'white',
  },
  unit: {
    fontSize: '1em',
    color: '#AAA',
  }
};

interface GaugeProps {
  label: string;
  value: number | undefined;
  unit?: string;
  maxValue: number; // Propriedade adicionada
}
const GaugeComponent = ({ label, value, unit }: GaugeProps) => {
  return (
    <div style={styles.container}>
      <div style={styles.label}>{label}</div>
      <div style={styles.value}>{(value ?? 0).toFixed(1)}</div>
      <div style={styles.unit}>{unit}</div>
    </div>
  );
};

export default GaugeComponent;