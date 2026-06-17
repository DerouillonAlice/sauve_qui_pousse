/**
 * Composable d'authentification — gère le login, register, logout,
 * la persistance du token JWT et l'état utilisateur réactif.
 *
 * L'état est un singleton partagé entre tous les composants.
 */

import { reactive, computed, readonly } from 'vue'
import { apiFetch, setOnUnauthorized, type ApiError } from '@/services/api'

/* ───────── Types ───────── */

export interface AuthUser {
  id: number
  email: string
  pseudo: string
}

interface AuthState {
  token: string | null
  user: AuthUser | null
  isLoading: boolean
  error: string | null
}

/* ───────── État singleton ───────── */

function isTokenExpired(token: string): boolean {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(base64)) as { exp?: number }
    return !payload.exp || Date.now() / 1000 > payload.exp
  } catch {
    return true
  }
}

const storedToken = localStorage.getItem('sqp_token')
const tokenValid = storedToken && !isTokenExpired(storedToken)
if (!tokenValid) {
  localStorage.removeItem('sqp_token')
  localStorage.removeItem('sqp_user')
}

const state = reactive<AuthState>({
  token: tokenValid ? storedToken : null,
  user: tokenValid
    ? (() => {
        try { return JSON.parse(localStorage.getItem('sqp_user') || 'null') }
        catch { return null }
      })()
    : null,
  isLoading: false,
  error: null,
})

/* Quand le backend renvoie 401 (token expiré en cours de session) */
setOnUnauthorized(() => clear())

/* ───────── Helpers ───────── */

function persist(token: string, user: AuthUser) {
  state.token = token
  state.user = user
  localStorage.setItem('sqp_token', token)
  localStorage.setItem('sqp_user', JSON.stringify(user))
}

function clear() {
  state.token = null
  state.user = null
  state.error = null
  localStorage.removeItem('sqp_token')
  localStorage.removeItem('sqp_user')
}

/**
 * Décode un JWT (partie payload) sans vérification de signature.
 * Suffisant côté client pour en extraire des infos non sensibles.
 */
function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return {}
  }
}

/* ───────── Composable ───────── */

export function useAuth() {
  const isAuthenticated = computed(() => !!state.token && !!state.user)

  /**
   * Connexion — POST /api/login
   * Retourne { token } ; on décode le JWT pour obtenir l'email.
   */
  async function login(email: string, password: string): Promise<boolean> {
    state.isLoading = true
    state.error = null

    try {
      const data = await apiFetch<{ token: string }>('/login', {
        method: 'POST',
        body: { email, password },
        auth: false,
      })

      // Le JWT contient l'email dans le payload (standard Lexik)
      const payload = decodeJwtPayload(data.token)
      const user: AuthUser = {
        id: (payload.userId as number) ?? 0,
        email: (payload.username as string) ?? email,
        pseudo: (payload.pseudo as string) ?? email.split('@')[0],
      }

      persist(data.token, user)
      return true
    } catch (err) {
      const apiErr = err as ApiError
      if (apiErr.status === 401) {
        state.error = 'auth.error.invalid_credentials'
      } else {
        state.error = 'auth.error.server'
      }
      return false
    } finally {
      state.isLoading = false
    }
  }

  /**
   * Inscription — POST /api/register
   * Après l'inscription, connecte automatiquement l'utilisateur.
   */
  async function register(
    email: string,
    password: string,
    pseudo: string,
  ): Promise<boolean> {
    state.isLoading = true
    state.error = null

    try {
      await apiFetch<{ id: number; email: string; pseudo: string }>(
        '/register',
        {
          method: 'POST',
          body: { email, password, pseudo },
          auth: false,
        },
      )

      // Auto-login après inscription
      return await login(email, password)
    } catch (err) {
      const apiErr = err as ApiError
      console.error('[useAuth] register failed:', apiErr.status, apiErr.message)
      if (apiErr.status === 409) {
        state.error = 'auth.error.already_exists'
      } else if (apiErr.status === 400) {
        state.error = 'auth.error.missing_fields'
      } else if (apiErr.status === 401) {
        // Le backend protège /api/register derrière le firewall JWT
        // → il faut ajouter /api/register dans les routes publiques de security.yaml
        state.error = 'auth.error.server'
        console.warn('[useAuth] 401 on /api/register — backend security.yaml needs to allow public access to this route')
      } else {
        state.error = 'auth.error.server'
      }
      return false
    } finally {
      state.isLoading = false
    }
  }

  function logout() {
    clear()
  }

  function clearError() {
    state.error = null
  }

  return {
    state: readonly(state),
    isAuthenticated,
    login,
    register,
    logout,
    clearError,
  }
}
