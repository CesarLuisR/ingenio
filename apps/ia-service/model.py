import pandas as pd
from prophet import Prophet
from datetime import datetime, timedelta

def predict_sensor_trend(history_data, periods=24, freq='H', threshold_max=None):
    """
    history_data: Lista de dicts [{timestamp: '...', value: 123}, ...]
    periods: Cuántos puntos a futuro predecir (ej: 24 horas)
    freq: Frecuencia ('H' horas, 'min' minutos)
    threshold_max: Valor límite para calcular cuándo se romperá
    """
    
    # 1. Convertir a DataFrame de Pandas (El Excel de Python)
    df = pd.DataFrame(history_data)
    
    # Prophet necesita columnas exactas: 'ds' (fecha) y 'y' (valor)
    df['ds'] = pd.to_datetime(df['timestamp'])
    df['y'] = df['value']
    
    # Limpieza básica: Quitar zonas horarias para evitar conflictos con Prophet
    df['ds'] = df['ds'].dt.tz_localize(None)

    # 2. Entrenar el Modelo
    # changepoint_prior_scale: Hazlo más sensible a cambios recientes (0.5 es agresivo)
    m = Prophet(changepoint_prior_scale=0.05, daily_seasonality=True)
    m.fit(df)

    # 3. Crear el futuro
    future = m.make_future_dataframe(periods=periods, freq=freq)
    forecast = m.predict(future)

    # 4. Extraer solo los datos futuros
    # Tomamos las últimas 'periods' filas
    future_forecast = forecast.tail(periods)
    
    results = []
    time_to_failure = None

    for index, row in future_forecast.iterrows():
        predicted_value = row['yhat']
        timestamp = row['ds']
        
        # Chequeo de "Muerte de Máquina"
        if threshold_max is not None and predicted_value >= threshold_max:
            if time_to_failure is None:
                # Calculamos horas hasta el fallo
                delta = timestamp - datetime.now()
                time_to_failure = delta.total_seconds() / 3600 # Horas

        results.append({
            "timestamp": timestamp.isoformat(),
            "value": round(predicted_value, 2),
            "confidence_low": round(row['yhat_lower'], 2), # Peor caso
            "confidence_high": round(row['yhat_upper'], 2) # Mejor caso
        })

    return {
        "forecast": results,
        "trend": "subiendo" if results[-1]['value'] > results[0]['value'] else "bajando",
        "time_to_failure_hours": round(time_to_failure, 1) if time_to_failure else None
    }