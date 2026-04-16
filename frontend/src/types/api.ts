export type MetricKey = 'temperature' | 'pressure' | 'altitude' | 'luminosity' | 'rain_analog' | 'wind_speed'
export type HistoryRange = '24h' | '7d' | '30d' | 'all'
export type AlertSeverity = 'advisory' | 'warning' | 'critical'
export type SensorConnectionState = 'online' | 'offline' | 'awaiting_data'
export type SensorIssueSeverity = 'info' | 'warning' | 'critical'

export interface User {
  id: number
  username: string
  role: string
  created_at: string
}

export interface AuthResponse {
  message: string
  user: User
}

export interface MeResponse {
  user: User
}

export interface LoginPayload {
  username: string
  password: string
}

export interface SensorDataRecord {
  id: number
  station_id: string
  temperature: number | null
  pressure: number | null
  altitude: number | null
  luminosity: number | null
  rain_analog: number | null
  rain_digital: string | null
  wind_speed: number | null
  timestamp: string
  created_at: string
}

export interface MetricState {
  key: MetricKey
  label: string
  unit: string
  value: number | null
  status: string
  status_label: string
  description: string
}

export interface LatestSensorDataResponse {
  station_id: string | null
  latest: SensorDataRecord | null
  active: boolean
  active_label: string
  last_seen: string | null
  metric_states: Record<MetricKey, MetricState>
}

export interface MetricStats {
  key: MetricKey
  label: string
  unit: string
  current: number | null
  min: number | null
  max: number | null
  avg: number | null
  status: string
  status_label: string
  delta_from_average: number | null
}

export interface SensorStatsResponse {
  range: HistoryRange
  station_id: string | null
  total_records: number
  generated_at: string
  active: boolean
  active_label: string
  last_seen: string | null
  latest: SensorDataRecord | null
  metrics: Record<MetricKey, MetricStats>
}

export interface PublicStationLocation {
  label: string
  neighborhood: string
  city: string
  region: string
  country: string
}

export interface PublicLandingResponse {
  generated_at: string
  location: PublicStationLocation
  latest: LatestSensorDataResponse
  stats_24h: SensorStatsResponse
}

export interface SensorDataHistoryResponse {
  items: SensorDataRecord[]
  total: number
  page: number
  page_size: number
  total_pages: number
  range: HistoryRange
  station_id: string | null
  search: string | null
  start_date: string | null
  end_date: string | null
}

export interface HistoryQuery {
  range: HistoryRange
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
  stationId?: string
  search?: string
}

export interface SensorAlert {
  code: string
  sensor: string
  severity: AlertSeverity
  title: string
  message: string
  recommendation: string
  current_value: number | null
  unit: string | null
  threshold: string
  source: string
  source_url: string
  triggered_at: string
}

export interface AlertsResponse {
  station_id: string | null
  generated_at: string
  active: boolean
  active_label: string
  total_alerts: number
  highest_severity: AlertSeverity | null
  alerts: SensorAlert[]
}

export interface SensorIssue {
  code: string
  severity: SensorIssueSeverity
  title: string
  message: string
  detected_at: string | null
}

export interface SensorDetailPoint {
  timestamp: string
  value: number | null
  missing: boolean
  status: string
  status_label: string
}

export interface SensorPacketSnapshot {
  timestamp: string
  value: number | null
  has_value: boolean
  age_minutes: number
}

export interface SensorDetailResponse {
  metric_key: MetricKey
  label: string
  unit: string
  description: string
  range: HistoryRange
  station_id: string | null
  station_active: boolean
  station_active_label: string
  connection_state: SensorConnectionState
  connection_label: string
  latest_value: number | null
  latest_status: string
  latest_status_label: string
  current_packet_has_value: boolean
  last_packet_at: string | null
  last_valid_at: string | null
  samples_in_range: number
  valid_samples: number
  missing_samples: number
  completeness_ratio: number
  min_value: number | null
  max_value: number | null
  avg_value: number | null
  flatline_detected: boolean
  flatline_length: number
  narrative: string
  issues: SensorIssue[]
  series: SensorDetailPoint[]
  recent_packets: SensorPacketSnapshot[]
}
