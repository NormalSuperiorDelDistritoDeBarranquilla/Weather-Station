import { useQuery } from '@tanstack/react-query'

import { alertsService } from '../services/alertsService'

export function useAlerts(stationId?: string) {
  return useQuery({
    queryKey: ['alerts-current', stationId ?? 'all'],
    queryFn: () => alertsService.getCurrent(stationId),
    refetchInterval: 15_000,
  })
}
