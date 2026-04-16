# M1K1U

Plataforma web IoT para una estacion meteorologica con frontend en React, backend en FastAPI y persistencia local en SQLite. El sistema recibe telemetria desde un ESP32, la almacena dentro del mismo proyecto y la visualiza en una interfaz tipo centro de monitoreo.

## Stack

- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: FastAPI + SQLAlchemy + Alembic
- Base de datos: SQLite embebida en `backend/data/m1k1u.db`
- Autenticacion: JWT en cookie HttpOnly
- Graficas: Recharts
- Ingestion IoT: endpoint REST protegido con `X-API-Key`

## Caracteristicas principales

- Landing publica con datos reales o estado vacio si aun no hay transmision
- Login real con usuario inicial `admin / admin123`
- Contrasena almacenada hasheada
- Dashboard protegido con estado de estacion, metricas y tendencias
- Graficas historicas por variable con filtros `24h`, `7d`, `30d` y `all`
- Historial tabular con paginacion y filtros
- Diagnostico individual por sensor
- Alertas operativas y ambientales basadas en el set real del ESP32
- Contrato maestro alineado con `arduino.ino`

## Contrato maestro actual

El archivo `arduino.ino` define los sensores que la plataforma muestra hoy.

Metricas activas:

- `temperature`
- `pressure`
- `altitude`
- `luminosity`
- `rain_analog`
- `rain_digital`
- `wind_speed`

Sensores fisicos:

- BMP280
- BH1750
- MH-RD
- anemometro

## Estructura del proyecto

```text
backend/
  app/
    core/
    models/
    routers/
    schemas/
    seed/
    services/
    database.py
    main.py
  alembic/
  data/
  requirements.txt
frontend/
  src/
    components/
    hooks/
    layouts/
    pages/
    services/
    types/
    utils/
  package.json
arduino.ino
README.md
GUIA_TECNICA.md
```

## Requisitos

- Python 3.13+
- Node.js 22+
- npm 10+

## Instalacion y ejecucion

### 1. Backend

```powershell
cd backend
python -m pip install -r requirements.txt
Copy-Item .env.example .env
python -m uvicorn app.main:app --reload
```

Notas:

- Si no copias `.env`, el backend usa defaults seguros para desarrollo.
- La base `backend/data/m1k1u.db` se crea automaticamente en el primer arranque.
- El seed crea solo el usuario admin.

### 2. Frontend

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Frontend:

- `http://127.0.0.1:5173`

Backend:

- `http://127.0.0.1:8000`
- `http://127.0.0.1:8000/docs`

## Credenciales iniciales

- Usuario: `admin`
- Contrasena: `admin123`

## Variables de entorno

### Backend

Archivo: `backend/.env`

```env
SECRET_KEY=change-this-secret-key
JWT_EXPIRE_MINUTES=720
SENSOR_API_KEY=m1k1u-sensor-key
STATION_ACTIVE_MINUTES=10
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
```

### Frontend

Archivo: `frontend/.env`

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

## Arquitectura rapida

- `frontend/` consume la API con `axios` y `withCredentials`
- `backend/` expone autenticacion, lectura historica y recepcion de datos de sensores
- `SQLite` guarda usuarios y telemetria dentro del mismo proyecto
- `Alembic` administra el esquema
- `arduino.ino` define el contrato maestro y `METRIC_REGISTRY` replica ese set en backend y frontend

## Endpoints principales

### Autenticacion

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Sensores y dashboard

- `POST /api/sensor-data`
- `GET /api/sensor-data/latest`
- `GET /api/sensor-data/history`
- `GET /api/sensor-data/stats`
- `GET /api/sensor-data/public/landing`
- `GET /api/alerts/current`
- `GET /api/sensors/{metric_key}/detail`

Notas:

- `latest`, `history`, `stats`, `alerts` y `detail` requieren sesion autenticada
- `POST /api/sensor-data` usa `X-API-Key`
- `public/landing` es publico

## Ejemplo JSON para ESP32

```json
{
  "station_id": "M1K1U-001",
  "temperature": 28.5,
  "pressure": 1012.3,
  "altitude": 12.4,
  "luminosity": 845.3,
  "rain_analog": 2780,
  "rain_digital": "Seco",
  "wind_speed": 14.7
}
```

Si `timestamp` no se envia, el backend lo genera automaticamente. Si llega sin zona horaria, se interpreta en `America/Bogota` y se normaliza a UTC.

## Aliases aceptados por el backend

- `temperatura_C` -> `temperature`
- `presion_hPa` -> `pressure`
- `altitud_m` -> `altitude`
- `luminosidad_lux` -> `luminosity`
- `lluvia_analog` -> `rain_analog`
- `lluvia_digital` -> `rain_digital`
- `velViento_kmh` -> `wind_speed`

## Probar con Postman o cURL

### Login del admin

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

### Enviar datos desde el ESP32

```bash
curl -X POST http://localhost:8000/api/sensor-data \
  -H "Content-Type: application/json" \
  -H "X-API-Key: m1k1u-sensor-key" \
  -d "{\"station_id\":\"M1K1U-001\",\"temperature\":28.5,\"pressure\":1012.3,\"altitude\":12.4,\"luminosity\":845.3,\"rain_analog\":2780,\"rain_digital\":\"Seco\",\"wind_speed\":14.7}"
```

### Consultar la ultima lectura autenticado

En Postman:

1. Haz `POST /api/auth/login`
2. Conserva la cookie devuelta por el backend
3. Ejecuta `GET /api/sensor-data/latest`

## Integracion con ESP32

El flujo esperado es:

1. El ESP32 se conecta por WiFi
2. Lee BMP280, BH1750, MH-RD y anemometro
3. Construye un JSON con las variables disponibles
4. Lo envia a `POST /api/sensor-data`
5. Incluye el header `X-API-Key`
6. El backend valida, persiste y el dashboard lo refleja en el siguiente ciclo de polling

Nota critica:

- desde el microcontrolador no debes usar `localhost` ni `127.0.0.1`
- `API_URL` debe apuntar a la IP LAN real del equipo donde corre FastAPI
- ejemplo: `http://192.168.1.50:8000/api/sensor-data`

## Alertas implementadas hoy

El sistema deriva alertas activas desde la ultima lectura y el historial reciente usando el set maestro del ESP32:

- estacion sin reporte reciente
- temperatura alta o extrema
- riesgo de congelacion o helada
- descenso brusco de presion
- viento fuerte o extremo
- lluvia detectada por el canal digital del MH-RD
- saturacion del canal analogico de lluvia
- perdida de datos, campo ausente en el ultimo paquete o flatline por sensor

Notas:

- `rain_digital` se trata como estado discreto y se muestra en paneles y alertas, no en graficas numericas
- las alertas de presion se basan en tendencia, no en valor absoluto
- la UI actual solo refleja sensores presentes en `arduino.ino`

## Estado actual del proyecto

- Backend funcional con contrato alineado al ESP32
- Frontend funcional con metricas reales del sketch
- Usuario admin autosembrado
- SQLite integrada y sin dependencias externas
- Landing publica consumiendo telemetria real o estado vacio si aun no hay transmision

## Comandos de verificacion

### Frontend

```powershell
cd frontend
npm run build
```

### Backend

Puedes validar:

- `/health`
- `/api/auth/login`
- `/api/sensor-data/latest`
- `/api/sensor-data/history`
- `/api/sensor-data/stats`
- `/api/alerts/current`
- `POST /api/sensor-data`

## Importante para desarrollo local

Usa el mismo host para frontend y backend. En desarrollo esta base soporta `localhost` y `127.0.0.1`; si cambias el origen del frontend, actualiza `CORS_ORIGIN` y `VITE_API_URL`.
