<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useGame } from '@/composables/useGame'
import { apiFetch } from '@/services/api'
import { Loader2, Trophy, Target, RotateCcw, Gamepad2, LogOut, Calendar } from 'lucide-vue-next'

const router = useRouter()
const { state: auth, isAuthenticated, logout } = useAuth()
const { leaveGame } = useGame()

interface ProfileData {
  id: number
  email: string
  pseudo: string
  stats: {
    gamesPlayed: number
    gamesWon: number
    roundsWon: number
    totalSpins: number
  }
  history: {
    sessionId: number
    roomCode: string
    status: string
    createdAt: string | null
    finishedAt: string | null
    roundsWon: number
    playerCount: number
    players: string[]
    isHost: boolean
  }[]
  teammates: {
    name: string
    gamesCount: number
    lastPlayed: string | null
  }[]
}

const profile = ref<ProfileData | null>(null)
const loading = ref(true)
const error   = ref<string | null>(null)

// Rediriger si déconnecté (pendant la visite ou au chargement)
watch(isAuthenticated, (val) => { if (!val) router.push('/') }, { immediate: true })

function handleLogout() {
  leaveGame()
  logout()
  router.push('/')
}

const visibleTeammates = computed(() => profile.value?.teammates ?? [])

onMounted(async () => {
  if (!isAuthenticated.value) return
  try {
    profile.value = await apiFetch<ProfileData>('/me')
  } catch {
    error.value = 'Impossible de charger le profil.'
  } finally {
    loading.value = false
  }
})

const winRate = computed(() => {
  const p = profile.value?.stats
  if (!p || p.gamesPlayed === 0) return 0
  return Math.round((p.gamesWon / p.gamesPlayed) * 100)
})

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function statusLabel(status: string): string {
  return status === 'finished' ? 'Terminée' : status === 'active' ? 'En cours' : 'Lobby'
}
function statusClass(status: string): string {
  return status === 'finished' ? 'bg-primary/15 text-primary' : status === 'active' ? 'bg-amber-100 text-amber-700' : 'bg-brown/10 text-brown'
}

const avatarLetter = computed(() => (auth.user?.pseudo ?? 'U').charAt(0).toUpperCase())
</script>

<template>
  <div class="bg-cream min-h-screen pb-20 lg:pb-0">

    <!-- Hero -->
    <section class="bg-brown py-10 px-6 text-center">
      <div class="max-w-xl mx-auto">
        <div class="w-20 h-20 rounded-full bg-primary mx-auto flex items-center justify-center text-white text-3xl font-bold font-game mb-4 shadow-lg">
          {{ avatarLetter }}
        </div>
        <h1 class="text-cream font-game text-4xl mb-1">{{ auth.user?.pseudo }}</h1>
        <p class="text-cream/50 text-sm">{{ auth.user?.email }}</p>
      </div>
    </section>

    <!-- Loader -->
    <div v-if="loading" class="flex justify-center py-20">
      <Loader2 :stroke-width="1.5" class="w-10 h-10 text-primary animate-spin" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="max-w-lg mx-auto px-6 py-12 text-center text-red">
      {{ error }}
    </div>

    <template v-else-if="profile">

      <!-- Stats -->
      <section class="max-w-3xl mx-auto px-6 py-10">
        <h2 class="text-brown mb-6">Statistiques</h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">

          <div class="bg-white rounded-2xl p-5 text-center shadow-sm">
            <Gamepad2 :stroke-width="1.5" class="w-7 h-7 text-primary mx-auto mb-2" />
            <p class="text-brown font-bold text-2xl">{{ profile.stats.gamesPlayed }}</p>
            <p class="text-brown/50 text-xs mt-1">Parties jouées</p>
          </div>

          <div class="bg-white rounded-2xl p-5 text-center shadow-sm">
            <Trophy :stroke-width="1.5" class="w-7 h-7 text-amber-400 mx-auto mb-2" />
            <p class="text-brown font-bold text-2xl">{{ profile.stats.gamesWon }}</p>
            <p class="text-brown/50 text-xs mt-1">Parties gagnées</p>
          </div>

          <div class="bg-white rounded-2xl p-5 text-center shadow-sm">
            <Target :stroke-width="1.5" class="w-7 h-7 text-sky-400 mx-auto mb-2" />
            <p class="text-brown font-bold text-2xl">{{ profile.stats.roundsWon }}</p>
            <p class="text-brown/50 text-xs mt-1">Manches gagnées</p>
          </div>

          <div class="bg-white rounded-2xl p-5 text-center shadow-sm">
            <RotateCcw :stroke-width="1.5" class="w-7 h-7 text-pink-400 mx-auto mb-2" />
            <p class="text-brown font-bold text-2xl">{{ profile.stats.totalSpins }}</p>
            <p class="text-brown/50 text-xs mt-1">Tours de roue</p>
          </div>
        </div>

        <!-- Win rate -->
        <div v-if="profile.stats.gamesPlayed > 0" class="mt-4 bg-white rounded-2xl p-5 shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <span class="text-brown/60 text-sm">Taux de victoire</span>
            <span class="text-brown font-bold text-sm">{{ winRate }}%</span>
          </div>
          <div class="w-full h-2.5 bg-brown/10 rounded-full overflow-hidden">
            <div class="h-full bg-primary rounded-full transition-all duration-700"
              :style="{ width: winRate + '%' }" />
          </div>
        </div>
      </section>

      <!-- Coéquipiers — AU-DESSUS de l'historique -->
      <section class="max-w-3xl mx-auto px-6 pb-10">
        <h2 class="text-brown mb-6">Coéquipiers</h2>

        <div v-if="visibleTeammates.length === 0"
          class="bg-white rounded-2xl p-10 text-center text-brown/40 shadow-sm">
          Aucun coéquipier pour l'instant. Ajoute des invités dans tes prochaines parties !
        </div>

        <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <div v-for="teammate in visibleTeammates" :key="teammate.name"
            class="bg-white rounded-2xl p-4 text-center shadow-sm flex flex-col items-center gap-2">
            <!-- Avatar lettre -->
            <div class="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white text-lg font-bold font-game">
              {{ teammate.name.charAt(0).toUpperCase() }}
            </div>
            <p class="text-brown font-semibold text-sm truncate w-full text-center">{{ teammate.name }}</p>
            <p class="text-brown/40 text-xs">
              {{ teammate.gamesCount }} partie{{ teammate.gamesCount > 1 ? 's' : '' }}
            </p>
          </div>
        </div>
      </section>

      <!-- Historique -->
      <section class="max-w-3xl mx-auto px-6 pb-10">
        <h2 class="text-brown mb-6">Historique des parties</h2>

        <div v-if="profile.history.length === 0"
          class="bg-white rounded-2xl p-10 text-center text-brown/40 shadow-sm">
          Aucune partie jouée pour l'instant.
        </div>

        <div v-else class="flex flex-col gap-3">
          <div v-for="game in profile.history" :key="game.sessionId"
            class="bg-white rounded-2xl px-5 py-4 shadow-sm flex items-center gap-4">
            <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Gamepad2 :stroke-width="1.5" class="w-5 h-5 text-primary" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-brown font-semibold text-sm">Partie #{{ game.sessionId }}</span>
                <span v-if="game.isHost" class="text-xs bg-primary/15 text-primary px-2 py-0.5 rounded-full font-medium">Hôte</span>
                <span class="text-brown/40 font-mono text-xs">{{ game.roomCode }}</span>
              </div>
              <div class="flex items-center gap-3 text-xs text-brown/50 mb-1">
                <span class="flex items-center gap-1">
                  <Calendar :stroke-width="1.5" class="w-3.5 h-3.5" />
                  {{ formatDate(game.createdAt) }}
                </span>
                <span>{{ game.roundsWon }} manche{{ game.roundsWon > 1 ? 's' : '' }} gagnée{{ game.roundsWon > 1 ? 's' : '' }}</span>
              </div>
              <div class="flex flex-wrap gap-1">
                <span v-for="player in game.players" :key="player"
                  class="text-xs bg-brown/8 text-brown/60 px-2 py-0.5 rounded-full">
                  {{ player }}
                </span>
              </div>
            </div>
            <span class="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 self-start mt-1"
              :class="statusClass(game.status)">
              {{ statusLabel(game.status) }}
            </span>
          </div>
        </div>
      </section>

      <!-- Déconnexion -->
      <section class="max-w-3xl mx-auto px-6 pb-10">
        <button @click="handleLogout"
          class="flex items-center gap-2 text-sm text-brown/40 hover:text-red transition-colors cursor-pointer">
          <LogOut :stroke-width="1.5" class="w-4 h-4" />
          Se déconnecter
        </button>
      </section>

    </template>
  </div>
</template>
