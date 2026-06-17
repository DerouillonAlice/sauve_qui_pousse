/**
 * Composable de gestion de partie — gère la création, le join,
 * le lobby, le spin, les tours, et le scoring.
 *
 * État singleton partagé entre tous les composants.
 */

import { reactive, computed, readonly, ref } from 'vue'
import { apiFetch, type ApiError } from '@/services/api'

/* ───────── Types ───────── */

export interface GameParticipant {
  id: number
  displayName: string
  turnOrder: number
  roundsWon: number
  isUser: boolean
  isGuest: boolean
}

export interface GameRound {
  id: number
  roundNumber: number
  status: string
  startedAt: string | null
  finishedAt: string | null
  callerId: number | null
  winnerId: number | null
  currentParticipantId: number | null
}

export interface GameSession {
  id: number
  roomCode: string
  joinCode: string
  joinCodeExpiresAt: string | null
  status: string
  createdAt: string
  finishedAt: string | null
  ownerId: number
  currentParticipantId: number | null
  participants: GameParticipant[]
  rounds: GameRound[]
}

export interface SpinResult {
  id: number
  resultType: 'card' | 'skip' | 'extra_spin'
  spunAt: string
  participantId: number
  card: {
    id: number
    type: string
    title: string
    description: string
    effectCode: string
    effectDuration: number | null
  } | null
}

interface GameState {
  session: GameSession | null
  isLoading: boolean
  error: string | null
  lastSpin: SpinResult | null
}

/* ───────── État singleton ───────── */

const state = reactive<GameState>({
  session: null,
  isLoading: false,
  error: null,
  lastSpin: null,
})

let pollingInterval: ReturnType<typeof setInterval> | null = null

/* ───────── Composable ───────── */

export function useGame() {
  const isInGame = computed(() => state.session !== null)
  const isLobby = computed(() => state.session?.status === 'waiting')
  const isActive = computed(() => state.session?.status === 'active')
  const isFinished = computed(() => state.session?.status === 'finished')

  const participants = computed(() => state.session?.participants ?? [])
  const currentRound = computed(() => {
    const rounds = state.session?.rounds ?? []
    return rounds.find(r => r.status === 'active') ?? rounds[rounds.length - 1] ?? null
  })

  const currentParticipant = computed(() => {
    if (!state.session?.currentParticipantId) return null
    return participants.value.find(p => p.id === state.session!.currentParticipantId) ?? null
  })

  /**
   * Créer une nouvelle partie
   */
  async function createGame(): Promise<boolean> {
    state.isLoading = true
    state.error = null
    try {
      const session = await apiFetch<GameSession>('/game/create', { method: 'POST' })
      state.session = session
      startPolling(session.id)
      return true
    } catch (err) {
      const apiErr = err as ApiError
      state.error = apiErr.message
      return false
    } finally {
      state.isLoading = false
    }
  }

  /**
   * Rejoindre une partie avec un code (utilisateur connecté)
   */
  async function joinGame(roomCode: string): Promise<boolean> {
    state.isLoading = true
    state.error = null
    try {
      const session = await apiFetch<GameSession>(`/game/join/${roomCode}`, { method: 'POST' })
      state.session = session
      startPolling(session.id)
      return true
    } catch (err) {
      const apiErr = err as ApiError
      state.error = apiErr.message
      return false
    } finally {
      state.isLoading = false
    }
  }

  /**
   * Ajouter un joueur invité au lobby (mode tablette partagée)
   * Le owner entre les prénoms des participants
   */
  async function addGuestPlayer(joinCode: string, pseudo: string): Promise<boolean> {
    state.isLoading = true
    state.error = null
    try {
      await apiFetch('/guest/join', {
        method: 'POST',
        body: { joinCode, pseudo },
        auth: false,
      })
      // Refresh session to get updated participants
      if (state.session) {
        await refreshSession(state.session.id)
      }
      return true
    } catch (err) {
      const apiErr = err as ApiError
      state.error = apiErr.message
      return false
    } finally {
      state.isLoading = false
    }
  }

  /**
   * Lancer la partie (owner uniquement)
   */
  async function startGame(): Promise<boolean> {
    if (!state.session) return false
    state.isLoading = true
    state.error = null
    try {
      const session = await apiFetch<GameSession>(`/game/start/${state.session.id}`, { method: 'POST' })
      state.session = session
      return true
    } catch (err) {
      const apiErr = err as ApiError
      state.error = apiErr.message
      return false
    } finally {
      state.isLoading = false
    }
  }

  /**
   * Tourner la roue (joueur actif)
   */
  async function spin(participantId: number): Promise<SpinResult | null> {
    state.isLoading = true
    state.error = null
    try {
      const result = await apiFetch<SpinResult>('/game/spin', {
        method: 'POST',
        body: { participantId },
      })
      state.lastSpin = result
      return result
    } catch (err) {
      const apiErr = err as ApiError
      state.error = apiErr.message
      return null
    } finally {
      state.isLoading = false
    }
  }

  /**
   * Finir le tour (passe au joueur suivant)
   */
  async function endTurn(): Promise<boolean> {
    if (!state.session) return false
    state.isLoading = true
    state.error = null
    try {
      const session = await apiFetch<GameSession>(`/game/end-turn/${state.session.id}`, { method: 'POST' })
      state.session = session
      state.lastSpin = null
      return true
    } catch (err) {
      const apiErr = err as ApiError
      state.error = apiErr.message
      return false
    } finally {
      state.isLoading = false
    }
  }

  /**
   * Déclarer le gagnant de la manche
   */
  async function winRound(winnerParticipantId: number): Promise<boolean> {
    if (!state.session) return false
    state.isLoading = true
    state.error = null
    try {
      const session = await apiFetch<GameSession>(`/game/win-round/${state.session.id}`, {
        method: 'POST',
        body: { winnerParticipantId },
      })
      state.session = session
      return true
    } catch (err) {
      const apiErr = err as ApiError
      state.error = apiErr.message
      return false
    } finally {
      state.isLoading = false
    }
  }

  /**
   * Rafraîchir l'état de la session
   */
  async function refreshSession(id: number): Promise<void> {
    try {
      const session = await apiFetch<GameSession>(`/game/status/${id}`)
      state.session = session
    } catch {
      // silently fail on polling
    }
  }

  /**
   * Polling toutes les 3 secondes pour le lobby
   */
  function startPolling(sessionId: number) {
    stopPolling()
    pollingInterval = setInterval(() => refreshSession(sessionId), 3000)
  }

  function stopPolling() {
    if (pollingInterval) {
      clearInterval(pollingInterval)
      pollingInterval = null
    }
  }

  /**
   * Quitter la partie
   */
  function leaveGame() {
    stopPolling()
    state.session = null
    state.lastSpin = null
    state.error = null
  }

  function clearError() {
    state.error = null
  }

  return {
    state: readonly(state),
    isInGame,
    isLobby,
    isActive,
    isFinished,
    participants,
    currentRound,
    currentParticipant,
    createGame,
    joinGame,
    addGuestPlayer,
    startGame,
    spin,
    endTurn,
    winRound,
    leaveGame,
    clearError,
    stopPolling,
  }
}
