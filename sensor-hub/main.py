import os, json, time, datetime, requests
from sensors.hwt905 import HWT905Sensor

API_URL = os.getenv("API_URL", "http://10.0.0.200:5000")
CONFIG_PATH = os.getenv("CONFIG_PATH", "config.json")

CONFIG = {}
CONFIG_LAST_MODIFIED = None
SENSORS = []

def load_config():
    """Carga o recarga la configuración desde disco si cambió."""
    global CONFIG, CONFIG_LAST_MODIFIED
    try:
        mtime = os.path.getmtime(CONFIG_PATH)
        if CONFIG_LAST_MODIFIED is None or mtime != CONFIG_LAST_MODIFIED:
            with open(CONFIG_PATH, "r") as f:
                CONFIG = json.load(f)
            CONFIG_LAST_MODIFIED = mtime
        return True
    except Exception as e:
        print(f"⚠️ Error cargando configuración: {e}")
        return False


def save_config(new_config: dict):
    """Guarda y aplica nueva configuración enviada por el servidor."""
    global CONFIG_LAST_MODIFIED
    try:
        with open(CONFIG_PATH, "w") as f:
            json.dump(new_config, f, indent=2)
        CONFIG.update(new_config)
        CONFIG_LAST_MODIFIED = os.path.getmtime(CONFIG_PATH)
        print("\n🛠 Nueva configuración recibida del servidor:")
        print(json.dumps(new_config, indent=2))
    except Exception as e:
        print(f"❌ No se pudo guardar la nueva configuración: {e}")


def send_sensor(config):
    """Envía la configuración del sensor al servidor."""
    try:
        res = requests.post(f"{API_URL}/ingest/sensor", json=config, timeout=5)
        return res.ok
    except Exception as e:
        print("❌ Error enviando sensor:", e)
        return False


def send_reading(reading):
    """Envía una lectura y aplica nueva configuración si llega del servidor."""
    try:
        res = requests.post(
            f"{API_URL}/ingest", 
            json=reading, 
            timeout=5,
            # verify=False
        )

        # Mostrar siempre código de respuesta
        print(f"📨 Respuesta del servidor: {res.status_code}")

        # Cuando el servidor dice ok=false => reenviar config
        if res.status_code == 404:
            print("⚠️ El servidor no reconoce este sensor. Reenviando configuración...")
            send_sensor(CONFIG)
            return

        # Si no hay contenido, no hacemos nada más
        if not res.content:
            print("⚠️ El servidor no devolvió cuerpo en la respuesta.")
            return

        # Intentar decodificar JSON
        try:
            data = res.json()
        except Exception as e:
            print(f"⚠️ No se pudo decodificar JSON: {e}")
            print(f"Contenido crudo: {res.text[:300]}")
            return

        # Revisar si el servidor mandó una nueva config
        if "config" in data:
            new_conf = data["config"]
            if new_conf != CONFIG:
                print("🔄 Nueva configuración detectada en respuesta del servidor.")
                save_config(new_conf)
            else:
                print("ℹ️ Configuración del servidor sin cambios.")
        else:
            print("ℹ️ Sin nueva configuración en la respuesta.")

    except requests.RequestException as e:
        print(f"❌ Error al comunicarse con el servidor: {e}")


def build_reading():
    """Construye el payload con las lecturas de todos los sensores."""
    metrics = {}
    for sensor in SENSORS:
        try:
            group = sensor.group
            metrics.setdefault(group, {}).update(sensor.read())
        except Exception as e:
            metrics.setdefault(sensor.group, {})["error"] = True

    return {
        "sensorId": CONFIG.get("sensorId", "unknown"),
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "metrics": metrics
    }


def run_loop():
    if not load_config():
        print("❌ No se pudo cargar configuración. Abortando.")
        return

    global SENSORS
    SENSORS = [HWT905Sensor()]

    # Registrar sensor
    while not send_sensor(CONFIG):
        time.sleep(5)

    while True:
        # Releer config manual si cambió
        load_config()

        # Enviar lectura
        reading = build_reading()
        send_reading(reading)

        # Esperar el intervalo más reciente
        interval = CONFIG.get("intervalMs", 2000) / 1000.0
        time.sleep(interval)


if __name__ == "__main__":
    try:
        run_loop()
    except KeyboardInterrupt:
        print("\n🛑 Sensor detenido manualmente.")
