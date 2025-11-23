from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import pandas as pd
from prophet import Prophet
import numpy as np
from datetime import datetime, timedelta

app = FastAPI(title="Ingenio AI Brain 🧠")

# ==========================================
# 1. MODELOS DE DATOS (Pydantic)
# ==========================================

class MetricConfig(BaseModel):
    min: Optional[float] = None
    max: Optional[float] = None

class SensorConfig(BaseModel):
    sensorId: str
    metricsConfig: Dict[str, Dict[str, MetricConfig]]

class Reading(BaseModel):
    timestamp: str
    metrics: Dict[str, Dict[str, float]]

class MachineData(BaseModel):
    config: SensorConfig
    readings: List[Reading]

# ==========================================
# 2. LÓGICA MATEMÁTICA Y ESTADÍSTICA
# ==========================================

def calculate_volatility(series):
    """
    Calcula el Coeficiente de Variación (CV).
    Indica qué tan inestable es la señal (0.0 = plana, 0.5 = muy nerviosa).
    """
    mean = series.mean()
    if mean == 0: return 0
    return series.std() / mean

def detect_historical_anomalies(df, threshold=3):
    """
    Detecta cuántos puntos en la historia se desviaron más de 3 sigmas.
    Útil para saber si la máquina ha estado comportándose raro recientemente.
    """
    mean = df['y'].mean()
    std = df['y'].std()
    if std == 0: return 0
    
    # Z-Score robusto
    anomalies = df[np.abs(df['y'] - mean) > (threshold * std)]
    return len(anomalies)

def generate_recommendation(status, trend, rul):
    """Genera un mensaje legible para humanos basado en los datos."""
    if status == "critical":
        return "⚠️ PARADA INMINENTE: Los valores actuales son críticos. Revisión inmediata."
    
    if rul and rul < 24:
        return f"ALERTA: Vida útil estimada menor a 24h ({rul}h). Planificar recambio."
    
    if rul and rul < 48:
        return "Mantenimiento preventivo sugerido a corto plazo."
    
    if status == "warning":
        return "Precaución: Valores fuera de rango operativo óptimo. Monitorear."
    
    if trend == "increasing":
        return "Tendencia ascendente detectada. Verificar carga de trabajo o lubricación."
    
    return "Operación normal. Parámetros estables."

def analyze_metric_advanced(history_df, min_val, max_val):
    """
    Núcleo del análisis. Entrena Prophet, fusiona datos reales con predicciones
    y calcula estadísticas de ingeniería.
    """
    
    # --- A. LIMPIEZA DE DATOS ---
    # Eliminar zona horaria para evitar conflictos con Prophet
    if history_df['ds'].dt.tz is not None:
        history_df['ds'] = history_df['ds'].dt.tz_localize(None)
    
    current_val = history_df.iloc[-1]['y']
    historical_max = history_df['y'].max()
    
    # Estadísticas sobre datos REALES (no predicciones)
    volatility = calculate_volatility(history_df['y'])
    anomalies = detect_historical_anomalies(history_df)

    # --- B. ENTRENAMIENTO DE IA (Prophet) ---
    try:
        # Configuración ajustada para realismo:
        # - changepoint_prior_scale=0.5: Hace al modelo flexible para seguir curvas reales.
        # - seasonality_mode='additive': Evita explosiones exponenciales locas.
        # - daily_seasonality=True: Busca patrones de día/noche.
        m = Prophet(
            changepoint_prior_scale=0.5, 
            seasonality_prior_scale=10.0,
            seasonality_mode='additive', 
            daily_seasonality=True
        )
        m.fit(history_df)
        
        # Predecir 24 horas al futuro
        future = m.make_future_dataframe(periods=24, freq='H')
        forecast = m.predict(future)
    except Exception as e:
        print(f"Error entrenando Prophet: {e}")
        return None

    # --- C. POST-PROCESAMIENTO Y SEGURIDAD ---
    
    # Clamping: Recortamos la predicción futura si se vuelve loca (más del doble del histórico)
    # Esto evita que una gráfica de 220V muestre 8000V por una alucinación matemática.
    limit_ceiling = historical_max * 2.0 if historical_max > 0 else 1000
    forecast['yhat'] = forecast['yhat'].clip(upper=limit_ceiling)
    forecast['yhat_upper'] = forecast['yhat_upper'].clip(upper=limit_ceiling * 1.2)

    # --- D. CÁLCULOS DE TENDENCIA Y RUL ---
    
    future_slice = forecast.tail(24)
    predicted_24h = future_slice.iloc[-1]['yhat']
    
    # Pendiente: Diferencia entre lo que será mañana y lo que es hoy
    slope = (predicted_24h - current_val)

    # Tendencia cualitativa
    trend = "stable"
    threshold = abs(current_val) * 0.02 # Umbral de sensibilidad del 2%
    if slope > threshold: trend = "increasing"
    elif slope < -threshold: trend = "decreasing"

    # Estado del Semáforo
    status = "ok"
    if max_val is not None:
        if current_val > max_val: status = "critical"
        elif predicted_24h > max_val: status = "warning"
        elif min_val is not None and current_val < min_val: status = "critical"
    
    # Si hay muchas anomalías pasadas, subimos a warning aunque el valor actual esté bien
    if anomalies > 5 and status == "ok":
        status = "warning"

    # RUL (Remaining Useful Life)
    rul_hours = None
    if max_val is not None:
        # Buscamos cuándo la predicción cruza el límite máximo
        danger_zone = future_slice[future_slice['yhat'] >= max_val]
        if not danger_zone.empty:
            fail_time = danger_zone.iloc[0]['ds']
            now_time = datetime.now()
            delta = fail_time - now_time
            rul_hours = max(0, round(delta.total_seconds() / 3600, 1))

    # --- E. PREPARACIÓN DE LA GRÁFICA (REAL vs PREDICCIÓN) ---
    
    # MAGIA AQUÍ: Unimos los datos REALES (history_df) con la predicción (forecast)
    # history_df tiene ['ds', 'y'] -> Datos reales ruidosos
    # forecast tiene ['ds', 'yhat', ...] -> Línea suave de la IA
    
    merged = pd.merge(forecast, history_df[['ds', 'y']], on='ds', how='left')
    
    # Tomamos una ventana de tiempo útil para el frontend (ej: últimos 3 días + 1 día futuro)
    final_data = merged.tail(96) 
    chart_export = []
    now = datetime.now()

    for _, row in final_data.iterrows():
        is_future = row['ds'] > now
        
        # LÓGICA DE VISUALIZACIÓN:
        # 1. Si es pasado y tenemos dato real ('y'), usamos el REAL.
        # 2. Si es pasado pero falta dato (sensor off), usamos la estimación ('yhat') para rellenar el hueco.
        # 3. Si es futuro, usamos obligatoriamente la predicción ('yhat').
        
        final_value = row['yhat'] if is_future else (row['y'] if pd.notna(row['y']) else row['yhat'])

        chart_export.append({
            "timestamp": row['ds'].strftime('%Y-%m-%dT%H:%M:%S.%fZ'),
            "value": round(float(final_value), 2),
            "confidenceLow": round(row['yhat_lower'], 2),
            "confidenceHigh": round(row['yhat_upper'], 2),
            "isFuture": is_future
        })

    return {
        "status": status,
        "currentValue": round(current_val, 2),
        "predictedValue24h": round(predicted_24h, 2),
        "trend": trend,
        "slope": round(slope, 4),
        "volatility": round(volatility, 3),
        "anomalyCount": anomalies,
        "rulHours": rul_hours,
        "recommendation": generate_recommendation(status, trend, rul_hours),
        "chartData": chart_export
    }

# ==========================================
# 3. ENDPOINT PRINCIPAL
# ==========================================

@app.post("/analyze")
def analyze_sensors(payload: List[MachineData]):
    reports = []
    
    for item in payload:
        sensor_id = item.config.sensorId
        readings = item.readings
        metrics_config = item.config.metricsConfig

        if not readings:
            continue

        sensor_report = {
            "sensorId": sensor_id,
            "resumen": {},
            "chartData": {}
        }

        # Aplanar lecturas para Pandas
        flat_data = []
        for r in readings:
            row = {"ds": r.timestamp}
            for cat, metrics in r.metrics.items():
                for name, val in metrics.items():
                    if val is not None:
                        row[f"{cat}__{name}"] = float(val)
            flat_data.append(row)
        
        df_main = pd.DataFrame(flat_data)
        if df_main.empty: continue
        
        # Parsear fechas
        df_main['ds'] = pd.to_datetime(df_main['ds'])
        
        # Necesitamos historial mínimo para que la estadística sea válida
        if len(df_main) < 10: continue 

        # Iterar por cada métrica configurada
        for category, metrics in metrics_config.items():
            if category not in sensor_report["resumen"]:
                sensor_report["resumen"][category] = {}
                sensor_report["chartData"][category] = []

            for metric_name, config in metrics.items():
                col_key = f"{category}__{metric_name}"
                
                if col_key not in df_main.columns: continue

                # Extraer serie de tiempo limpia para esta métrica
                df_metric = df_main[['ds', col_key]].rename(columns={col_key: 'y'}).dropna()
                
                if len(df_metric) < 5: continue

                try:
                    # Ejecutar análisis avanzado
                    result = analyze_metric_advanced(df_metric, config.min, config.max)
                    
                    if result:
                        # Extraer datos de gráfico para mantener el JSON limpio
                        chart_points = result.pop("chartData")
                        
                        sensor_report["resumen"][category][metric_name] = result
                        sensor_report["chartData"][category].append({
                            "metric": metric_name,
                            "data": chart_points
                        })
                except Exception as e:
                    print(f"❌ Error analizando {sensor_id}::{col_key}: {e}")

        reports.append(sensor_report)

    return {
        "timestamp": datetime.now().isoformat(),
        "report": reports
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)