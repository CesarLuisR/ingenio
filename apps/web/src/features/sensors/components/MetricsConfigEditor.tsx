import { useState, useEffect, useCallback } from "react";
import {
    EditorContainer,
    EditorHeader,
    GroupCard,
    GroupHeader,
    GroupTitle,
    MetricRow,
    MetricControls,
    InputField,
    MetricsLabel,
    MetricsButton,
    AddButton,
    DeleteButton,
} from "../styled";

export default function MetricsConfigEditor({
    value,
    onChange,
}: {
    value: Record<string, any>;
    onChange: (val: any) => void;
}) {
    const [config, setConfig] = useState<Record<string, any>>(value || {});
    const [newGroupName, setNewGroupName] = useState("");
    const [newMetricNames, setNewMetricNames] = useState<Record<string, string>>({});

    useEffect(() => { setConfig(value || {}); }, [value]);
    useEffect(() => { onChange(config); }, [config, onChange]);

    const handleAddGroup = useCallback(() => {
        const name = newGroupName.trim();
        if (!name) return;
        setConfig((prev) => {
            if (prev[name]) return prev;
            return { ...prev, [name]: {} };
        });
        setNewGroupName("");
    }, [newGroupName]);

    const handleAddMetric = useCallback((group: string) => {
            const name = (newMetricNames[group] || "").trim();
            if (!name) return;
            setConfig((prev) => {
                const groupObj = prev[group] || {};
                if (groupObj[name]) return prev;
                return {
                    ...prev,
                    [group]: { ...groupObj, [name]: { min: 0, max: 100 } }, // Default 0-100
                };
            });
            setNewMetricNames((prev) => ({ ...prev, [group]: "" }));
        }, [newMetricNames]);

    const updateMetric = useCallback((group: string, metric: string, field: "min" | "max", value: number) => {
            if (isNaN(value)) return;
            setConfig((prev) => {
                const currentGroup = prev[group];
                if (!currentGroup) return prev;
                const currentMetric = currentGroup[metric];
                if (!currentMetric) return prev;

                return {
                    ...prev,
                    [group]: {
                        ...currentGroup,
                        [metric]: { ...currentMetric, [field]: value },
                    },
                };
            });
        }, []);

    const removeMetric = useCallback((group: string, metric: string) => {
        setConfig((prev) => {
            const currentGroup = prev[group];
            if (!currentGroup) return prev;
            const newGroup = { ...currentGroup };
            delete newGroup[metric];
            return { ...prev, [group]: newGroup };
        });
    }, []);

    const removeGroup = useCallback((group: string) => {
        setConfig((prev) => {
            const newConfig = { ...prev };
            delete newConfig[group];
            return newConfig;
        });
    }, []);

    return (
        <EditorContainer>
            <EditorHeader>Configuración de Métricas</EditorHeader>

            {Object.keys(config).length === 0 && (
                <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px', border: '1px dashed #cbd5e1', borderRadius: '8px' }}>
                    No hay métricas configuradas. Comienza añadiendo un grupo.
                </div>
            )}

            {Object.entries(config).map(([group, metrics]) => {
                const isObject = typeof metrics === "object" && !Array.isArray(metrics);
                if (!isObject) return null;

                return (
                    <GroupCard key={group}>
                        <GroupHeader>
                            <GroupTitle>{group}</GroupTitle>
                            <DeleteButton onClick={() => removeGroup(group)} title="Eliminar grupo">✕</DeleteButton>
                        </GroupHeader>

                        {Object.entries(metrics).map(([metric, vals]: any) => {
                            const hasMinMax = vals && typeof vals === "object" && "min" in vals && "max" in vals;

                            return (
                                <MetricRow key={metric}>
                                    <strong>{metric}</strong>
                                    
                                    <MetricControls>
                                        {hasMinMax ? (
                                            <>
                                                <MetricsLabel>
                                                    Min
                                                    <InputField
                                                        type="number"
                                                        value={vals.min}
                                                        onChange={(e) => updateMetric(group, metric, "min", parseFloat(e.target.value))}
                                                    />
                                                </MetricsLabel>
                                                <MetricsLabel>
                                                    Max
                                                    <InputField
                                                        type="number"
                                                        value={vals.max}
                                                        onChange={(e) => updateMetric(group, metric, "max", parseFloat(e.target.value))}
                                                    />
                                                </MetricsLabel>
                                            </>
                                        ) : (
                                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Sólo lectura</span>
                                        )}
                                        <DeleteButton onClick={() => removeMetric(group, metric)} title="Eliminar métrica">🗑️</DeleteButton>
                                    </MetricControls>
                                </MetricRow>
                            );
                        })}

                        {/* Footer del grupo para añadir métrica */}
                        <div style={{ padding: '10px 12px', background: '#fcfcfc', display: 'flex', gap: '8px' }}>
                            <InputField
                                style={{ flex: 1, textAlign: 'left' }}
                                type="text"
                                placeholder="Nueva métrica..."
                                value={newMetricNames[group] || ""}
                                onChange={(e) => setNewMetricNames((prev) => ({ ...prev, [group]: e.target.value }))}
                            />
                            <AddButton type="button" onClick={() => handleAddMetric(group)}>
                                + Añadir
                            </AddButton>
                        </div>
                    </GroupCard>
                );
            })}

            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                <InputField
                    style={{ flex: 1, textAlign: 'left', padding: '10px' }}
                    type="text"
                    placeholder="Nombre del nuevo grupo (ej. Temperatura, Vibración)"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                />
                <MetricsButton type="button" onClick={handleAddGroup}>
                    Crear Grupo
                </MetricsButton>
            </div>
        </EditorContainer>
    );
}