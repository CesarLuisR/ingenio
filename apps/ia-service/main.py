import logging
import numpy as np
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from prophet import Prophet

# --- CONFIGURACIÓN SILENCIOSA (Evita ruido en consola) ---
logging.getLogger('cmdstanpy').disabled = True
logging.getLogger('prophet').disabled = True
logger = logging.getLogger("uvicorn")

app = FastAPI(title="Ingenio AI Brain 🧠 - Fusion Edition")

# ==========================================
# 1. MODELOS DE DATOS
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
# 2. MOTOR MATEMÁTICO (Helpers)
# ==========================================

def get_smart_anchor(df, span=5):
    """
    Calcula el punto de anclaje usando Media Móvil Exponencial (EWMA).
    Esto conecta el presente con el futuro suavemente, ignorando picos de ruido.
    """
    if len(df) < 2: return df.iloc[-1]['y']
    return df['y'].ewm(span=span, adjust=False).mean().iloc[-1]

def calculate_trend_metrics(start_val, end_val, hours):
    """Calcula pendiente y texto de tendencia"""
    if hours == 0: return 0, "stable"
    slope_total = end_val - start_val
    slope_per_hour = slope_total / hours
    
    # Umbral dinámico: 0.5% del valor base
    threshold = abs(start_val) * 0.005
    
    trend = "stable"
    if slope_per_hour > threshold: trend = "increasing"
    elif slope_per_hour < -threshold: trend = "decreasing"
    
    return slope_per_hour, trend

def downsample_history(df, target_points=200):
    """
    IMPORTANTE: Esta función toma TODA la historia real disponible,
    pero reduce la cantidad de puntos visuales para no saturar el frontend.
    Mantiene la forma de la curva completa (días, semanas) con pocos puntos.
    """
    if len(df) <= target_points:
        return df.copy()
    
    # Seleccionamos índices espaciados equitativamente
    indices = np.linspace(0, len(df) - 1, target_points).astype(int)
    return df.iloc[indices].copy()

def generate_recommendation(status, trend, rul, strategy, volatility):
    prefix = "🧠 [IA] " if "prophet" in strategy else "📊 [Estadística] "
    
    if status == "critical":
        return prefix + "CRÍTICO: Valor fuera de rango. Revisión mandatoria."
    if rul and rul < 24:
        return prefix + f"PREDICCIÓN DE FALLO: Cruce de límite en {rul}h."
    if status == "warning":
        return prefix + "Alerta: Comportamiento anómalo detectado."
    if volatility > 0.15: 
        return prefix + "Inestable: Alta variabilidad detectada."
    if trend == "increasing":
        return prefix + "Tendencia ascendente constante."
    if trend == "decreasing":
        return prefix + "Tendencia descendente constante."
    
    return prefix + "Operación nominal estable."

# ==========================================
# 3. ESTRATEGIA A: REGRESIÓN DE ALTA RESOLUCIÓN (Linear High-Res)
# ==========================================
def analyze_linear_high_res(df, min_val, max_val, anchor_val):
    last_ts = df.iloc[-1]['ds']

    # 1. Pendiente Robusta (Polyfit sobre toda la historia)
    df['ts_num'] = df['ds'].apply(lambda x: x.timestamp())
    
    if len(df) > 1:
        if df['y'].std() == 0: # Línea plana
            m = 0
        else:
            m, _ = np.polyfit(df['ts_num'], df['y'], 1)
    else:
        m = 0

    # Limiter: Evitar proyecciones verticales absurdas
    max_change_ph = anchor_val * 0.10 # Max 10% cambio/hora
    if abs(m * 3600) > abs(max_change_ph):
        m = (max_change_ph / 3600) * (1 if m > 0 else -1)

    # 2. Generación de Puntos (Cada 10 mins = 144 puntos)
    chart_export = []
    
    std_dev = df['y'].std() if len(df) > 2 else (anchor_val * 0.01)
    if np.isnan(std_dev) or std_dev == 0: std_dev = max(abs(anchor_val) * 0.01, 0.1)

    predicted_val_24h = anchor_val
    steps = 144 
    minutes_per_step = 10 

    for i in range(1, steps + 1):
        future_time = last_ts + timedelta(minutes=i * minutes_per_step)
        seconds_from_now = (future_time - last_ts).total_seconds()
        
        # Proyección suave desde el anchor
        y_pred = anchor_val + (m * seconds_from_now)
        
        # Cono de confianza parabólico
        uncertainty = std_dev * np.sqrt(i/6) * 1.96 

        chart_export.append({
            "timestamp": future_time.isoformat(),
            "value": round(y_pred, 2),
            "confidenceLow": round(y_pred - uncertainty, 2),
            "confidenceHigh": round(y_pred + uncertainty, 2),
            "isFuture": True
        })
        
        if i == steps: predicted_val_24h = y_pred

    return chart_export, predicted_val_24h, "linear_high_res"

# ==========================================
# 4. ESTRATEGIA B: PROPHET NEURAL OFFSET (Prophet High-Res)
# ==========================================
def analyze_prophet_high_res(df, min_val, max_val, historical_max, anchor_val):
    try:
        if df['y'].std() < 0.0001:
            return None # Fallback a lineal si es línea plana

        m = Prophet(
            changepoint_prior_scale=0.05, 
            seasonality_mode='additive',
            daily_seasonality=True,
            yearly_seasonality=False,
            weekly_seasonality=False
        )
        m.fit(df)
        
        # Predicción cada 10 minutos (144 puntos) para curvas suaves
        future = m.make_future_dataframe(periods=144, freq='10min')
        forecast = m.predict(future)
    except Exception:
        return None 

    # 1. Cálculo de Offset (El secreto de la continuidad)
    last_real_ts = df.iloc[-1]['ds']
    
    mask = forecast['ds'] <= last_real_ts
    if not mask.any(): return None
    idx_now = forecast[mask].index[-1]
    
    val_model_now = forecast.loc[idx_now, 'yhat']
    offset = anchor_val - val_model_now

    # 2. Ajuste del Futuro
    future_forecast = forecast.iloc[idx_now+1:].head(144).copy()
    if future_forecast.empty: return None

    future_forecast['yhat_adj'] = future_forecast['yhat'] + offset
    future_forecast['yhat_lower_adj'] = future_forecast['yhat_lower'] + offset
    future_forecast['yhat_upper_adj'] = future_forecast['yhat_upper'] + offset

    # Clamping físico
    limit_ceiling = historical_max * 2.0 if historical_max > 0 else 1000000
    future_forecast['yhat_adj'] = future_forecast['yhat_adj'].clip(lower=0, upper=limit_ceiling)

    chart_export = []
    for _, row in future_forecast.iterrows():
        chart_export.append({
            "timestamp": row['ds'].isoformat(),
            "value": round(row['yhat_adj'], 2),
            "confidenceLow": round(row['yhat_lower_adj'], 2),
            "confidenceHigh": round(row['yhat_upper_adj'], 2),
            "isFuture": True
        })

    if not chart_export: return None
    
    predicted_val_24h = chart_export[-1]['value']
    return chart_export, predicted_val_24h, "prophet_neural_res"

# ==========================================
# 5. ORQUESTADOR CENTRAL (FUSIÓN)
# ==========================================
def analyze_metric_ultimate(history_df, min_val, max_val):
    # 1. Limpieza
    if history_df['ds'].dt.tz is not None:
        history_df['ds'] = history_df['ds'].dt.tz_localize(None)

    duration_hours = (history_df['ds'].max() - history_df['ds'].min()).total_seconds() / 3600
    historical_max = history_df['y'].max()
    anchor_val = get_smart_anchor(history_df)
    
    # 2. Ejecución de Estrategia Predictiva
    chart_future = None
    predicted_val = anchor_val
    strategy_name = "linear"

    if duration_hours >= 6:
        res = analyze_prophet_high_res(history_df, min_val, max_val, historical_max, anchor_val)
        if res:
            chart_future, predicted_val, strategy_name = res
    
    if chart_future is None:
        chart_future, predicted_val, strategy_name = analyze_linear_high_res(history_df, min_val, max_val, anchor_val)

    # 3. Procesamiento de Historia (FUSIÓN: Todo el pasado + Downsampling)
    # Aquí usamos 'downsample_history' para traer TODA la data visualmente, 
    # no solo las últimas 6 horas.
    past_visual = downsample_history(history_df, target_points=200)
    
    final_chart = []
    for _, row in past_visual.iterrows():
        final_chart.append({
            "timestamp": row['ds'].isoformat(),
            "value": round(float(row['y']), 2),
            "confidenceLow": round(float(row['y']), 2), # En el pasado no hay duda
            "confidenceHigh": round(float(row['y']), 2),
            "isFuture": False
        })
    
    # Unir Futuro
    final_chart.extend(chart_future)

    # 4. Métricas Finales
    slope, trend = calculate_trend_metrics(anchor_val, predicted_val, 24)
    volatility = history_df['y'].std() / history_df['y'].mean() if history_df['y'].mean() != 0 else 0

    # RUL Calculation (Iterativo sobre alta resolución)
    rul_hours = None
    last_ts = history_df.iloc[-1]['ds']
    
    for point in chart_future:
        val = point['value']
        ts = datetime.fromisoformat(point['timestamp'])
        
        if (max_val is not None and val >= max_val) or \
           (min_val is not None and val <= min_val):
            
            delta = (ts - last_ts).total_seconds() / 3600
            rul_hours = max(0.1, round(delta, 1))
            break 

    # Estado
    status = "ok"
    if max_val is not None:
        if anchor_val > max_val: status = "critical"
        elif predicted_val > max_val: status = "warning"
    if min_val is not None:
        if anchor_val < min_val: status = "critical"
        elif predicted_val < min_val: status = "warning"

    return {
        "status": status,
        "currentValue": round(anchor_val, 2),
        "predictedValue24h": round(predicted_val, 2),
        "trend": trend,
        "slope": round(slope, 4),
        "volatility": round(volatility, 3),
        "rulHours": rul_hours,
        "strategy": strategy_name,
        "recommendation": generate_recommendation(status, trend, rul_hours, strategy_name, volatility),
        "chartData": final_chart
    }

# ==========================================
# 6. ENDPOINT API
# ==========================================

@app.post("/analyze")
def analyze_sensors(payload: List[MachineData]):
    reports = []
    
    for item in payload:
        sensor_id = item.config.sensorId
        readings = item.readings
        metrics_config = item.config.metricsConfig

        if not readings: continue

        sensor_report = { "sensorId": sensor_id, "resumen": {}, "chartData": {} }
        
        # Procesamiento de datos crudos
        flat_data = []
        for r in readings:
            # Normalizar formato fecha
            ts = r.timestamp.replace('Z', '') 
            row = {"ds": ts}
            for cat, metrics in r.metrics.items():
                for name, val in metrics.items():
                    if val is not None: row[f"{cat}__{name}"] = float(val)
            flat_data.append(row)
        
        df_main = pd.DataFrame(flat_data)
        if df_main.empty: continue
        
        try:
            df_main['ds'] = pd.to_datetime(df_main['ds'])
        except Exception:
            continue

        # Ordenar cronológicamente es vital
        df_main = df_main.sort_values("ds")

        if len(df_main) < 2: continue 

        for category, metrics in metrics_config.items():
            if category not in sensor_report["resumen"]:
                sensor_report["resumen"][category] = {}
                sensor_report["chartData"][category] = []

            for metric_name, config in metrics.items():
                col_key = f"{category}__{metric_name}"
                if col_key not in df_main.columns: continue

                # DataFrame específico para esta métrica
                df_metric = df_main[['ds', col_key]].rename(columns={col_key: 'y'}).dropna()
                
                if len(df_metric) < 2: continue

                try:
                    # --- ANÁLISIS PRINCIPAL ---
                    analysis = analyze_metric_ultimate(df_metric, config.min, config.max)
                    
                    # Extraer chartData para reducir peso del JSON de resumen
                    chart_points = analysis.pop("chartData")
                    
                    sensor_report["resumen"][category][metric_name] = analysis
                    sensor_report["chartData"][category].append({
                        "metric": metric_name, 
                        "data": chart_points
                    })
                except Exception as e:
                    print(f"❌ Error en {sensor_id} ({metric_name}): {e}")

        reports.append(sensor_report)

    return { "timestamp": datetime.now().isoformat(), "report": reports }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, workers=1)