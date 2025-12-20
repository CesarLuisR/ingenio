
# UrbiSense Ingenio

UrbiSense Ingenio es una plataforma integral para la monitorización y análisis de datos de sensores en tiempo real, diseñada para entornos industriales y de maquinaria. Permite la ingesta de datos, el análisis mediante modelos de inteligencia artificial, la visualización de métricas y la gestión de mantenimiento.

## Estructura del Proyecto

El proyecto está organizado en una arquitectura de microservicios, con diferentes aplicaciones y servicios desacoplados.

```
/
├── apps/                   # Contiene todas las aplicaciones principales
│   ├── api/                # API backend principal (Node.js)
│   ├── ia-mock/            # Mock del servicio de IA para pruebas
│   ├── ia-service/         # Servicio de predicción de IA (Python)
│   ├── sensor-mock/        # Mock de sensores para generar datos de prueba
│   └── web/                # Aplicación frontend (React)
├── sensor-hub/             # Servicio para interactuar con sensores físicos
├── docker-compose.*.yml    # Archivos de Docker para orquestación
└── .env.example            # Ejemplo de variables de entorno
```

## Aplicaciones

### 1. API (`apps/api`)

Es el cerebro de la plataforma. Una API construida con **Node.js**, **Express** y **TypeScript**. Se encarga de:

-   **Autenticación y Autorización:** Gestión de usuarios, roles y permisos.
-   **Ingesta de Datos:** Recibe datos de los sensores y los almacena.
-   **Comunicación en Tiempo Real:** Utiliza WebSockets para enviar datos a la interfaz de usuario.
-   **Gestión de Entidades:** CRUD para máquinas, sensores, técnicos, fallos, etc.
-   **Análisis y Reportes:** Procesa datos y genera reportes.
-   **Base de Datos:** Utiliza **PostgreSQL** (con Prisma ORM) y **MongoDB**.

### 2. Frontend (`apps/web`)

La interfaz de usuario, desarrollada con **React** y **Vite**. Permite a los usuarios:

-   Visualizar datos de sensores en tiempo real.
-   Ver dashboards con métricas y KPIs.
-   Gestionar máquinas, mantenimientos y usuarios.
-   Analizar fallos y consultar logs de auditoría.
-   Generar y descargar reportes.

### 3. Servicio de IA (`apps/ia-service`)

Un servicio en **Python** que expone un modelo de `Machine Learning` para:

-   Realizar predicciones sobre posibles fallos.
-   Analizar patrones en los datos de los sensores.
-   Clasificar anomalías.

### 4. Mock de Sensores (`apps/sensor-mock`)

Un simulador de sensores en **Node.js** que genera datos de prueba y los envía a la API. Es útil para el desarrollo y las pruebas sin necesidad de hardware físico.

### 5. Mock de IA (`apps/ia-mock`)

Un servicio **Node.js** que simula las respuestas del `ia-service`. Permite desarrollar y probar la integración con la IA sin ejecutar el modelo real.

## Sensor Hub (`sensor-hub`)

Un componente en **Python** diseñado para correr en dispositivos como Raspberry Pi o similar. Se conecta directamente a los sensores físicos (ej. `hwt905`), lee sus datos y los envía a la API central.

## Despliegue

El proyecto está completamente "dockerizado" para facilitar el despliegue en diferentes entornos (desarrollo, producción, etc.).

### Requisitos

-   Docker
-   Docker Compose

### Pasos para el Despliegue (Desarrollo)

1.  **Clonar el repositorio:**
    ```bash
    git clone <URL-del-repositorio>
    cd ingenio
    ```

2.  **Configurar las variables de entorno:**
    Crea un archivo `.env` a partir del ejemplo `.env.example` y ajústalo según tus necesidades.

3.  **Levantar los servicios con Docker Compose:**
    Para un entorno de desarrollo, puedes usar el archivo `docker-compose.dev.yml`.
    ```bash
    docker-compose -f docker-compose.dev.yml up --build
    ```

    Esto construirá las imágenes de cada servicio y los levantará en contenedores interconectados.

## Uso

-   **API:** Disponible en `http://localhost:3000` (o el puerto que configures).
-   **Frontend:** Disponible en `http://localhost:5173` (o el puerto que sirva Vite/Nginx).
-   **IA Service:** Generalmente no se accede directamente, sino a través de la API.

## Contribuciones

Las contribuciones son bienvenidas. Para contribuir:

1.  Haz un "Fork" de este repositorio.
2.  Crea una nueva rama (`git checkout -b feature/nueva-funcionalidad`).
3.  Realiza tus cambios y haz "commit" de ellos (`git commit -m 'Añade nueva funcionalidad'`).
4.  Haz "push" a tu rama (`git push origin feature/nueva-funcionalidad`).
5.  Abre un "Pull Request".

Por favor, asegúrate de que tu código siga las guías de estilo del proyecto y de que los tests (si los hay) pasen.
