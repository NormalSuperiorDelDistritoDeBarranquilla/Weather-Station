import { useQuery } from '@tanstack/react-query'

import { sensorDataService } from '../services/sensorDataService'

export function usePublicLanding() {
  return useQuery({
    queryKey: ['public-landing'],
    queryFn: () => sensorDataService.getPublicLanding(),
    refetchInterval: 15_000,
  })
}
