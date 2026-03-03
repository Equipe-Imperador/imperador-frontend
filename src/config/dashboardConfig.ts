// A interface que descreve um ponto de telemetria
export interface TelemetryData {
  time: string;
  [key: string]: any;
}

// A interface para a configuração de um widget
export interface WidgetConfig {
   id: string;
   label: string;
   unit?: string;
   maxValue?: number;
   color?: string;
}

// todos os sensores
export const sensorConfig: WidgetConfig[] = [
  // --- DADOS DO MOTOR E TRANSMISSÃO ---
  { id: 'rpm', label: 'RPM', unit: 'rpm', maxValue: 9000, color: '#f30000ff' },
  { id: 'vel', label: 'Velocidade Tras.', unit: 'km/h', maxValue: 120, color: '#ffc400ff' },
  { id: 'tCVT', label: 'Temp. CVT', unit: '°C', maxValue: 120, color: '#04f591ff' },
  { id: 'dif', label: 'Diferencial', unit: 'Status', maxValue: 1, color: '#a53c8cff' },

  // --- DADOS ELÉTRICOS ---
  { id: 'vBat', label: 'Tensão Bateria', unit: 'V', maxValue: 15, color: '#ff7300' },
  { id: 'tBat', label: 'Temp. Bateria', unit: '°C', maxValue: 100, color: '#FF6666' },

  // --- DINÂMICA E FREIOS ---
  { id: 'pDiant', label: 'Pressão Freio Diant.', unit: 'bar', maxValue: 100, color: '#0088FE' },
  { id: 'pTras', label: 'Pressão Freio Tras.', unit: 'bar', maxValue: 100, color: '#00C49F' },
  { id: 'pCM', label: 'Pressão Cil. Mestre', unit: 'bar', maxValue: 100, color: '#80a53cff' },
  { id: 'vLF', label: 'Velocidade Diant. Esq.', unit: 'km/h', maxValue: 120, color: '#FF66CC' },
  { id: 'vRF', label: 'Velocidade Diant. Dir.', unit: 'km/h', maxValue: 120, color: '#66CCFF' },

  // --- PEDAIS ---
  { id: 'perT', label: 'Pedal Acelerador', unit: '%', maxValue: 100, color: '#3399FF' },
  { id: 'perF', label: 'Curso Freio', unit: '%', maxValue: 100, color: '#FF3333' },
  { id: 'pedF', label: 'Força Pedal Freio', unit: 'kgf', maxValue: 100, color: '#ff00ddff' }, 

  // --- ACELERÔMETRO ---
  { id: 'accX', label: 'Acelerômetro X', unit: 'g', maxValue: 10, color: '#33FFCC' },
  { id: 'accY', label: 'Acelerômetro Y', unit: 'g', maxValue: 10, color: '#FFCC33' },
  { id: 'accZ', label: 'Acelerômetro Z', unit: 'g', maxValue: 10, color: '#CCCCCC' },

  // --- SENSORES ANTIGOS DESATIVADOS NO ESP32 ---
  //{ id: 'corrente_bateria', label: 'Corrente Bateria', unit: 'A', maxValue: 200, color: '#ff00ddff' },
  //{ id: 'gyro_x', label: 'Giroscópio X', unit: '°/s', maxValue: 500, color: '#33FFCC' },
  //{ id: 'gyro_y', label: 'Giroscópio Y', unit: '°/s', maxValue: 500, color: '#FFCC33' },
  //{ id: 'gyro_z', label: 'Giroscópio Z', unit: '°/s', maxValue: 500, color: '#CCCCCC' },
  //{ id: 'ang_x', label: 'Ângulo X (Pitch)', unit: '°', maxValue: 180, color: '#FF6666' },
  //{ id: 'ang_y', label: 'Ângulo Y (Roll)', unit: '°', maxValue: 180, color: '#66FF66' },
  //{ id: 'ang_z', label: 'Ângulo Z (Yaw)', unit: '°', maxValue: 360, color: '#66CCFF' },
];

// A definição dos presets
export const presets: { [key: string]: string[] } = {
  powertrain: [
    'rpm', 
    'vel', 
    'tCVT', 
    'perT', 
    'dif' // O status do diferencial entra bem aqui
  ],
  freios: [
    'vel', 
    'vLF', // Velocidade roda Esquerda (ajuda a ver travamento)
    'vRF', // Velocidade roda Direita
    'pDiant', 
    'pTras', 
    'pCM', // Pressão do Cilindro Mestre
    'perT', 
    'perF', // Curso do freio
    'pedF'  // Força no pedal
  ],
  suspensao: [
    'vel', 
    'vLF', 
    'vRF', 
    'accX', 
    'accY', 
    'accZ'
    // Giroscópio, ângulos e esterçamento foram removidos pois não vêm mais do ESP32
  ],
  eletrica: [
    'vBat', 
    'tBat'
  ],
  todos: sensorConfig.map(s => s.id),
};

export const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: { display: 'flex', fontFamily: 'sans-serif', backgroundColor: '#121212', color: 'white', minHeight: '100vh', overflow: 'hidden' },
  sidebar: { width: '250px', borderRight: '1px solid #444', padding: '1rem', height: '100%', overflowY: 'auto' },
  mainContent: { flex: 1, padding: '1rem', minHeight: '100vh', overflowY: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #444', paddingBottom: '1rem' },
  sectionTitle: { marginTop: '1.5rem', marginBottom: '1rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem', fontSize: '1.1em', fontWeight: 'bold' },
  widgetsContainer: { display: 'flex', flexWrap: 'wrap', gap: '1rem' },
  checkboxLabel: { display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: '0.5rem' },
  button: { width: '100%', padding: '8px', marginBottom: '0.5rem', cursor: 'pointer', backgroundColor: '#333', color: 'white', border: '1px solid #555' },
  datePickerInput: { width: '100%', padding: '8px', backgroundColor: '#333', color: 'white', border: '1px solid #555', borderRadius: '4px', boxSizing: 'border-box' }
};