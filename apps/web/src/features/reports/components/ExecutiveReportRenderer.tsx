import React from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import {
  type ExecutiveReport,
  type ReportSection,
  type KPISection as KPISectionType,
  type ChartSection as ChartSectionType,
  type TableSection as TableSectionType,
  type InsightSection as InsightSectionType
} from "../../../types/reports";

import { SmartChart } from "./SmartWidget";
import { TableContainer, DataTable } from "../styled";
import { humanize } from "../utils/humanize";

interface Props {
  report: ExecutiveReport;
}

export const ExecutiveReportRenderer: React.FC<Props> = ({ report }) => {
  const handleExportPDF = async () => {
    const element = document.getElementById("executive-report");
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = 210;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${report.title}.pdf`);
  };

  return (
    <>
      {/* Botón PDF */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <button
          onClick={handleExportPDF}
          style={{
            padding: "8px 14px",
            borderRadius: 999,
            background: "#2563eb",
            color: "white",
            border: "none",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.35)"
          }}
        >
          📄 Exportar PDF
        </button>
      </div>

      {/* Contenido del informe (lo que se imprime en PDF) */}
      <div
        id="executive-report"
        style={{
          padding: 24,
          maxWidth: 1000,
          margin: "0 auto",
          background: "white",
          borderRadius: 16,
          border: "1px solid #e5e7eb",
          display: "flex",
          flexDirection: "column",
          gap: 24
        }}
      >
        {/* HEADER */}
        <header>
          <h1
            style={{
              margin: 0,
              fontWeight: 800,
              fontSize: 24,
              letterSpacing: "-0.02em",
              color: "#0f172a"
            }}
          >
            {report.title}
          </h1>

          {report.description && (
            <p style={{ margin: "6px 0 0 0", color: "#475569", fontSize: 14 }}>
              {report.description}
            </p>
          )}

          <small style={{ color: "#94a3b8", fontSize: 12 }}>
            Generado: {new Date(report.generatedAt).toLocaleString()}
          </small>
        </header>

        {/* SECCIONES */}
        {report.sections.map((section, idx) => (
          <SectionRenderer key={idx} section={section} />
        ))}
      </div>
    </>
  );
};

// ------------------------------------------------------------
// SECCIÓN DINÁMICA
// ------------------------------------------------------------
const SectionRenderer = ({ section }: { section: ReportSection }) => {
  switch (section.type) {
    case "KPI":
      return <KPISection section={section as KPISectionType} />;
    case "CHART":
      return <ChartSection section={section as ChartSectionType} />;
    case "TABLE":
      return <TableSection section={section as TableSectionType} />;
    case "INSIGHT":
      return <InsightSection section={section as InsightSectionType} />;
    default:
      return null;
  }
};

// ------------------------------------------------------------
// KPI
// ------------------------------------------------------------
const KPISection: React.FC<{ section: KPISectionType }> = ({ section }) => (
  <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    <h2 style={{ margin: 0, fontSize: 16, color: "#0f172a" }}>
      {section.title || "Indicadores clave"}
    </h2>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 16
      }}
    >
      {section.metrics.map((m, i) => (
        <div
          key={i}
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: "14px 12px",
            background: "#f8fafc",
            textAlign: "center"
          }}
        >
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.06 }}>
            {m.label}
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#0f172a" }}>
            {m.value} {m.unit || ""}
          </div>
        </div>
      ))}
    </div>
  </section>
);

// ------------------------------------------------------------
// CHART
// ------------------------------------------------------------
const ChartSection: React.FC<{ section: ChartSectionType }> = ({ section }) => (
  <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    <h2 style={{ margin: 0, fontSize: 16, color: "#0f172a" }}>
      {section.title || "Visualización"}
    </h2>

    <SmartChart
      type={section.chartType}
      data={section.data}
      xKey={section.xKey}
      yKeys={section.yKeys}
      colors={section.colors}
    />
  </section>
);

// ------------------------------------------------------------
// TABLE
// ------------------------------------------------------------
const TableSection: React.FC<{ section: TableSectionType }> = ({ section }) => (
  <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    <h2 style={{ margin: 0, fontSize: 16, color: "#0f172a" }}>
      {section.title || "Datos detallados"}
    </h2>

    <TableContainer>
      <DataTable>
        <thead>
          <tr>
            {section.columns.map((col) => (
              <th key={col}>{humanize(col)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {section.rows.map((row, i) => (
            <tr key={i}>
              {section.columns.map((col) => (
                <td key={col}>{String(row[col] ?? "-")}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </DataTable>
    </TableContainer>
  </section>
);

// ------------------------------------------------------------
// INSIGHT
// ------------------------------------------------------------
const InsightSection: React.FC<{ section: InsightSectionType }> = ({ section }) => (
  <section style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <h2 style={{ margin: 0, fontSize: 16, color: "#0f172a" }}>
      {section.title || "Análisis automático"}
    </h2>
    <div
      style={{
        background: "#eff6ff",
        borderLeft: "4px solid #3b82f6",
        padding: "12px 14px",
        borderRadius: 8,
        color: "#1e293b",
        fontSize: 14,
        whiteSpace: "pre-line"
      }}
    >
      {section.text || "✍️ Análisis ejecutivo pendiente de generar por IA."}
    </div>
  </section>
);
