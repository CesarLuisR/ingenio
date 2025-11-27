# Usamos una imagen ligera de Python 3.9 o 3.10
FROM python:3.9-slim

# Instalamos dependencias del sistema necesarias para compilar Prophet
RUN apt-get update && apt-get install -y \
    build-essential \
    libpython3-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiamos requerimientos e instalamos
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos el código fuente
COPY main.py .

# Exponemos el puerto
EXPOSE 8000

# Comando de inicio
CMD ["python", "main.py"]