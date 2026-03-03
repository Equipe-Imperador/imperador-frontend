import React from 'react';

// ✅ A Interface agora inclui todas as propriedades necessárias para as Dashboards
interface GaugeProps {
  label: string;
  value: number | undefined;
  unit?: string;
  isOld?: boolean;     // Para o estado offline
  maxValue?: number;   // Para resolver o erro TS2322
}

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
    transition: 'all 0.3s ease'
  },
  label: { fontSize: '0.9em', color: '#AAA', textAlign: 'center' },
  value: { fontSize: '2.2em', fontWeight: 'bold', color: 'white' },
  unit: { fontSize: '0.8em', color: '#AAA' }
};

const GaugeComponent = ({ label, value, unit, isOld, maxValue = 100 }: GaugeProps) => {
  // Converte para número por segurança e trata strings/nulos
  const numericValue = typeof value === 'number' ? value : parseFloat(value as any);
  const displayValue = isNaN(numericValue) ? 0 : numericValue;

  return (
    <div 
      style={{ 
        ...styles.container, 
        opacity: isOld ? 0.4 : 1, 
        borderColor: isOld ? '#cc0000' : '#444',
        boxShadow: isOld ? 'none' : '0px 0px 10px rgba(0,0,0,0.5)'
      }}
    >
      <div style={styles.label}>{label}</div>
      
      <div style={styles.value}>
        {/* Se estiver offline, mostra traços. Se for Status, não usa decimais */}
        {isOld ? "---" : (unit === 'Status' ? displayValue : displayValue.toFixed(1))}
      </div>

      <div style={{ ...styles.unit, color: isOld ? '#cc0000' : '#AAA' }}>
        {isOld ? "OFFLINE" : unit}
      </div>
      
      {/* Opcional: O maxValue está disponível aqui agora para lógicas futuras */}
    </div>
  );
};

export default GaugeComponent;