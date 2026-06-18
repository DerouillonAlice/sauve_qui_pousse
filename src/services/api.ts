/**
 * Service API — wrapper fetch pour le backend Sauve qui Pousse.
 *
 * En dev  : le proxy Vite redirige `/api` → http://127.0.0.1:8081/api
 * En prod : appel direct vers https://api.sauvequipousse.fr/api
 */

const API_BASE = import.meta.env.PROD
  ? 'https://api.sauvequipousse.fr/api'
  : '/api'

function getToken(): string | null {
  return localStorage.getItem('sqp_token')
}

interface ApiOptions {
  method?: string
  body?: unknown
  auth?: boolean
}

export interface ApiError {
  status: number
  message: string
}

let _onUnauthorized: (() => void) | null = null
export function setOnUnauthorized(cb: () => void) {
  _onUnauthorized = cb
}

export async function apiFetch<T = unknown>(
  endpoint: string,
  { method = 'GET', body, auth = true }: ApiOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }

  if (auth) {
    const token = getToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    if (res.status === 401 && auth) _onUnauthorized?.()
    const error: ApiError = {
      status: res.status,
      message: data?.error ?? data?.message ?? `Erreur ${res.status}`,
    }
    throw error
  }

  return data as T
}
