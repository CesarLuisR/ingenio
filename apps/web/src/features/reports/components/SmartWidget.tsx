import React from "react";
import { useTheme } from "styled-components";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  CartesianGrid,
  XAxis,
  YAxis
} from "recharts";

import { humanize } from "../utils/humanize";

const DEFAULT_PALETTE = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#dc2626",
  "#7c3aed",
  "#0d9488"
];

interface SmartChartProps {
  type: "BAR" | "LINE" | "PIE";
  data: any[];
  xKey: string;
  yKeys: string[];
  colors?: string[];
}

export const SmartChart: React.FC<SmartChartProps> = ({
  type,
  data,
  xKey,
  yKeys,
  colors
}) => {
  const theme = useTheme();

  const palette = colors && colors.length ? colors : (DEFAULT_PALETTE);
  const axisColor = theme.colors?.text?.secondary || "#64748b";
  const gridColor = theme.colors?.border || "#e5e7eb";

  if (!data || !data.length) {
    return <div style={{ fontSize: 13, color: axisColor }}>No hay datos.</div>;
  }

  const tickStyle = { fill: axisColor, fontSize: 12 };

  // ---------------------- PIE ----------------------
  if (type === "PIE") {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey={yKeys[0] || "value"}
            nameKey={xKey}
            cx="50%"
            cy="50%"
            outerRadius={110}
            innerRadius={60}
            paddingAngle={4}
          >
            {data.map((_d, i) => (
              <Cell key={i} fill={palette[i % palette.length]} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
              color: theme.colors.text.primary,
              borderRadius: 8
            }}
          />
          <Legend
            wrapperStyle={{ color: theme.colors.text.primary, fontSize: 12 }}
            formatter={(value) => humanize(String(value))}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  // ---------------------- LINE ----------------------
  if (type === "LINE") {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid stroke={gridColor} strokeDasharray="4" />
          <XAxis dataKey={xKey} tick={tickStyle} />
          <YAxis tick={tickStyle} />
          <Tooltip
            contentStyle={{
              background: theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
              color: theme.colors.text.primary,
              borderRadius: 8
            }}
          />
          <Legend
            wrapperStyle={{ color: theme.colors.text.primary, fontSize: 12 }}
            formatter={(value) => humanize(String(value))}
          />
          {yKeys.map((k, i) => (
            <Line
              key={k}
              dataKey={k}
              stroke={palette[i % palette.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
              type="monotone"
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  // ---------------------- BAR (por defecto) ----------------------
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid stroke={gridColor} vertical={false} strokeDasharray="4" />
        <XAxis dataKey={xKey} tick={tickStyle} />
        <YAxis tick={tickStyle} />
        <Tooltip
          contentStyle={{
            background: theme.colors.card,
            border: `1px solid ${theme.colors.border}`,
            color: theme.colors.text.primary,
            borderRadius: 8
          }}
        />
        <Legend
          wrapperStyle={{ color: theme.colors.text.primary, fontSize: 12 }}
          formatter={(value) => humanize(String(value))}
        />
        {yKeys.map((k, i) => (
          <Bar
            key={k}
            dataKey={k}
            fill={palette[i % palette.length]}
            radius={[6, 6, 0, 0]}
            maxBarSize={64}
            animationDuration={800}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};
