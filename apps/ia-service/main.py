from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import pandas as pd
from prophet import Prophet
import numpy as np
from datetime import datetime

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

# --- Helpers ---
def calculate_volatility(series):
    """Calcula qué tan 'nerviosa' es la señal (0% a 100%+)"""
    mean = series.mean()
    if mean == 0: return 0
    return series.std() / mean

def detect_historical_anomalies(df, threshold=3):
    """Cuenta cuántos puntos pasados fueron anormales"""
    mean = df['y'].mean()
    std = df['y'].std()
    if std == 0: return 0
    anomalies = df[np.abs(df['y'] - mean) > (threshold * std)]
    return len(anomalies)

def generate_recommendation(status, trend, rul):
    if status == "critical": return "⚠️ PARADA INMINENTE: Revisión inmediata."
    if rul and rul < 48: return "Mantenimiento preventivo sugerido (<48h)."
    if status == "warning": return "Monitorear. Valores fuera de rango."
    if trend == "increasing": return "Tendencia ascendente. Verificar carga."
    return "Operación normal."

def analyze_metric_advanced(history_df, min_val, max_val):
    # 1. Limpieza de Zona Horaria (CRÍTICO PARA PROPHET)
    if history_df['ds'].dt.tz is not None:
        history_df['ds'] = history_df['ds'].dt.tz_localize(None)
    
    current_val = history_df.iloc[-1]['y']
    historical_max = history_df['y'].max()
    volatility = calculate_volatility(history_df['y'])
    anomalies = detect_historical_anomalies(history_df)

    # 2. Configuración "REALISTA" de Prophet
    # changepoint_prior_scale=0.5: Hace al modelo más flexible (detecta curvas rápidas, no solo rectas)
    # seasonality_prior_scale=10.0: Fuerza al modelo a buscar patrones repetitivos (ciclos diarios)
    # seasonality_mode='additive': Mantiene los números bajo control (evita la explosión a 8000)
    try:
        m = Prophet(
            changepoint_prior_scale=0.5, 
            seasonality_prior_scale=10.0,
            seasonality_mode='additive', 
            daily_seasonality=True
        )
        m.fit(history_df)
        future = m.make_future_dataframe(periods=24, freq='H')
        forecast = m.predict(future)
    except:
        return None

    # 3. Recorte de Seguridad (Clamping)
    # Permitimos que suba hasta el doble del máximo histórico, pero no más allá.
    # Esto deja ver picos pero corta alucinaciones infinitas.
    limit_ceiling = historical_max * 2.0 if historical_max > 0 else 1000
    forecast['yhat'] = forecast['yhat'].clip(upper=limit_ceiling)
    forecast['yhat_upper'] = forecast['yhat_upper'].clip(upper=limit_ceiling * 1.2)

    future_slice = forecast.tail(24)
    predicted_24h = future_slice.iloc[-1]['yhat']
    slope = (predicted_24h - current_val)

    # 4. Tendencia y Estado
    trend = "stable"
    threshold = abs(current_val) * 0.02 
    if slope > threshold: trend = "increasing"
    elif slope < -threshold: trend = "decreasing"

    status = "ok"
    if max_val is not None:
        if current_val > max_val: status = "critical"
        elif predicted_24h > max_val: status = "warning"
        elif min_val is not None and current_val < min_val: status = "critical"
    
    if anomalies > 5 and status == "ok":
        status = "warning"

    # 5. RUL (Vida Útil Restante)
    rul_hours = None
    if max_val is not None:
        danger_zone = future_slice[future_slice['yhat'] >= max_val]
        if not danger_zone.empty:
            delta = danger_zone.iloc[0]['ds'] - datetime.now()
            rul_hours = max(0, round(delta.total_seconds() / 3600, 1))

    # 6. Exportar Gráfica (Más contexto: 96 puntos = 3 días historia + 1 día futuro)
    chart_data = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(96)
    
    chart_export = []
    for _, row in chart_data.iterrows():
        chart_export.append({
            "timestamp": row['ds'].strftime('%Y-%m-%dT%H:%M:%S.%fZ'),
            "value": round(row['yhat'], 2),
            "confidenceLow": round(row['yhat_lower'], 2),
            "confidenceHigh": round(row['yhat_upper'], 2),
            "isFuture": row['ds'] > datetime.now()
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
        
        if len(df_main) < 10: continue 

        for category, metrics in metrics_config.items():
            if category not in sensor_report["resumen"]:
                sensor_report["resumen"][category] = {}
                sensor_report["chartData"][category] = []

            for metric_name, config in metrics.items():
                col_key = f"{category}__{metric_name}"
                if col_key not in df_main.columns: continue

                df_metric = df_main[['ds', col_key]].rename(columns={col_key: 'y'}).dropna()
                if len(df_metric) < 5: continue

                try:
                    result = analyze_metric_advanced(df_metric, config.min, config.max)
                    if result:
                        chart_points = result.pop("chartData")
                        sensor_report["resumen"][category][metric_name] = result
                        sensor_report["chartData"][category].append({
                            "metric": metric_name, "data": chart_points
                        })
                except Exception as e:
                    print(f"Error {col_key}: {e}")

        reports.append(sensor_report)

    return { "timestamp": datetime.now().isoformat(), "report": reports }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)