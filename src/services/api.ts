/**
 * Service API — wrapper fetch pour le backend Sauve qui Pousse.
 *
 * Toutes les requêtes passent par le proxy Vite `/api` → http://127.0.0.1:8081/api
 * afin d'éviter les problèmes CORS en développement.
 */

const API_BASE = '/api'

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
    const error: ApiError = {
      status: res.status,
      message: data?.error ?? data?.message ?? `Erreur ${res.status}`,
    }
    throw error
  }

  return data as T
}
