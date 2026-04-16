import { http } from './http'
import type {
  HistoryQuery,
  LatestSensorDataResponse,
  MetricKey,
  PublicLandingResponse,
  SensorDataHistoryResponse,
  SensorDetailResponse,
  SensorStatsResponse,
} from '../types/api'

export const sensorDataService = {
  async getLatest(stationId?: string) {
    const { data } = await http.get<LatestSensorDataResponse>('/sensor-data/latest', {
      params: stationId ? { station_id: stationId } : undefined,
    })
    return data
  },

  async getPublicLanding() {
    const { data } = await http.get<PublicLandingResponse>('/sensor-data/public/landing')
    return data
  },

  async getStats(params: Omit<HistoryQuery, 'page' | 'pageSize'>) {
    const { data } = await http.get<SensorStatsResponse>('/sensor-data/stats', {
      params: {
        range: params.range,
        station_id: params.stationId,
        start_date: params.startDate,
        end_date: params.endDate,
        search: params.search,
      },
    })
    return data
  },

  async getHistory(params: HistoryQuery) {
    const { data } = await http.get<SensorDataHistoryResponse>('/sensor-data/history', {
      params: {
        range: params.range,
        page: params.page ?? 1,
        page_size: params.pageSize ?? 20,
        station_id: params.stationId,
        start_date: params.startDate,
        end_date: params.endDate,
        search: params.search,
      },
    })
    return data
  },

  async getSensorDetail(metricKey: MetricKey, params?: { range?: HistoryQuery['range']; stationId?: string }) {
    const { data } = await http.get<SensorDetailResponse>(`/sensors/${metricKey}/detail`, {
      params: {
        range: params?.range ?? '24h',
        station_id: params?.stationId,
      },
    })
    return data
  },
}
