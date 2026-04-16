import { http } from './http'
import type { AlertsResponse } from '../types/api'

export const alertsService = {
  async getCurrent(stationId?: string) {
    const { data } = await http.get<AlertsResponse>('/alerts/current', {
      params: stationId ? { station_id: stationId } : undefined,
    })
    return data
  },
}
