import { http } from './http'
import type { AuthResponse, LoginPayload, MeResponse } from '../types/api'

export const authService = {
  async login(payload: LoginPayload) {
    const { data } = await http.post<AuthResponse>('/auth/login', payload)
    return data
  },
  async logout() {
    const { data } = await http.post<{ message: string }>('/auth/logout')
    return data
  },
  async me() {
    const { data } = await http.get<MeResponse>('/auth/me')
    return data
  },
}
