# GUIA TECNICA M1K1U

## 1. Que es este proyecto

M1K1U es una plataforma web IoT para una estacion meteorologica.

Su objetivo es:

- recibir datos desde un ESP32 por HTTP
- guardar esos datos localmente en SQLite
- mostrar esos datos en una interfaz web moderna
- proteger el panel administrativo con login
- mantener una capa publica para visualizar el estado de la estacion sin iniciar sesion

No depende de MySQL ni PostgreSQL.
La base de datos esta embebida dentro del proyecto.

## 2. Fuente maestra de datos

El archivo `arduino.ino` es el contrato maestro del sistema.

Eso significa que:

- los sensores definidos en el sketch son los que la web muestra
- el backend valida ese mismo set de campos
- cualquier metrica fuera de ese contrato no debe aparecer en la UI actual

### Sensores actuales del ESP32

- `temperature`
- `pressure`
- `altitude`
- `luminosity`
- `rain_analog`
- `rain_digital`
- `wind_speed`

### Sensores fisicos usados por el sketch

- BMP280: temperatura, presion y altitud
- BH1750: luminosidad
- MH-RD: lluvia analogica y lluvia digital
- anemometro: velocidad del viento

## 3. Stack real del proyecto

### Backend

- FastAPI
- SQLAlchemy 2
- Alembic
- SQLite
- PyJWT
- pwdlib con Argon2 para hash de contrasenas

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- Recharts
- Axios

### Firmware / hardware

- ESP32 con Arduino IDE
- envio de datos por WiFi usando HTTP POST
- payload JSON

## 4. Estructura general

```text
backend/
  alembic/
  app/
    core/
    models/
    routers/
    schemas/
    seed/
    services/
    database.py
    main.py
  data/
    m1k1u.db
  .env
  .env.example
  alembic.ini
  requirements.txt

frontend/
  src/
    components/
    data/
    hooks/
    layouts/
    pages/
    services/
    types/
    utils/
    App.tsx
    main.tsx
    index.css
  .env
  .env.example
  package.json

arduino.ino
README.md
GUIA_TECNICA.md
```

## 5. Como funciona el sistema

El flujo completo es este:

1. El ESP32 lee los sensores del sketch maestro.
2. El dispositivo arma un JSON solo con las metricas disponibles.
3. El dispositivo hace un `POST /api/sensor-data` al backend.
4. FastAPI valida la API key y el payload.
5. El backend normaliza el timestamp y guarda la lectura en SQLite.
6. El frontend consulta la API por polling cada 15 segundos.
7. La landing publica y el panel privado muestran el estado actual y el historial real.

## 6. Arquitectura del backend

### 6.1 Archivo principal

Archivo principal del backend:

- `main.py`

Este archivo:

- crea la aplicacion FastAPI
- configura CORS
- ejecuta migraciones Alembic al arrancar
- ejecuta el seed inicial
- registra los routers
- expone `/health`

### 6.2 Configuracion

Archivo de configuracion:

- `config.py`

Variables importantes:

- `SECRET_KEY`
- `JWT_EXPIRE_MINUTES`
- `SENSOR_API_KEY`
- `STATION_ACTIVE_MINUTES`
- `CORS_ORIGIN`

Defaults reales:

- cookie de sesion: `m1k1u_session`
- zona horaria local: `America/Bogota`
- base de datos: `backend/data/m1k1u.db`

### 6.3 Base de datos

Archivo de base de datos:

- `database.py`

Puntos importantes:

- usa SQLAlchemy
- crea `engine` sobre SQLite
- usa una clase `UtcDateTime` para guardar fechas en UTC
- toda sesion DB sale de `SessionLocal`

### 6.4 Modelo `users`

Tabla `users`:

- `id`
- `username`
- `password_hash`
- `role`
- `created_at`

### 6.5 Modelo `sensor_data`

Tabla `sensor_data`:

- `id`
- `station_id`
- `temperature`
- `pressure`
- `altitude`
- `luminosity`
- `rain_analog`
- `rain_digital`
- `wind_speed`
- `timestamp`
- `created_at`

Notas:

- existen columnas historicas heredadas de iteraciones previas, pero la logica actual solo usa el contrato maestro del ESP32
- `rain_digital` es un estado discreto y no una serie numerica

Indices principales:

- `station_id`
- `timestamp`

### 6.6 Migraciones

Carpeta de migraciones:

- `backend/alembic/versions`

Migraciones relevantes:

- `20260404_0001_create_initial_schema.py`
- `20260404_0002_make_sensor_metrics_nullable.py`
- `20260404_0003_add_rain_altitude_metrics.py`
- `20260407_0004_add_arduino_master_metrics.py`

Estas migraciones se aplican automaticamente al arrancar el backend.

### 6.7 Seed inicial

Archivo de seed:

- `seed_service.py`

Que hace:

- si no existe el usuario `admin`, lo crea
- la contrasena se guarda hasheada

Credenciales iniciales:

- usuario: `admin`
- contrasena: `admin123`

### 6.8 Seguridad

Archivo de seguridad:

- `security.py`

Implementa:

- hash de contrasenas
- verificacion de contrasenas
- JWT con algoritmo `HS256`
- expiracion del token

Archivo de servicio de autenticacion:

- `auth_service.py`

Implementa:

- autenticacion de usuario
- lectura de cookie `HttpOnly`
- cierre de sesion
- carga del usuario actual

## 7. Routers del backend

### 7.1 Autenticacion

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### 7.2 Datos de sensores

- `POST /api/sensor-data`
- `GET /api/sensor-data/latest`
- `GET /api/sensor-data/public/landing`
- `GET /api/sensor-data/history`
- `GET /api/sensor-data/stats`

Notas:

- `POST /api/sensor-data` usa `X-API-Key`
- `latest`, `history` y `stats` requieren login
- `public/landing` es publico

### 7.3 Alertas

- `GET /api/alerts/current`

Requiere login.

### 7.4 Diagnostico por sensor

- `GET /api/sensors/{metric_key}/detail`

Ejemplos validos:

- `/api/sensors/temperature/detail`
- `/api/sensors/luminosity/detail`
- `/api/sensors/wind_speed/detail`

## 8. Payload real que espera el backend

El backend espera un `POST` a:

```text
/api/sensor-data
```

Header requerido:

```text
X-API-Key: m1k1u-sensor-key
```

### Payload canonico

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

### Aliases aceptados

El backend tambien acepta nombres equivalentes del sketch o de versiones previas:

- `temperatura_C` -> `temperature`
- `presion_hPa` -> `pressure`
- `altitud_m` -> `altitude`
- `luminosidad_lux` -> `luminosity`
- `lluvia_analog` -> `rain_analog`
- `lluvia_digital` -> `rain_digital`
- `velViento_kmh` -> `wind_speed`

### Reglas de tiempo

- si no se envia `timestamp`, el backend lo genera
- si llega un `timestamp` sin zona horaria, se interpreta en `America/Bogota`
- luego se guarda en UTC
- si llega un timestamp numerico, puede venir en segundos o milisegundos epoch

## 9. Arquitectura del frontend

### 9.1 Entrada principal

Archivo principal de rutas:

- `App.tsx`

Rutas publicas:

- `/`
- `/estado-en-vivo`
- `/ubicacion`
- `/tecnologias`
- `/login`
- `/about`

Rutas privadas:

- `/dashboard`
- `/overview`
- `/sensors/:metricKey`
- `/history`
- `/charts`
- `/project-about`

### 9.2 Cliente HTTP

Archivo:

- `http.ts`

Puntos clave:

- usa Axios
- `withCredentials: true`
- consume por defecto `http://127.0.0.1:8000/api`
- si existe `VITE_API_URL`, usa esa variable

### 9.3 Servicios frontend

Servicios principales:

- `authService.ts`
- `sensorDataService.ts`
- `alertsService.ts`

### 9.4 Hooks

Hooks relevantes:

- `useAuth.tsx`
- `useAlerts.ts`
- `usePublicLanding.ts`

### 9.5 Layout privado

Archivo:

- `AppShell.tsx`

Controla:

- sidebar
- navbar
- panel interno
- alertas flotantes

### 9.6 Paginas mas importantes

Publicas:

- `HomePage.tsx`
- `LiveStatusPage.tsx`
- `LocationPage.tsx`
- `TechnologiesPage.tsx`
- `LoginPage.tsx`

Privadas:

- `ConsoleHomePage.tsx`
- `DashboardPage.tsx`
- `HistoryPage.tsx`
- `ChartsPage.tsx`
- `SensorDetailPage.tsx`

## 10. Como levantar el proyecto

Esto se hace desde la raiz del proyecto, es decir, desde la carpeta donde estan:

- `backend/`
- `frontend/`
- `arduino.ino`
- `README.md`

### 10.0 Arranque sin terminal

Si quieres iniciar todo sin escribir comandos manuales, usa:

- `iniciar_m1k1u.bat`
- `detener_m1k1u.bat`

Funcion:

- `iniciar_m1k1u.bat` levanta backend y frontend en segundo plano
- crea `.env` automaticamente si faltan
- guarda PIDs en la carpeta `.runtime`
- abre la aplicacion en el navegador

- `detener_m1k1u.bat` cierra los procesos iniciados por el script

Scripts internos usados por los `.bat`:

- `scripts/start_m1k1u.ps1`
- `scripts/stop_m1k1u.ps1`

### 10.1 Backend

```powershell
cd backend
python -m pip install -r requirements.txt
Copy-Item .env.example .env
python -m uvicorn app.main:app --reload
```

Si `.env` ya existe, no necesitas volver a copiarlo.

Backend:

- `http://127.0.0.1:8000`
- `http://127.0.0.1:8000/docs`

### 10.2 Frontend

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Si `.env` ya existe, no necesitas volver a copiarlo.

Frontend:

- `http://127.0.0.1:5173`

### 10.3 Arranque rapido si ya instalaste dependencias

Terminal 1:

```powershell
cd backend
python -m uvicorn app.main:app --reload
```

Terminal 2:

```powershell
cd frontend
npm run dev
```

### 10.4 Como detenerlo

- si lo iniciaste en la misma terminal, usa `Ctrl + C`
- si lo iniciaste en segundo plano, usa `Stop-Process -Id PID_BACKEND,PID_FRONTEND`

## 11. Variables de entorno

### 11.1 Backend

Archivo de ejemplo:

- `.env.example`

Contenido:

```env
SECRET_KEY=change-this-secret-key
JWT_EXPIRE_MINUTES=720
SENSOR_API_KEY=m1k1u-sensor-key
STATION_ACTIVE_MINUTES=10
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
```

### 11.2 Frontend

Archivo de ejemplo:

- `.env.example`

Contenido:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

## 12. Que pasa cuando arranca el backend

1. FastAPI inicia.
2. `lifespan()` ejecuta migraciones Alembic.
3. Se crea la base si no existe.
4. Se siembra el usuario `admin`.
5. Se habilitan los routers.
6. `/health` queda disponible.

No tienes que crear la base manualmente.

## 13. Login y sesion

Credenciales iniciales:

- usuario: `admin`
- contrasena: `admin123`

Flujo:

1. El frontend hace `POST /api/auth/login`.
2. El backend valida usuario y password.
3. Si es correcto, genera JWT.
4. El JWT se guarda en cookie `HttpOnly`.
5. El frontend consulta `/api/auth/me` para validar la sesion.

## 14. Landing publica vs panel privado

### Landing publica

Sirve para:

- mostrar la ubicacion de la estacion
- mostrar si la estacion esta activa o no
- mostrar la ultima lectura publica
- mostrar parte del estado del proyecto sin login

Endpoint clave:

- `GET /api/sensor-data/public/landing`

### Panel privado

Sirve para:

- dashboard completo
- graficas historicas
- tabla de historial
- alertas
- diagnostico individual por sensor

Necesita login.

## 15. Estados operativos reales

La plataforma maneja estos escenarios:

- `Sin conexión`: no llegan paquetes recientes
- `Sin dato`: llego un paquete, pero ese sensor no vino en el payload
- `Activa`: la estacion envio datos dentro de la ventana operativa

La ventana operativa depende de:

- `STATION_ACTIVE_MINUTES`

Por defecto:

- `10` minutos

## 16. Alertas actuales

El proyecto calcula alertas tecnicas reales sobre el set maestro del ESP32.

Entre ellas:

- estacion sin reporte reciente
- temperatura alta o extrema
- riesgo de congelacion o helada
- descenso brusco de presion
- viento fuerte o extremo
- lluvia detectada por canal digital
- sensor de lluvia analogico en rango saturado
- perdida de paquetes, campo faltante o flatline por sensor

Endpoint:

- `GET /api/alerts/current`

## 17. Diagnostico individual de sensores

Cada sensor puede abrirse por separado desde el panel privado.

La vista individual permite estudiar:

- valor actual
- serie temporal
- faltantes
- fallas parciales
- flatline
- paquetes recientes
- narrativa tecnica del estado del sensor

Endpoint:

- `GET /api/sensors/{metric_key}/detail`

Metricas validas hoy:

- `temperature`
- `pressure`
- `altitude`
- `luminosity`
- `rain_analog`
- `wind_speed`

Nota:

- `rain_digital` se muestra como estado operativo en paneles y alertas, no como grafica numerica individual

## 18. Firmware actual del ESP32

Archivo:

- `arduino.ino`

Puntos clave del sketch actual:

- exige arquitectura `ESP32`
- usa `WiFi.h`
- usa `HTTPClient.h`
- usa `ArduinoJson`
- usa `Adafruit_BMP280`
- usa `BH1750`
- lee BMP280, BH1750, MH-RD y anemometro
- arma un `TelemetryPacket`
- envia solo metricas validas

### Configuracion que debes cambiar en el sketch

```cpp
namespace Config
{
  const char *WIFI_SSID = "WIFI";
  const char *WIFI_PASSWORD = "CLAVE_WIFI";
  const char *API_URL = "http://192.168.1.50:8000/api/sensor-data";
  const char *API_KEY = "m1k1u-sensor-key";
  const char *STATION_ID = "M1K1U-001";
}
```

Debes actualizar:

- `WIFI_SSID`
- `WIFI_PASSWORD`
- `API_URL`
- si deseas, `STATION_ID`

### Muy importante sobre `API_URL`

Desde un ESP32:

- no uses `localhost`
- no uses `127.0.0.1`

Debes usar la IP local del equipo donde corre FastAPI, por ejemplo:

```text
http://192.168.1.50:8000/api/sensor-data
```

## 19. Comandos utiles de desarrollo

### Verificar backend

```powershell
Invoke-WebRequest http://127.0.0.1:8000/health
```

### Abrir Swagger

```text
http://127.0.0.1:8000/docs
```

### Compilar frontend

```powershell
cd frontend
npm run build
```

### Reinstalar dependencias frontend

```powershell
cd frontend
npm install
```

### Reinstalar dependencias backend

```powershell
cd backend
python -m pip install -r requirements.txt
```

## 20. Troubleshooting

### Problema: no deja iniciar sesion

Revisa:

- que frontend y backend usen el mismo host base
- preferiblemente `127.0.0.1` en ambos
- que `VITE_API_URL` apunte a `http://127.0.0.1:8000/api`
- que `CORS_ORIGIN` incluya `http://127.0.0.1:5173`

### Problema: el ESP32 no conecta

Revisa:

- SSID y clave WiFi
- que `API_URL` use la IP local real del backend
- que el backend este accesible desde la red local
- firewall del equipo
- que la `X-API-Key` coincida

### Problema: la página muestra "Sin conexión"

Eso significa:

- que no han llegado datos recientes
- o que la estacion no reporta dentro de la ventana operativa

### Problema: un sensor sale "Sin dato"

Eso significa:

- que el paquete se recibio
- pero esa metrica no vino en el JSON
- o el sensor fallo y el firmware la omitio

### Problema: el frontend abre pero no carga datos

Revisa:

- backend encendido
- `VITE_API_URL`
- consola del navegador
- `http://127.0.0.1:8000/docs`

## 21. Credenciales y URLs de trabajo

### Login inicial

- usuario: `admin`
- contrasena: `admin123`

### URLs locales

- frontend: `http://127.0.0.1:5173`
- backend: `http://127.0.0.1:8000`
- swagger: `http://127.0.0.1:8000/docs`

## 22. Forma simple de explicar el proyecto

1. Es una plataforma IoT meteorologica full stack.
2. El ESP32 envia datos por HTTP al backend.
3. El backend valida y guarda la informacion en SQLite.
4. El frontend consume esos datos y los convierte en dashboard, historial, graficas y alertas.
5. El sistema tiene una capa publica y otra privada.
6. El archivo `arduino.ino` define exactamente los sensores que la plataforma muestra.

## 23. Resumen tecnico ejecutivo

M1K1U ya no es solo una pagina.
Es una base funcional de producto con:

- frontend moderno
- backend robusto
- persistencia local
- autenticacion real
- ingestion REST para sensores
- vistas publicas
- panel privado
- alertas
- diagnostico por sensor
- compatibilidad con ESP32

Con esta guia deberia ser posible:

- entender la arquitectura
- levantar frontend y backend
- probar la API
- conectar un ESP32
- seguir escalando la plataforma
