import React, { useEffect, useRef, useState } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";

interface UltraLineChartProps {
  data: any[];
  dataKey: string;
  label: string;
  color?: string;

}

const UltraLineChart: React.FC<UltraLineChartProps> = ({ data, dataKey, label, color }) => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const plotRef = useRef<uPlot | null>(null);

  const [formatted, setFormatted] = useState<[number[], number[]]>([[], []]);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // reduzimos para no máximo 300 pontos (janela de ~5s)
    const MAX = 300;
    const sliced = data.slice(-MAX);

    setFormatted([
      sliced.map((d) => new Date(d.time).getTime()),
      sliced.map((d) => d[dataKey] ?? 0),
    ]);
  }, [data, dataKey]);

  useEffect(() => {
    if (!chartRef.current) return;
    if (!formatted[0].length) return;

    const options: uPlot.Options = {
      width: chartRef.current.clientWidth,
      height: 250,
      series: [
        {},
        {
          label,
          stroke: color,
          width: 2,
        },
      ],
      axes: [
        {
          stroke: "#AAA",
          grid: { stroke: "#444" },
          values: (_, ticks) => ticks.map((t) => new Date(t).toLocaleTimeString()),
        },
        {
          stroke: "#AAA",
          grid: { stroke: "#444" },
        },
      ],
    };

    if (plotRef.current) {
      plotRef.current.setData(formatted);
      return;
    }

    plotRef.current = new uPlot(options, formatted, chartRef.current);

    const handleResize = () => {
      if (plotRef.current) {
        plotRef.current.setSize({
          width: chartRef.current!.clientWidth,
          height: 250,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);

  }, [formatted]);

  return (
    <div
      ref={chartRef}
      style={{
        width: "100%",
        height: 250,
        background: "#1E1E1E",
        borderRadius: 8,
        padding: 10,
        border: "1px solid #444",
      }}
    />
  );
};

export default React.memo(UltraLineChart);
