import os, json, time, datetime, requests
from sensors.hwt905 import HWT905Sensor

API_URL = os.getenv("API_URL", "http://localhost:5000")
CONFIG_PATH = os.getenv("CONFIG_PATH", "config.json")

# Cargar configuración del sensor
with open(CONFIG_PATH, "r") as f:
    CONFIG = json.load(f)

# Inicializar sensor (autodetecta COM6 en Windows o /dev/ttyUSB0 en Linux)
SENSORS = [HWT905Sensor()]

def send_sensor(config):
    """Envía la configuración del sensor al servidor"""
    try:
        res = requests.post(f"{API_URL}/ingest/sensor", json=config, timeout=5)
        print(f"📡 Sensor registrado ({res.status_code})")
        return res.ok
    except Exception as e:
        print("❌ Error enviando sensor:", e)
        return False

def send_reading(reading):
    """Envía una lectura al servidor y actualiza la config si es necesario"""
    try:
        res = requests.post(f"{API_URL}/ingest", json=reading, timeout=5)
        if res.status_code == 200:
            data = res.json()
            if "config" in data:
                with open(CONFIG_PATH, "w") as f:
                    json.dump(data["config"], f, indent=2)
                CONFIG.update(data["config"])
                print("🛠 Configuración actualizada desde servidor.")
        print(f"➡️ Lectura enviada ({res.status_code})")
    except Exception as e:
        print("❌ Error enviando lectura:", e)

def build_reading():
    """Construye el payload de lectura usando todos los sensores"""
    metrics = {}
    for sensor in SENSORS:
        try:
            group = sensor.group
            if group not in metrics:
                metrics[group] = {}
            metrics[group].update(sensor.read())
        except Exception as e:
            print(f"⚠️ Error leyendo {sensor.name}: {e}")
            metrics.setdefault(sensor.group, {})["error"] = True

    return {
        "sensorId": CONFIG["sensorId"],
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "metrics": metrics
    }

def run_loop():
    print("🚀 Iniciando sensor real HWT905...")
    while not send_sensor(CONFIG):
        time.sleep(5)

    interval = CONFIG.get("intervalMs", 2000) / 1000.0
    while True:
        reading = build_reading()
        send_reading(reading)
        time.sleep(interval)

if __name__ == "__main__":
    try:
        run_loop()
    except KeyboardInterrupt:
        print("\n🛑 Sensor detenido manualmente.")
