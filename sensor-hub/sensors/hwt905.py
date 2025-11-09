import serial, struct, time, os, platform
from sensors.base_sensor import BaseSensor

def crc16(data: bytes):
    crc = 0xFFFF
    for b in data:
        crc ^= b
        for _ in range(8):
            if crc & 1:
                crc = (crc >> 1) ^ 0xA001
            else:
                crc >>= 1
    return crc

def construir_comando(direccion):
    frame = bytes([direccion, 0x03, 0x00, 0x34, 0x00, 0x06])
    crc = crc16(frame)
    return frame + bytes([crc & 0xFF, crc >> 8])

def a_grados(valor):
    return valor / 32768.0 * 180.0

def detectar_puerto():
    """Detecta el puerto según el sistema operativo."""
    sistema = platform.system().lower()
    if sistema == "windows":
        return "COM6"
    for candidato in ["/dev/ttyUSB0", "/dev/ttyACM0", "/dev/ttyS0"]:
        if os.path.exists(candidato):
            return candidato
    raise FileNotFoundError("No se encontró ningún puerto serial disponible.")

class HWT905Sensor(BaseSensor):
    """Lectura de ángulos (roll, pitch, yaw) desde el HWT905-485."""

    def __init__(self, port: str = None, baudrate: int = 9600, address: int = 0x50):
        super().__init__("hwt905", "mechanical")
        self.port = port or detectar_puerto()
        self.baudrate = baudrate
        self.address = address
        self.comando = construir_comando(address)

        self.ser = None
        try:
            self.ser = serial.Serial(self.port, self.baudrate, timeout=0.2)
            print(f"✅ Conectado al puerto {self.port}")
        except Exception as e:
            print(f"⚠️ No se pudo abrir el puerto {self.port}: {e}")
            print("→ Ejecutando en modo simulado (valores fijos)")
            self.simulado = True
        else:
            self.simulado = False

    def read(self):
        """Lee el sensor real o genera datos simulados."""
        if self.simulado or not self.ser:
            return {
                "roll": 0.0,
                "pitch": 0.0,
                "yaw": 0.0
            }

        try:
            self.ser.write(self.comando)
            time.sleep(0.05)
            respuesta = self.ser.read(33)
            if len(respuesta) >= 17 and respuesta[1] == 0x03:
                data = respuesta[3:15]
                roll_raw, pitch_raw, yaw_raw = struct.unpack(">hhh", data[:6])
                return {
                    "roll": round(a_grados(roll_raw), 2),
                    "pitch": round(a_grados(pitch_raw), 2),
                    "yaw": round(a_grados(yaw_raw), 2)
                }
        except Exception as e:
            print("⚠️ Error al leer HWT905:", e)

        return {"roll": 0.0, "pitch": 0.0, "yaw": 0.0}
