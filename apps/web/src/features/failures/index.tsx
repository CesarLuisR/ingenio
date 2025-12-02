import { useMemo } from "react";
import FailureForm from "./components/FailureForm";
import {
    Button,
    CardHeader,
    Container,
    Description,
    EditButton,
    FailureCard,
    FailureList,
    FiltersBar,
    Header,
    InfoList,
    LoadingText,
    SelectInput,
    SensorName,
    SeverityTag,
    StatusTag,
    TagRow,
    TextInput,
    Title,
} from "./styled";
import styled from "styled-components";

// Componente SearchableSelect (Ajusta la ruta si es necesario)
import SearchableSelect from "../shared/components/SearchableSelect";

const PaginationFooter = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
  padding-bottom: 30px;

  button {
    padding: 8px 16px;
    background: white;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    &:hover:not(:disabled) {
      background: #f1f5f9;
    }
  }
  
  span {
    color: #64748b;
    font-size: 14px;
  }
`;

import { useSessionStore } from "../../store/sessionStore";
import { hasPermission } from "../../lib/hasPermission";
import { ROLES } from "../../types";
import useFailures from "./hooks/useFailures";

export default function Fallos() {
    const {
        failures,
        machines,
        sensors,
        loading,
        meta,
        setPage,
        
        editing,
        setEditing,
        showForm,
        setShowForm,

        filterMachineId, setFilterMachineId,
        filterSensorId, setFilterSensorId,
        filterSeverity, setFilterSeverity,
        filterStatus, setFilterStatus,
        filterText, setFilterText,

        refresh,
    } = useFailures();

    const { user } = useSessionStore();
    const canReport = hasPermission(user?.role || "", ROLES.TECNICO);
    const canEdit = hasPermission(user?.role || "", ROLES.ADMIN);

    // Opciones para SearchableSelect - Máquinas
    const machineOptions = useMemo(() => {
        const all = { id: 0, name: "Todas las máquinas", code: "" };
        const mapped = machines.map(m => ({ id: m.id, name: m.name, code: m.code || "" }));
        return [all, ...mapped];
    }, [machines]);

    // Opciones para SearchableSelect - Sensores
    const sensorOptions = useMemo(() => {
        const all = { id: 0, name: "Todos los sensores", code: "" };
        const mapped = sensors.map(s => ({ id: s.id, name: s.name, code: "" }));
        return [all, ...mapped];
    }, [sensors]);

    return (
        <Container>
            <Header>
                <div>
                    <Title>Registro de Fallas</Title>
                    <p style={{color: '#64748b', margin: '8px 0 0 0'}}>Seguimiento de incidencias críticas</p>
                </div>
                {canReport && (
                    <Button
                        onClick={() => {
                            setEditing(null);
                            setShowForm(true);
                        }}>
                        + Reportar Falla
                    </Button>
                )}
            </Header>

            {/* BARRA DE FILTROS */}
            <FiltersBar>
                {/* Reemplazo: Máquinas */}
                <div style={{ width: 250, zIndex: 30 }}>
                    <SearchableSelect
                        options={machineOptions}
                        value={Number(filterMachineId) || 0}
                        onChange={(val) => setFilterMachineId(val === 0 ? "" : val.toString())}
                        placeholder="Todas las máquinas"
                    />
                </div>

                {/* Reemplazo: Sensores */}
                <div style={{ width: 250, zIndex: 30 }}>
                    <SearchableSelect
                        options={sensorOptions}
                        value={Number(filterSensorId) || 0}
                        onChange={(val) => setFilterSensorId(val === 0 ? "" : val.toString())}
                        placeholder="Todos los sensores"
                    />
                </div>

                {/* Selects estáticos (Severidad y Estado) se mantienen con SelectInput */}
                <SelectInput
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    style={{ width: 180 }}
                >
                    <option value="">Todas las severidades</option>
                    <option value="Baja">Baja</option>
                    <option value="Media">Media</option>
                    <option value="Alta">Alta</option>
                    <option value="Crítica">Crítica</option>
                </SelectInput>

                <SelectInput
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{ width: 180 }}
                >
                    <option value="">Todos los estados</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="en reparación">En reparación</option>
                    <option value="resuelta">Resuelta</option>
                </SelectInput>

                <TextInput
                    placeholder="🔍 Buscar..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    style={{ flex: 1 }}
                />
            </FiltersBar>

            {/* LISTA DE FALLAS */}
            {loading ? (
                <LoadingText>Cargando datos...</LoadingText>
            ) : (
                <>
                    <FailureList>
                        {failures.length === 0 && (
                            <p style={{textAlign: 'center', color: '#94a3b8', padding: 20}}>
                                No se encontraron fallas con estos filtros.
                            </p>
                        )}
                        {failures.map((f) => {
                            const machine = f.machine || machines.find((m) => m.id === f.machineId);
                            const sensor = f.sensor || sensors.find((s) => s.id === f.sensorId);

                            return (
                                <FailureCard key={f.id}>
                                    <CardHeader>
                                        <SensorName>
                                            {machine?.name || `Máquina ${f.machineId}`}
                                            <span style={{fontWeight: 400, color: '#94a3b8', fontSize: 13, marginLeft: 6}}>
                                                {machine?.code ? `(${machine.code})` : ""}
                                            </span>
                                        </SensorName>
                                        {canEdit && (
                                            <EditButton
                                                onClick={() => {
                                                    setEditing(f);
                                                    setShowForm(true);
                                                }}>
                                                Editar
                                            </EditButton>
                                        )}
                                    </CardHeader>

                                    <TagRow>
                                        <SeverityTag $sev={f.severity || "Media"}>
                                            {f.severity || "Media"}
                                        </SeverityTag>
                                        <StatusTag $sts={f.status || "pendiente"}>
                                            {f.status || "pendiente"}
                                        </StatusTag>
                                        {sensor && (
                                            <span style={{ fontSize: 11, background: "#f1f5f9", padding: "4px 10px", borderRadius: 99, color: '#475569', fontWeight: 600 }}>
                                                📡 {sensor.name}
                                            </span>
                                        )}
                                    </TagRow>

                                    <Description>{f.description}</Description>

                                    <InfoList>
                                        <p>📅 <strong>Detectado:</strong> {new Date(f.occurredAt).toLocaleString()}</p>
                                        {f.resolvedAt && (
                                            <p style={{color: '#16a34a'}}>✅ <strong>Resuelto:</strong> {new Date(f.resolvedAt).toLocaleString()}</p>
                                        )}
                                    </InfoList>
                                </FailureCard>
                            );
                        })}
                    </FailureList>

                    {/* CONTROLES DE PAGINACIÓN */}
                    {failures.length > 0 && (
                        <PaginationFooter>
                            <button 
                                disabled={!meta.hasPreviousPage}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                            >
                                ← Anterior
                            </button>
                            
                            <span>
                                Página <strong>{meta.currentPage}</strong> de {meta.totalPages} 
                                <span style={{marginLeft: 8, fontSize: 12, color: '#94a3b8'}}>
                                    ({meta.totalItems} registros)
                                </span>
                            </span>

                            <button 
                                disabled={!meta.hasNextPage}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Siguiente →
                            </button>
                        </PaginationFooter>
                    )}
                </>
            )}

            {showForm && (
                <FailureForm
                    machines={machines}
                    sensors={sensors}
                    initialData={editing}
                    onClose={() => {
                        setShowForm(false);
                        setEditing(null);
                    }}
                    onSave={() => {
                        refresh();
                        setShowForm(false);
                        setEditing(null);
                    }}
                />
            )}
        </Container>
    );
}