from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import pandas as pd
from prophet import Prophet
import numpy as np
from datetime import datetime, timedelta

app = FastAPI(title="Ingenio AI Brain 🧠")

# --- Modelos ---
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

# --- Helpers Generales ---
def calculate_volatility(series):
    mean = series.mean()
    if mean == 0: return 0
    return series.std() / mean

def detect_historical_anomalies(df, threshold=3):
    mean = df['y'].mean()
    std = df['y'].std()
    if std == 0: return 0
    anomalies = df[np.abs(df['y'] - mean) > (threshold * std)]
    return len(anomalies)

def generate_recommendation(status, trend, rul, strategy):
    prefix = "[IA] " if strategy == "prophet" else "[Estadística] "
    
    if status == "critical":
        return prefix + "⚠️ PARADA INMINENTE: Revisión inmediata."
    if rul and rul < 24:
        return prefix + f"ALERTA: Vida útil estimada menor a 24h ({rul}h)."
    if status == "warning":
        return prefix + "Precaución: Valores fuera de rango operativo."
    if trend == "increasing":
        return prefix + "Tendencia ascendente detectada."
    return prefix + "Operación normal y estable."

# ==========================================
# ESTRATEGIA A: CORTO PLAZO (NumPy / Regresión Lineal)
# Para cuando tenemos pocos datos (< 6 horas)
# ==========================================
def analyze_short_term(df, min_val, max_val):
    # Convertimos fechas a números para regresión lineal
    df['timestamp_num'] = df['ds'].apply(lambda x: x.timestamp())
    
    # Ajuste lineal (y = mx + b)
    # m = pendiente, b = intercepto
    m, b = np.polyfit(df['timestamp_num'], df['y'], 1)
    
    current_time = df.iloc[-1]['ds']
    current_val = df.iloc[-1]['y']
    
    # Proyectar 24h (pero con mucho cuidado)
    future_seconds = 24 * 3600
    future_time = current_time + timedelta(seconds=future_seconds)
    predicted_val = m * future_time.timestamp() + b

    # Seguridad: Si la pendiente es minúscula, asumimos estabilidad total
    # Esto evita que 0.0001 de subida se convierta en algo grande en 24h
    if abs(m) < 0.00001: 
        predicted_val = current_val
        m = 0

    # RUL Lineal
    rul_hours = None
    if max_val is not None and m > 0:
        # Tiempo = (Meta - Actual) / Velocidad
        seconds_to_fail = (max_val - current_val) / m
        if seconds_to_fail > 0:
            rul_hours = round(seconds_to_fail / 3600, 1)
            # Si el RUL es mayor a 30 días, lo ignoramos por ser poco fiable
            if rul_hours > 720: rul_hours = None 

    # Generar puntos para la gráfica (Solo 2 puntos: inicio y fin de la recta)
    chart_export = []
    
    # Punto actual
    chart_export.append({
        "timestamp": current_time.strftime('%Y-%m-%dT%H:%M:%S.%fZ'),
        "value": round(current_val, 2),
        "confidenceLow": round(current_val * 0.95, 2), # Margen fijo 5%
        "confidenceHigh": round(current_val * 1.05, 2),
        "isFuture": True # Marcamos como inicio de la proyección
    })
    
    # Punto futuro
    chart_export.append({
        "timestamp": future_time.strftime('%Y-%m-%dT%H:%M:%S.%fZ'),
        "value": round(predicted_val, 2),
        "confidenceLow": round(predicted_val * 0.90, 2), # Margen se abre al 10%
        "confidenceHigh": round(predicted_val * 1.10, 2),
        "isFuture": True
    })

    slope_per_hour = m * 3600
    trend = "stable"
    if slope_per_hour > (current_val * 0.01): trend = "increasing"
    elif slope_per_hour < -(current_val * 0.01): trend = "decreasing"

    return {
        "strategy": "linear",
        "current_val": current_val,
        "predicted_val": predicted_val,
        "slope": slope_per_hour,
        "trend": trend,
        "rul": rul_hours,
        "chart_data": chart_export
    }

# ==========================================
# ESTRATEGIA B: LARGO PLAZO (Prophet IA)
# Para cuando tenemos historia real (> 6 horas)
# ==========================================
def analyze_long_term(df, min_val, max_val, historical_max):
    try:
        m = Prophet(
            changepoint_prior_scale=0.1, # Moderado
            seasonality_mode='additive', 
            daily_seasonality=True
        )
        m.fit(df)
        future = m.make_future_dataframe(periods=24, freq='H')
        forecast = m.predict(future)
    except:
        return None # Fallback

    # Clamping inteligente
    limit_ceiling = historical_max * 1.5 if historical_max > 0 else 1000
    forecast['yhat'] = forecast['yhat'].clip(upper=limit_ceiling)

    future_slice = forecast.tail(24)
    current_val = df.iloc[-1]['y']
    predicted_val = future_slice.iloc[-1]['yhat']
    slope = (predicted_val - current_val)

    trend = "stable"
    threshold = abs(current_val) * 0.02 
    if slope > threshold: trend = "increasing"
    elif slope < -threshold: trend = "decreasing"

    rul_hours = None
    if max_val is not None:
        danger_zone = future_slice[future_slice['yhat'] >= max_val]
        if not danger_zone.empty:
            delta = danger_zone.iloc[0]['ds'] - datetime.now()
            rul_hours = max(0, round(delta.total_seconds() / 3600, 1))

    chart_export = []
    for _, row in forecast.tail(24).iterrows(): # Solo exportamos la parte futura
        if row['ds'] > datetime.now():
            chart_export.append({
                "timestamp": row['ds'].strftime('%Y-%m-%dT%H:%M:%S.%fZ'),
                "value": round(row['yhat'], 2),
                "confidenceLow": round(row['yhat_lower'], 2),
                "confidenceHigh": round(row['yhat_upper'], 2),
                "isFuture": True
            })

    return {
        "strategy": "prophet",
        "current_val": current_val,
        "predicted_val": predicted_val,
        "slope": slope,
        "trend": trend,
        "rul": rul_hours,
        "chart_data": chart_export
    }


# ==========================================
# DISPATCHER PRINCIPAL
# ==========================================
def analyze_metric_smart(history_df, min_val, max_val):
    # Limpieza
    if history_df['ds'].dt.tz is not None:
        history_df['ds'] = history_df['ds'].dt.tz_localize(None)

    # Calcular duración de la historia disponible
    start_time = history_df['ds'].min()
    end_time = history_df['ds'].max()
    duration_hours = (end_time - start_time).total_seconds() / 3600

    current_val = history_df.iloc[-1]['y']
    historical_max = history_df['y'].max()
    
    # Métricas base
    volatility = calculate_volatility(history_df['y'])
    anomalies = detect_historical_anomalies(history_df)
    
    result = None

    # DECISIÓN DE ESTRATEGIA
    # Si tenemos menos de 6 horas de datos, Prophet es peligroso. Usamos Lineal.
    if duration_hours < 6:
        result = analyze_short_term(history_df, min_val, max_val)
    else:
        result = analyze_long_term(history_df, min_val, max_val, historical_max)
        if not result: # Fallback si Prophet falla
             result = analyze_short_term(history_df, min_val, max_val)

    # Construcción de respuesta común
    status = "ok"
    if max_val is not None:
        if result['current_val'] > max_val: status = "critical"
        elif result['predicted_val'] > max_val: status = "warning"
        elif min_val is not None and result['current_val'] < min_val: status = "critical"
    
    if anomalies > 5 and status == "ok": status = "warning"

    # PREPARACIÓN FINAL DEL GRÁFICO (Merging)
    # Queremos mostrar la historia REAL + la predicción de la estrategia elegida
    
    # 1. Historia Real (Downsampled)
    TARGET_POINTS = 100
    past_data = history_df.copy()
    if len(past_data) > TARGET_POINTS:
        indices = np.linspace(0, len(past_data) - 1, TARGET_POINTS, dtype=int)
        past_data = past_data.iloc[indices]

    final_chart = []
    
    # Agregar historia
    for _, row in past_data.iterrows():
        final_chart.append({
            "timestamp": row['ds'].strftime('%Y-%m-%dT%H:%M:%S.%fZ'),
            "value": round(float(row['y']), 2),
            # En el pasado no hay incertidumbre de IA
            "confidenceLow": round(float(row['y']), 2), 
            "confidenceHigh": round(float(row['y']), 2),
            "isFuture": False
        })
    
    # Agregar futuro (que viene de la estrategia seleccionada)
    final_chart.extend(result['chart_data'])

    return {
        "status": status,
        "currentValue": round(result['current_val'], 2),
        "predictedValue24h": round(result['predicted_val'], 2),
        "trend": result['trend'],
        "slope": round(result['slope'], 4),
        "volatility": round(volatility, 3),
        "anomalyCount": anomalies,
        "rulHours": result['rul'],
        "recommendation": generate_recommendation(status, result['trend'], result['rul'], result['strategy']),
        "chartData": final_chart
    }

@app.post("/analyze")
def analyze_sensors(payload: List[MachineData]):
    reports = []
    for item in payload:
        sensor_id = item.config.sensorId
        readings = item.readings
        metrics_config = item.config.metricsConfig

        if not readings: continue

        sensor_report = { "sensorId": sensor_id, "resumen": {}, "chartData": {} }
        
        flat_data = []
        for r in readings:
            row = {"ds": r.timestamp}
            for cat, metrics in r.metrics.items():
                for name, val in metrics.items():
                    if val is not None: row[f"{cat}__{name}"] = float(val)
            flat_data.append(row)
        
        df_main = pd.DataFrame(flat_data)
        if df_main.empty: continue
        df_main['ds'] = pd.to_datetime(df_main['ds'])
        
        # Permitimos análisis con menos datos ahora que tenemos la estrategia Lineal
        if len(df_main) < 2: continue 

        for category, metrics in metrics_config.items():
            if category not in sensor_report["resumen"]:
                sensor_report["resumen"][category] = {}
                sensor_report["chartData"][category] = []

            for metric_name, config in metrics.items():
                col_key = f"{category}__{metric_name}"
                if col_key not in df_main.columns: continue

                df_metric = df_main[['ds', col_key]].rename(columns={col_key: 'y'}).dropna()
                if len(df_metric) < 2: continue

                try:
                    # USAMOS LA NUEVA LÓGICA SMART
                    result = analyze_metric_smart(df_metric, config.min, config.max)
                    
                    if result:
                        chart_points = result.pop("chartData")
                        sensor_report["resumen"][category][metric_name] = result
                        sensor_report["chartData"][category].append({
                            "metric": metric_name, "data": chart_points
                        })
                except Exception as e:
                    print(f"❌ Error {col_key}: {e}")

        reports.append(sensor_report)

    return { "timestamp": datetime.now().isoformat(), "report": reports }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)