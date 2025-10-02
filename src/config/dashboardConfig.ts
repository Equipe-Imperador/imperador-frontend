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

// A "lista mestre" de todos os sensores
export const sensorConfig: WidgetConfig[] = [
  { id: 'rpm_motor', label: 'RPM', unit: 'rpm', maxValue: 9000, color: '#8884d8' },
  { id: 'velocidade_eixo_traseiro', label: 'Velocidade', unit: 'km/h', maxValue: 120, color: '#82ca9d' },
  { id: 'temp_cvt', label: 'Temp. CVT', unit: '°C', maxValue: 120, color: '#ffc658' },
  { id: 'tensao_bateria', label: 'Tensão Bateria', unit: 'V', maxValue: 15, color: '#ff7300' },
  { id: 'pressao_freio_dianteiro', label: 'Pressão Freio Diant.', unit: 'bar', maxValue: 100, color: '#0088FE' },
  { id: 'pressao_freio_traseira', label: 'Pressão Freio Tras.', unit: 'bar', maxValue: 100, color: '#00C49F' },
  { id: 'temp_freio_dianteiro', label: 'Temp. Freio Diant.', unit: '°C', maxValue: 500, color: '#FFBB28' },
  { id: 'temp_freio_traseiro', label: 'Temp. Freio Tras.', unit: '°C', maxValue: 500, color: '#FF8042' },
  { id: 'temperatura_bateria', label: 'Temp. Bateria', unit: '°C', maxValue: 100, color: '#FF6666' },
  { id: 'nivel_combustivel', label: 'Nível Combustível', unit: '%', maxValue: 100, color: '#66FF66' },
  { id: 'velocidade_dianteiro_esq', label: 'Velocidade Diant. Esq', unit: 'km/h', maxValue: 120, color: '#FF66CC' },
  { id: 'velocidade_dianteiro_dir', label: 'Velocidade Diant. Dir', unit: 'km/h', maxValue: 120, color: '#66CCFF' },
  { id: 'temp_oleo_caixa', label: 'Temp. Óleo Caixa', unit: '°C', maxValue: 150, color: '#FF9933' },
  { id: 'pressao_cvt', label: 'Pressão CVT', unit: 'bar', maxValue: 100, color: '#33FF99' },
  { id: 'curso_pedal_acelerador', label: 'Pedal Acelerador', unit: '%', maxValue: 100, color: '#3399FF' },
  { id: 'curso_pedal_freio', label: 'Pedal Freio', unit: '%', maxValue: 100, color: '#FF3333' },
  { id: 'angulo_estercamento', label: 'Esterçamento', unit: '°', maxValue: 45, color: '#CC33FF' },
  { id: 'acelerometro_x', label: 'Acelerômetro X', unit: 'g', maxValue: 10, color: '#33FFCC' },
  { id: 'acelerometro_y', label: 'Acelerômetro Y', unit: 'g', maxValue: 10, color: '#FFCC33' },
  { id: 'acelerometro_z', label: 'Acelerômetro Z', unit: 'g', maxValue: 10, color: '#CCCCCC' },
];

// A definição dos presets
export const presets: { [key: string]: string[] } = {
  powertrain: ['rpm_motor', 'velocidade_eixo_traseiro', 'temp_cvt', 'nivel_combustivel','curso_pedal_acelerador',],
  freios: ['velocidade_eixo_traseiro','pressao_freio_dianteiro', 'pressao_freio_traseira', 'temp_freio_dianteiro', 'temp_freio_traseiro','curso_pedal_acelerador', 'curso_pedal_freio'],
  suspensao: ['velocidade_eixo_traseiro','angulo_estercamento','acelerometro_x', 'acelerometro_y', 'acelerometro_z'],
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