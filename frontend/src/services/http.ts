import axios from 'axios'

const defaultApiUrl = `${window.location.protocol}//${window.location.hostname}:8000/api`
const baseURL = import.meta.env.VITE_API_URL || defaultApiUrl

export const http = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})
