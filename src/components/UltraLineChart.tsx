import React, { useEffect, useRef, useState } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";

interface UltraLineChartProps {
  data: any[];
  dataKey: string;
  label: string;
  color?: string;
  isLast?: boolean;
}

const UltraLineChart: React.FC<UltraLineChartProps> = ({ data, dataKey, label, color, isLast = true }) => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const plotRef = useRef<uPlot | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const [formatted, setFormatted] = useState<[number[], (number | null)[]]>([[], []]);

  useEffect(() => {
    if (!data || data.length === 0) return;
    const MAX = 600;
    const sliced = data.slice(-MAX);

    // Aumentamos a tolerância para 2 segundos. Evita que a linha suma por qualquer atraso de rede.
    const MAX_TIME_GAP_MS = 5000; 

    const times: number[] = [];
    const values: (number | null)[] = [];

    for (let i = 0; i < sliced.length; i++) {
      const current = sliced[i];
      const currentTimeMs = new Date(current.time).getTime();
      const val = current[dataKey] !== undefined && current[dataKey] !== null ? Number(current[dataKey]) : null;

      if (i > 0) {
        const prevTimeMs = new Date(sliced[i - 1].time).getTime();
        if (currentTimeMs - prevTimeMs > MAX_TIME_GAP_MS) {
          times.push((prevTimeMs + 1) / 1000); 
          values.push(null);
        }
      }

      times.push(currentTimeMs / 1000); 
      values.push(val);
    }

    setFormatted([times, values]);
  }, [data, dataKey]);

  useEffect(() => {
    if (!chartRef.current || !formatted[0].length) return;

    // CRIA O TOOLTIP APENAS SE ELE NÃO EXISTIR
    if (!tooltipRef.current) {
      const tt = document.createElement("div");
      tt.className = "uplot-tooltip";
      tt.style.cssText = "position: absolute; background: rgba(20, 20, 20, 0.9); color: #fff; padding: 5px 10px; border: 1px solid #555; border-radius: 4px; pointer-events: none; z-index: 1000; font-size: 12px; display: none; font-family: monospace; box-shadow: 0 2px 10px rgba(0,0,0,0.5); transition: top 0.1s, left 0.1s;";
      document.body.appendChild(tt);
      tooltipRef.current = tt;
    }

    const options: uPlot.Options = {
      width: chartRef.current.clientWidth,
      height: isLast ? 180 : 140,
      cursor: {
        sync: { key: "motecSync", setSeries: true },
        points: { size: 8, fill: color || "#00ff00" },
        dataIdx: (self, seriesIdx, hoveredIdx) => {
          if (seriesIdx === 1 && hoveredIdx !== null && tooltipRef.current) {
            const time = self.data[0][hoveredIdx];
            const val = self.data[1][hoveredIdx];
            
            if (val !== null && val !== undefined) {
                const dateStr = new Date(time * 1000).toLocaleTimeString();
                tooltipRef.current.style.display = "block";
                tooltipRef.current.innerHTML = `<strong>${dateStr}</strong><br/>${label}: ${val?.toFixed(2)}`;
                
                const left = self.cursor.left || 0;
                const top = self.cursor.top || 0;
                
                if (self.over) {
                  const bcr = self.over.getBoundingClientRect();
                  tooltipRef.current.style.left = `${left + bcr.left + 20}px`;
                  tooltipRef.current.style.top = `${top + bcr.top - 40}px`;
                }
            } else {
                tooltipRef.current.style.display = "none";
            }
          }
          return hoveredIdx;
        }
      },
      legend: { show: false },
      scales: {
        y: {
          range: (_self: uPlot, min: number, max: number) => {
            // Proteção para quando todos os dados são zero (evita bugar a escala)
            if (min === max) return [min - 10, max + 10];
            return [min * 0.9, max * 1.1];
          },
        }
      },
      series: [
        {}, 
        { 
          label, 
          stroke: color || "#00ff00", 
          width: 2, 
          points: { show: false },
          spanGaps: false 
        }
      ],
      axes: [
        {
          show: isLast,
          stroke: "#AAA",
          grid: { stroke: "#333", width: 1 },
          values: (_, ticks) => ticks.map((t) => new Date(t * 1000).toLocaleTimeString()),
        },
        {
          stroke: "#AAA",
          grid: { stroke: "#333", width: 1 },
          size: 60,
        },
      ],
    };

    if (plotRef.current) {
      plotRef.current.setData(formatted);
    } else {
      plotRef.current = new uPlot(options, formatted, chartRef.current);
    }

    const handleResize = () => {
      if (plotRef.current && chartRef.current) {
        plotRef.current.setSize({ width: chartRef.current.clientWidth, height: isLast ? 180 : 140 });
      }
    };

    window.addEventListener("resize", handleResize);
    
    // A GRANDE CORREÇÃO DOS FANTASMAS ESTÁ AQUI
    return () => {
      window.removeEventListener("resize", handleResize);
      
      // DESTRÓI o elemento HTML da tela quando atualizar
      if (tooltipRef.current) {
        tooltipRef.current.remove(); 
        tooltipRef.current = null;
      }
      
      // Limpa a memória do gráfico
      if (plotRef.current) {
        plotRef.current.destroy(); 
        plotRef.current = null;
      }
    };
  }, [formatted, isLast, color, label]);

  return <div ref={chartRef} style={{ width: "100%", background: "transparent" }} />;
};

export default React.memo(UltraLineChart);