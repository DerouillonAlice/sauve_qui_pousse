<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuth } from '@/composables/useAuth'
import { apiFetch } from '@/services/api'
import { Loader2, Trophy, Target, RotateCcw, Gamepad2, LogOut, Calendar, AlertCircle, CheckCircle2 } from 'lucide-vue-next'
import WaveEdge from '@/components/WaveEdge.vue'

const { t } = useI18n()
const { state: auth, isAuthenticated, login, register, logout, clearError } = useAuth()

/* ── Form state ── */
type Mode = 'login' | 'register'
const mode = ref<Mode>('register')
const successMessage = ref('')

const loginEmail = ref('')
const loginPassword = ref('')

const registerFirstname = ref('')
const registerLastname = ref('')
const registerEmail = ref('')
const registerPassword = ref('')
const registerConfirmPassword = ref('')

function switchMode(m: Mode) {
  mode.value = m
  clearError()
  successMessage.value = ''
}

async function handleLogin() {
  clearError()
  successMessage.value = ''
  if (!loginEmail.value || !loginPassword.value) return
  await login(loginEmail.value, loginPassword.value)
}

async function handleRegister() {
  clearError()
  successMessage.value = ''
  if (!registerFirstname.value || !registerLastname.value || !registerEmail.value || !registerPassword.value || !registerConfirmPassword.value) return
  if (registerPassword.value !== registerConfirmPassword.value) {
    ;(auth as { error: string | null }).error = 'auth.error.passwords_mismatch'
    return
  }
  const ok = await register(registerEmail.value, registerPassword.value, registerFirstname.value)
  if (ok) successMessage.value = t('play.register.success')
}

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
}

const profile = ref<ProfileData | null>(null)
const loading = ref(false)
const error   = ref<string | null>(null)

async function loadProfile() {
  loading.value = true
  try {
    profile.value = await apiFetch<ProfileData>('/me')
  } catch {
    error.value = 'Impossible de charger le profil.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (isAuthenticated.value) {
    loadProfile()
  }
})

watch(isAuthenticated, (val) => {
  if (val && !profile.value) {
    loadProfile()
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
  <div class="bg-white min-h-screen pb-20 lg:pb-0">

    <template v-if="isAuthenticated">
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
        <h2 class="text-brown text-2xl sm:text-3xl mb-5">{{ t('profile.stats') }}</h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">

          <div class="bg-white rounded-2xl p-5 text-center shadow-sm">
            <Gamepad2 :stroke-width="1.5" class="w-7 h-7 text-primary mx-auto mb-2" />
            <p class="text-brown font-bold text-2xl">{{ profile.stats.gamesPlayed }}</p>
            <p class="text-brown/50 text-xs mt-1">{{ t('profile.games_played') }}</p>
          </div>

          <div class="bg-white rounded-2xl p-5 text-center shadow-sm">
            <Trophy :stroke-width="1.5" class="w-7 h-7 text-amber-400 mx-auto mb-2" />
            <p class="text-brown font-bold text-2xl">{{ profile.stats.gamesWon }}</p>
            <p class="text-brown/50 text-xs mt-1">{{ t('profile.games_won') }}</p>
          </div>

          <div class="bg-white rounded-2xl p-5 text-center shadow-sm">
            <Target :stroke-width="1.5" class="w-7 h-7 text-sky-400 mx-auto mb-2" />
            <p class="text-brown font-bold text-2xl">{{ profile.stats.roundsWon }}</p>
            <p class="text-brown/50 text-xs mt-1">{{ t('profile.rounds_won') }}</p>
          </div>

          <div class="bg-white rounded-2xl p-5 text-center shadow-sm">
            <RotateCcw :stroke-width="1.5" class="w-7 h-7 text-pink-400 mx-auto mb-2" />
            <p class="text-brown font-bold text-2xl">{{ profile.stats.totalSpins }}</p>
            <p class="text-brown/50 text-xs mt-1">{{ t('profile.spins') }}</p>
          </div>
        </div>

        <!-- Win rate -->
        <div v-if="profile.stats.gamesPlayed > 0" class="mt-4 bg-white rounded-2xl p-5 shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <span class="text-brown/60 text-sm">{{ t('profile.win_rate') }}</span>
            <span class="text-brown font-bold text-sm">{{ winRate }}%</span>
          </div>
          <div class="w-full h-2.5 bg-brown/10 rounded-full overflow-hidden">
            <div class="h-full bg-primary rounded-full transition-all duration-700"
              :style="{ width: winRate + '%' }" />
          </div>
        </div>
      </section>

      <!-- Historique -->
      <section class="max-w-3xl mx-auto px-4 sm:px-6 pb-10">
        <h2 class="text-brown text-2xl sm:text-3xl mb-5">{{ t('profile.history') }}</h2>

        <div v-if="profile.history.length === 0"
          class="bg-white rounded-2xl p-10 text-center text-brown/40 shadow-sm">
          {{ t('profile.no_history') }}
        </div>

        <div v-else class="flex flex-col gap-3">
          <div v-for="game in profile.history" :key="game.sessionId"
            class="bg-white rounded-2xl px-4 py-4 shadow-sm">

            <!-- Ligne 1 : titre + statut -->
            <div class="flex items-center justify-between gap-2 mb-2">
              <div class="flex items-center gap-2 min-w-0">
                <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Gamepad2 :stroke-width="1.5" class="w-4 h-4 text-primary" />
                </div>
                <span class="text-brown font-bold text-sm">#{{ game.sessionId }}</span>
                <span v-if="game.isHost"
                  class="text-xs bg-primary/15 text-primary px-2 py-0.5 rounded-full font-medium shrink-0">
                  {{ t('profile.host') }}
                </span>
              </div>
              <span class="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
                :class="statusClass(game.status)">
                {{ statusLabel(game.status) }}
              </span>
            </div>

            <!-- Ligne 2 : date + manches -->
            <div class="flex items-center gap-3 text-xs text-brown/50 mb-2 pl-10">
              <span class="flex items-center gap-1">
                <Calendar :stroke-width="1.5" class="w-3.5 h-3.5" />
                {{ formatDate(game.createdAt) }}
              </span>
              <span>· {{ game.roundsWon }} manche{{ game.roundsWon > 1 ? 's' : '' }}</span>
              <span class="text-brown/30 font-mono">{{ game.roomCode }}</span>
            </div>

            <!-- Ligne 3 : joueurs -->
            <div class="flex flex-wrap gap-1 pl-10">
              <span v-for="player in game.players" :key="player"
                class="text-xs bg-cream text-brown/60 px-2 py-0.5 rounded-full">
                {{ player }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- Déconnexion -->
      <section class="max-w-3xl mx-auto px-6 pb-10">
        <button @click="logout"
          class="flex items-center gap-2 text-sm text-brown/40 hover:text-red transition-colors cursor-pointer">
          <LogOut :stroke-width="1.5" class="w-4 h-4" />
          {{ t('nav.logout') }}
        </button>
      </section>

    </template>
    </template>

    <template v-else>
      <!-- HERO (shown when not logged in) -->
      <section class="py-16 px-6 text-center bg-cream-dark">
        <div class="max-w-xl mx-auto">
          <h1 class="text-brown mb-3">{{ t('play.hero.title') }}</h1>
          <p class="text-brown/70 text-lg">{{ t('play.hero.subtitle') }}</p>
        </div>
      </section>

      <!-- Vagues crème -->
      <WaveEdge color="var(--color-cream-dark)" :size="48" />

      <div class="max-w-xl mx-auto px-6 py-16">
        <div class="bg-brown rounded-3xl p-8">

          <!-- Error -->
          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2"
          >
            <div v-if="auth.error" class="flex items-start gap-3 bg-red/20 text-cream rounded-xl px-4 py-3 mb-4 text-sm">
              <AlertCircle :stroke-width="1.5" class="w-5 h-5 mt-0.5 shrink-0" />
              <span>{{ t(auth.error) }}</span>
            </div>
          </Transition>

          <!-- Success -->
          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2"
          >
            <div v-if="successMessage" class="flex items-start gap-3 bg-primary/30 text-cream rounded-xl px-4 py-3 mb-4 text-sm">
              <CheckCircle2 :stroke-width="1.5" class="w-5 h-5 mt-0.5 shrink-0" />
              <span>{{ successMessage }}</span>
            </div>
          </Transition>

          <!-- REGISTER -->
          <form v-if="mode === 'register'" class="space-y-4" @submit.prevent="handleRegister">
            <h2 class="text-cream font-game text-3xl mb-6">{{ t('play.register.title') }}</h2>

            <div class="flex flex-col gap-1">
              <label for="register-firstname" class="text-cream font-semibold text-sm">{{ t('play.register.firstname') }}</label>
              <input id="register-firstname" v-model="registerFirstname" type="text" required autocomplete="given-name"
                class="w-full px-4 py-3 rounded-xl border-2 border-primary bg-cream text-brown placeholder:text-brown/40 focus:outline-none focus:ring-[3px] focus:ring-primary/25 transition-all" />
            </div>

            <div class="flex flex-col gap-1">
              <label for="register-lastname" class="text-cream font-semibold text-sm">{{ t('play.register.lastname') }}</label>
              <input id="register-lastname" v-model="registerLastname" type="text" required autocomplete="family-name"
                class="w-full px-4 py-3 rounded-xl border-2 border-primary bg-cream text-brown placeholder:text-brown/40 focus:outline-none focus:ring-[3px] focus:ring-primary/25 transition-all" />
            </div>

            <div class="flex flex-col gap-1">
              <label for="register-email" class="text-cream font-semibold text-sm">{{ t('play.register.email') }}</label>
              <input id="register-email" v-model="registerEmail" type="email" required autocomplete="email"
                class="w-full px-4 py-3 rounded-xl border-2 border-primary bg-cream text-brown placeholder:text-brown/40 focus:outline-none focus:ring-[3px] focus:ring-primary/25 transition-all" />
            </div>

            <div class="flex flex-col gap-1">
              <label for="register-password" class="text-cream font-semibold text-sm">{{ t('play.register.password') }}</label>
              <input id="register-password" v-model="registerPassword" type="password" required autocomplete="new-password"
                minlength="8" class="w-full px-4 py-3 rounded-xl border-2 border-primary bg-cream text-brown placeholder:text-brown/40 focus:outline-none focus:ring-[3px] focus:ring-primary/25 transition-all" />
              <span class="text-cream/50 text-xs mt-1">{{ t('play.register.password_hint') }}</span>
            </div>

            <div class="flex flex-col gap-1">
              <label for="register-confirm-password" class="text-cream font-semibold text-sm">{{ t('play.register.confirm_password') }}</label>
              <input id="register-confirm-password" v-model="registerConfirmPassword" type="password" required
                autocomplete="new-password"
                class="w-full px-4 py-3 rounded-xl border-2 border-primary bg-cream text-brown placeholder:text-brown/40 focus:outline-none focus:ring-[3px] focus:ring-primary/25 transition-all" />
            </div>

            <div class="pt-2">
              <button id="register-submit" type="submit" :disabled="auth.isLoading"
                class="mx-auto flex items-center justify-center gap-2 px-10 py-3 bg-primary text-cream rounded-full font-bold cursor-pointer hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed transition-transform">
                <Loader2 v-if="auth.isLoading" :stroke-width="2" class="w-5 h-5 animate-spin" />
                {{ t('play.register.submit') }}
              </button>
            </div>

            <p class="text-xs text-cream/50 text-center leading-relaxed">{{ t('play.register.legal') }}</p>

            <p class="text-center text-sm text-cream/70 pt-2">
              {{ t('play.register.switch_login') }}
              <button type="button" @click="switchMode('login')" class="text-primary font-semibold hover:underline cursor-pointer">
                {{ t('play.register.switch_login_link') }}
              </button>
            </p>
          </form>

          <!-- LOGIN -->
          <form v-else class="space-y-4" @submit.prevent="handleLogin">
            <h2 class="text-cream font-game text-3xl mb-6">{{ t('play.login.title') }}</h2>

            <div class="flex flex-col gap-1">
              <label for="login-email" class="text-cream font-semibold text-sm">{{ t('play.login.email') }}</label>
              <input id="login-email" v-model="loginEmail" type="email" required autocomplete="email"
                class="w-full px-4 py-3 rounded-xl border-2 border-primary bg-cream text-brown placeholder:text-brown/40 focus:outline-none focus:ring-[3px] focus:ring-primary/25 transition-all" />
            </div>

            <div class="flex flex-col gap-1">
              <label for="login-password" class="text-cream font-semibold text-sm">{{ t('play.login.password') }}</label>
              <input id="login-password" v-model="loginPassword" type="password" required autocomplete="current-password"
                class="w-full px-4 py-3 rounded-xl border-2 border-primary bg-cream text-brown placeholder:text-brown/40 focus:outline-none focus:ring-[3px] focus:ring-primary/25 transition-all" />
            </div>

            <div class="pt-2">
              <button id="login-submit" type="submit" :disabled="auth.isLoading"
                class="mx-auto flex items-center justify-center gap-2 px-10 py-3 bg-primary text-cream rounded-full font-bold cursor-pointer hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed transition-transform">
                <Loader2 v-if="auth.isLoading" :stroke-width="2" class="w-5 h-5 animate-spin" />
                {{ t('play.login.submit') }}
              </button>
            </div>

            <p class="text-center text-sm text-cream/70 pt-2">
              {{ t('play.login.switch_register') }}
              <button type="button" @click="switchMode('register')" class="text-primary font-semibold hover:underline cursor-pointer">
                {{ t('play.login.switch_register_link') }}
              </button>
            </p>
          </form>
        </div>
      </div>
    </template>
  </div>
</template>
