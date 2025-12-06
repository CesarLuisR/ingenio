import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

import type { ReportData } from '../../../types/reports';
import { WidgetContainer, KPIGrid, KPICard } from '../styled';

// ---------------------------------------------------------------
// 🎨 PALETA PROFESIONAL
// ---------------------------------------------------------------
const PALETTE = [
  '#2563eb', // azul
  '#16a34a', // verde
  '#f59e0b', // amarillo
  '#dc2626', // rojo
  '#7c3aed', // morado
  '#0d9488', // turquesa
  '#fb923c', // naranja
];

// ---------------------------------------------------------------
// 🔍 DETECTOR AUTOMÁTICO DE MÉTRICAS (FALLBACK INTELIGENTE)
// ---------------------------------------------------------------
function detectMetrics(rows: any[]): string[] {
  if (!rows.length) return [];

  const sample = rows[0];

  return Object.entries(sample)
    .filter(([key, value]) =>
      key !== 'label' &&
      typeof value === 'number' &&
      !isNaN(value)
    )
    .map(([key]) => key);
}

// ---------------------------------------------------------------
// 📅 FORMATEADOR UNIVERSAL DE FECHAS
// ---------------------------------------------------------------
function formatXAxis(value: any) {
  const d = new Date(value);
  return isNaN(d.getTime()) ? String(value) : d.toLocaleDateString();
}

// ---------------------------------------------------------------
// 🎁 ESTILO DEL TOOLTIP
// ---------------------------------------------------------------
const tooltipStyle = {
  borderRadius: 8,
  border: '1px solid #e2e8f0',
  background: 'white',
  padding: '10px 14px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
};

// ---------------------------------------------------------------
// 📊 SMART WIDGET DEFINITIVO
// ---------------------------------------------------------------
interface Props {
  report: ReportData;
}

export const SmartWidget: React.FC<Props> = ({ report }) => {
  const { meta, data } = report;
  const safeData = Array.isArray(data) ? data : [];

  console.log("📊 Report recibido:", report);

  // --- EJE X UNIVERSAL ---
  const xKey = 'label';

  // --- MÉTRICAS ---
  let yKeys: string[] = [];

  if (meta.type === 'PIE_CHART') {
    yKeys = ['value'];
  } else if (Array.isArray(meta.yAxisKeys) && meta.yAxisKeys.length) {
    yKeys = meta.yAxisKeys;
  } else {
    yKeys = detectMetrics(safeData);
  }

  // SI NO HAY DATOS → fallback
  if (!safeData.length) {
    return (
      <WidgetContainer>
        <KPIGrid>
          <KPICard>
            <h4>{meta?.title || 'Sin datos'}</h4>
            <span>-</span>
          </KPICard>
        </KPIGrid>
      </WidgetContainer>
    );
  }

  // ---------------------------------------------------------------
  // 📈 LINE CHART
  // ---------------------------------------------------------------
  if (meta.type === 'LINE_CHART') {
    return (
      <WidgetContainer>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={safeData}>
            <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />

            <XAxis
              dataKey={xKey}
              tickFormatter={formatXAxis}
              style={{ fontSize: 12, fill: '#64748b' }}
            />

            <YAxis
              style={{ fontSize: 12, fill: '#64748b' }}
            />

            <Tooltip contentStyle={tooltipStyle} />
            <Legend />

            {yKeys.map((metric, i) => (
              <Line
                key={metric}
                dataKey={metric}
                type="monotone"
                stroke={PALETTE[i % PALETTE.length]}
                strokeWidth={3}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </WidgetContainer>
    );
  }

  // ---------------------------------------------------------------
  // 📊 BAR CHART
  // ---------------------------------------------------------------
  if (meta.type === 'BAR_CHART') {
    return (
      <WidgetContainer>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={safeData}>
            <CartesianGrid stroke="#f1f5f9" vertical={false} />

            <XAxis
              dataKey={xKey}
              style={{ fontSize: 12, fill: '#64748b' }}
            />

            <YAxis style={{ fontSize: 12, fill: '#64748b' }} />

            <Tooltip contentStyle={tooltipStyle} />
            <Legend />

            {yKeys.map((metric, i) => (
              <Bar
                key={metric}
                dataKey={metric}
                fill={PALETTE[i % PALETTE.length]}
                radius={[6, 6, 0, 0]}
                maxBarSize={60}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </WidgetContainer>
    );
  }

  // ---------------------------------------------------------------
  // 🍩 PIE CHART
  // ---------------------------------------------------------------
  if (meta.type === 'PIE_CHART') {
    return (
      <WidgetContainer>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={safeData}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={120}
              paddingAngle={3}
            >
              {safeData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.fill || PALETTE[i % PALETTE.length]}
                />
              ))}
            </Pie>

            <Tooltip contentStyle={tooltipStyle} />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </WidgetContainer>
    );
  }

  // ---------------------------------------------------------------
  // 🔢 KPI CARDS (Fallback cuando no es gráficable)
  // ---------------------------------------------------------------
  return (
    <WidgetContainer>
      <KPIGrid>
        {safeData.slice(0, 4).map((item, idx) => (
          <KPICard key={idx}>
            <h4>{item.label || meta.title}</h4>
            <span>{item.value ?? Object.values(item)[1] ?? '--'} {meta.units}</span>
          </KPICard>
        ))}
      </KPIGrid>
    </WidgetContainer>
  );
};
