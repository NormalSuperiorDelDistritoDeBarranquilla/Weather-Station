#if !defined(ARDUINO_ARCH_ESP32)
#error "Este sketch esta preparado para ESP32 con Arduino IDE."
#endif

#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BMP280.h>
#include <BH1750.h>
#include <ArduinoJson.h>

/*
  M1K1U ESP32 master telemetry sketch

  Sensores maestros alineados con la plataforma web:
  - BMP280: temperatura, presion, altitud
  - BH1750: luminosidad
  - MH-RD: lluvia analogica y lluvia digital
  - Anemometro: velocidad del viento

  Librerias requeridas en Arduino IDE:
  - Adafruit BMP280 Library
  - Adafruit Unified Sensor
  - BH1750
  - ArduinoJson

  Importante:
  - API_URL debe apuntar a la IP LAN del equipo donde corre FastAPI.
  - No uses localhost ni 127.0.0.1 desde el ESP32.
  - El backend ya acepta este contrato como fuente maestra de datos.
*/

namespace Config
{
  const char *WIFI_SSID = "WIFI";
  const char *WIFI_PASSWORD = "CLAVE_WIFI";

  const char *API_URL = "https://weather-station-fjjr.onrender.com/api";
  const char *API_KEY = "m1k1u-sensor-key";
  const char *STATION_ID = "M1K1U-001";

  const uint32_t SERIAL_BAUD_RATE = 115200;
  const uint32_t SENSOR_INTERVAL_MS = 10000;
  const uint32_t WIFI_CONNECT_TIMEOUT_MS = 15000;
  const uint32_t HTTP_TIMEOUT_MS = 8000;

  const float SEA_LEVEL_PRESSURE_HPA = 1013.25f;

  const uint8_t BMP280_ADDRESS_PRIMARY = 0x76;
  const uint8_t BMP280_ADDRESS_SECONDARY = 0x77;
  const uint8_t BH1750_ADDRESS = 0x23;

  const int RAIN_ANALOG_PIN = 34;
  const int RAIN_DIGITAL_PIN = 27;
  const int ANEMOMETER_PIN = 26;

  const uint16_t ADC_MAX_VALUE = 4095;
  const float ADC_REFERENCE_VOLTAGE = 3.3f;

  // Ajusta estos valores segun tu anemometro real.
  const float ANEMOMETER_MIN_VOLTAGE = 0.054f;
  const float ANEMOMETER_MAX_VOLTAGE = 3.3f;
  const float ANEMOMETER_MAX_SPEED_MPS = 32.4f;
  const float MPS_TO_KMH = 3.6f;
}

struct TelemetryPacket
{
  String stationId;

  bool hasTemperature = false;
  float temperature = NAN;

  bool hasPressure = false;
  float pressure = NAN;

  bool hasAltitude = false;
  float altitude = NAN;

  bool hasLuminosity = false;
  float luminosity = NAN;

  bool hasRainAnalog = false;
  float rainAnalog = NAN;

  bool hasRainDigital = false;
  String rainDigital = "";

  bool hasWindSpeed = false;
  float windSpeed = NAN;
};

Adafruit_BMP280 bmp;
BH1750 lightMeter;

bool bmpConnected = false;
bool bh1750Connected = false;
unsigned long previousMillis = 0;

float roundTo2(float value)
{
  return roundf(value * 100.0f) / 100.0f;
}

float mapFloat(float value, float inMin, float inMax, float outMin, float outMax)
{
  if (fabsf(inMax - inMin) < 0.0001f)
  {
    return outMin;
  }

  return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

bool hasAnySensorValue(const TelemetryPacket &packet)
{
  return packet.hasTemperature || packet.hasPressure || packet.hasAltitude || packet.hasLuminosity ||
         packet.hasRainAnalog || packet.hasRainDigital || packet.hasWindSpeed;
}

void initializePacket(TelemetryPacket &packet)
{
  packet = TelemetryPacket();
  packet.stationId = Config::STATION_ID;
}

void printDivider()
{
  Serial.println(F("========================================"));
}

bool connectWiFi()
{
  if (WiFi.status() == WL_CONNECTED)
  {
    return true;
  }

  Serial.println(F("[WiFi] Conectando a la red..."));
  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  WiFi.persistent(false);
  WiFi.begin(Config::WIFI_SSID, Config::WIFI_PASSWORD);

  const unsigned long startAttempt = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startAttempt < Config::WIFI_CONNECT_TIMEOUT_MS)
  {
    delay(500);
    Serial.print('.');
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED)
  {
    Serial.print(F("[WiFi] Conectado. IP local: "));
    Serial.println(WiFi.localIP());
    return true;
  }

  Serial.println(F("[WiFi] No fue posible conectarse dentro del tiempo configurado."));
  return false;
}

bool initializeBmp280()
{
  if (bmp.begin(Config::BMP280_ADDRESS_PRIMARY))
  {
    Serial.println(F("[BMP280] Detectado en direccion 0x76."));
    return true;
  }

  if (bmp.begin(Config::BMP280_ADDRESS_SECONDARY))
  {
    Serial.println(F("[BMP280] Detectado en direccion 0x77."));
    return true;
  }

  Serial.println(F("[BMP280] No detectado. Revisa SDA, SCL y alimentacion."));
  return false;
}

void configureBmp280Sampling()
{
  bmp.setSampling(
      Adafruit_BMP280::MODE_NORMAL,
      Adafruit_BMP280::SAMPLING_X2,
      Adafruit_BMP280::SAMPLING_X16,
      Adafruit_BMP280::FILTER_X16,
      Adafruit_BMP280::STANDBY_MS_500);
}

bool initializeBh1750()
{
  if (lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE, Config::BH1750_ADDRESS))
  {
    Serial.println(F("[BH1750] Detectado correctamente."));
    return true;
  }

  Serial.println(F("[BH1750] No detectado. Revisa conexion I2C."));
  return false;
}

void readBmp280(TelemetryPacket &packet)
{
  if (!bmpConnected)
  {
    return;
  }

  const float temperature = bmp.readTemperature();
  const float pressure = bmp.readPressure() / 100.0f;
  const float altitude = bmp.readAltitude(Config::SEA_LEVEL_PRESSURE_HPA);

  if (isnan(temperature) || isnan(pressure) || isnan(altitude))
  {
    Serial.println(F("[BMP280] Lectura invalida. Se omite este ciclo."));
    return;
  }

  packet.temperature = roundTo2(temperature);
  packet.pressure = roundTo2(pressure);
  packet.altitude = roundTo2(altitude);

  packet.hasTemperature = true;
  packet.hasPressure = true;
  packet.hasAltitude = true;
}

void readBh1750(TelemetryPacket &packet)
{
  if (!bh1750Connected)
  {
    return;
  }

  const float luminosity = lightMeter.readLightLevel();
  if (isnan(luminosity))
  {
    Serial.println(F("[BH1750] Lectura invalida. Se omite este ciclo."));
    return;
  }

  packet.luminosity = roundTo2(luminosity);
  packet.hasLuminosity = true;
}

void readRainSensor(TelemetryPacket &packet)
{
  const int analogRaw = analogRead(Config::RAIN_ANALOG_PIN);
  const int digitalRaw = digitalRead(Config::RAIN_DIGITAL_PIN);

  if (analogRaw > 0)
  {
    packet.rainAnalog = static_cast<float>(analogRaw);
    packet.hasRainAnalog = true;
  }

  packet.rainDigital = (digitalRaw == LOW) ? "Lluvia" : "Seco";
  packet.hasRainDigital = true;
}

void readWindSensor(TelemetryPacket &packet)
{
  const int rawAdc = analogRead(Config::ANEMOMETER_PIN);
  const float voltage = (static_cast<float>(rawAdc) / Config::ADC_MAX_VALUE) * Config::ADC_REFERENCE_VOLTAGE;

  if (isnan(voltage))
  {
    Serial.println(F("[ANEMOMETRO] Voltaje invalido. Se omite este ciclo."));
    return;
  }

  const float limitedVoltage = constrain(voltage, Config::ANEMOMETER_MIN_VOLTAGE, Config::ANEMOMETER_MAX_VOLTAGE);
  const float windSpeedMps = mapFloat(
      limitedVoltage,
      Config::ANEMOMETER_MIN_VOLTAGE,
      Config::ANEMOMETER_MAX_VOLTAGE,
      0.0f,
      Config::ANEMOMETER_MAX_SPEED_MPS);

  packet.windSpeed = roundTo2(windSpeedMps * Config::MPS_TO_KMH);
  packet.hasWindSpeed = true;
}

void logPacket(const TelemetryPacket &packet)
{
  printDivider();
  Serial.print(F("[PACKET] Estacion: "));
  Serial.println(packet.stationId);

  Serial.print(F("  Temperatura: "));
  Serial.println(packet.hasTemperature ? String(packet.temperature) + " C" : "sin dato");

  Serial.print(F("  Presion: "));
  Serial.println(packet.hasPressure ? String(packet.pressure) + " hPa" : "sin dato");

  Serial.print(F("  Altitud: "));
  Serial.println(packet.hasAltitude ? String(packet.altitude) + " m" : "sin dato");

  Serial.print(F("  Luminosidad: "));
  Serial.println(packet.hasLuminosity ? String(packet.luminosity) + " lux" : "sin dato");

  Serial.print(F("  Lluvia analogica: "));
  Serial.println(packet.hasRainAnalog ? String(packet.rainAnalog) + " raw" : "sin dato");

  Serial.print(F("  Lluvia digital: "));
  Serial.println(packet.hasRainDigital ? packet.rainDigital : "sin dato");

  Serial.print(F("  Velocidad del viento: "));
  Serial.println(packet.hasWindSpeed ? String(packet.windSpeed) + " km/h" : "sin dato");
}

String buildPayloadJson(const TelemetryPacket &packet)
{
  StaticJsonDocument<512> doc;
  doc["station_id"] = packet.stationId;

  if (packet.hasTemperature)
    doc["temperature"] = packet.temperature;
  if (packet.hasPressure)
    doc["pressure"] = packet.pressure;
  if (packet.hasAltitude)
    doc["altitude"] = packet.altitude;
  if (packet.hasLuminosity)
    doc["luminosity"] = packet.luminosity;
  if (packet.hasRainAnalog)
    doc["rain_analog"] = packet.rainAnalog;
  if (packet.hasRainDigital)
    doc["rain_digital"] = packet.rainDigital;
  if (packet.hasWindSpeed)
    doc["wind_speed"] = packet.windSpeed;

  String payload;
  serializeJson(doc, payload);
  return payload;
}

bool sendTelemetry(const TelemetryPacket &packet)
{
  if (!hasAnySensorValue(packet))
  {
    Serial.println(F("[HTTP] No hay metricas validas para enviar."));
    return false;
  }

  if (!connectWiFi())
  {
    Serial.println(F("[HTTP] Envio cancelado por falta de conectividad WiFi."));
    return false;
  }

  HTTPClient http;
  http.setTimeout(Config::HTTP_TIMEOUT_MS);
  http.begin(Config::API_URL);
  http.addHeader(F("Content-Type"), F("application/json"));
  http.addHeader(F("X-API-Key"), Config::API_KEY);

  const String payload = buildPayloadJson(packet);
  Serial.println(F("[HTTP] Enviando payload al backend:"));
  Serial.println(payload);

  const int statusCode = http.POST(payload);
  const String responseBody = http.getString();
  http.end();

  Serial.print(F("[HTTP] Codigo de respuesta: "));
  Serial.println(statusCode);
  if (responseBody.length() > 0)
  {
    Serial.println(F("[HTTP] Respuesta del backend:"));
    Serial.println(responseBody);
  }

  return statusCode >= 200 && statusCode < 300;
}

void setup()
{
  Serial.begin(Config::SERIAL_BAUD_RATE);
  delay(1000);
  Serial.println();
  Serial.println(F("M1K1U ESP32 master telemetry iniciado."));

  Wire.begin();
  analogReadResolution(12);
  pinMode(Config::RAIN_DIGITAL_PIN, INPUT);
  pinMode(Config::ANEMOMETER_PIN, INPUT);

  bmpConnected = initializeBmp280();
  if (bmpConnected)
  {
    configureBmp280Sampling();
  }

  bh1750Connected = initializeBh1750();

  connectWiFi();
}

void loop()
{
  const unsigned long currentMillis = millis();
  if (currentMillis - previousMillis < Config::SENSOR_INTERVAL_MS)
  {
    return;
  }

  previousMillis = currentMillis;

  TelemetryPacket packet;
  initializePacket(packet);

  readBmp280(packet);
  readBh1750(packet);
  readRainSensor(packet);
  readWindSensor(packet);

  logPacket(packet);
  const bool sent = sendTelemetry(packet);

  Serial.println(sent ? F("[CICLO] Telemetria enviada correctamente.") : F("[CICLO] Telemetria no enviada."));
  printDivider();
  Serial.println();
}
