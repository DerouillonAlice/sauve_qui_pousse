<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuth } from '@/composables/useAuth'
import { useGame } from '@/composables/useGame'
import GameLobby from '@/components/GameLobby.vue'
import GameActive from '@/components/GameActive.vue'
import { LogOut, Gamepad2, Users, Loader2, AlertCircle, CheckCircle2 } from 'lucide-vue-next'

const { t, tm } = useI18n()
const { state: auth, isAuthenticated, login, register, logout, clearError } = useAuth()
const { state: game, isInGame, isActive, createGame, joinGame, leaveGame, stopPolling } = useGame()

const featureItems = computed(() => tm('play.features.items') as string[])

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

const showJoinModal = ref(false)
const joinCode = ref('')
const isJoining = ref(false)
const isCreating = ref(false)

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

function handleLogout() {
  leaveGame()
  logout()
  loginEmail.value = ''
  loginPassword.value = ''
  registerFirstname.value = ''
  registerLastname.value = ''
  registerEmail.value = ''
  registerPassword.value = ''
  registerConfirmPassword.value = ''
  successMessage.value = ''
  mode.value = 'register'
}

async function handleCreateGame() {
  isCreating.value = true
  await createGame()
  isCreating.value = false
}

async function handleJoinGame() {
  if (!joinCode.value.trim()) return
  isJoining.value = true
  const ok = await joinGame(joinCode.value.trim().toUpperCase())
  if (ok) { showJoinModal.value = false; joinCode.value = '' }
  isJoining.value = false
}

function handleLeaveGame() { leaveGame() }

onUnmounted(() => stopPolling())
</script>

<template>
  <!-- Full-screen game view — bypasses hero+grid entirely -->
  <GameActive v-if="isAuthenticated && isInGame && isActive" />

  <div v-else class="bg-cream min-h-screen">

    <!-- HERO -->
    <section class="py-16 px-6 text-center bg-cream-dark">
      <div class="max-w-xl mx-auto">
        <h1 class="text-brown mb-3">{{ t('play.hero.title') }}</h1>
        <p class="text-brown/70 text-lg">{{ t('play.hero.subtitle') }}</p>
      </div>
    </section>

    <div class="max-w-4xl mx-auto px-6 py-16 grid gap-12 lg:grid-cols-2">

      <!-- IN-GAME: LOBBY -->
      <div v-if="isAuthenticated && isInGame" class="lg:col-span-2">
        <GameLobby @leave="handleLeaveGame" />
      </div>

      <!-- LOGGED-IN: CREATE / JOIN -->
      <div v-else-if="isAuthenticated" class="bg-white/70 rounded-3xl p-8 shadow-sm lg:col-span-2">
        <div class="max-w-lg mx-auto text-center">
          <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-lime flex items-center justify-center text-cream text-3xl font-game shadow-lg">
            {{ auth.user?.pseudo?.charAt(0)?.toUpperCase() ?? '?' }}
          </div>
          <h2 class="text-brown mb-1">{{ t('play.logged.welcome') }}</h2>
          <p class="text-primary font-semibold text-2xl font-game mb-2">{{ auth.user?.pseudo }}</p>
          <p class="text-brown/60 text-sm mb-10">{{ t('play.logged.subtitle') }}</p>

          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2"
          >
            <div v-if="game.error" class="flex items-start gap-3 bg-red/10 text-red rounded-xl px-4 py-3 mb-4 text-sm">
              <AlertCircle :stroke-width="1.5" class="w-5 h-5 mt-0.5 shrink-0" />
              <span>{{ t(game.error) }}</span>
            </div>
          </Transition>

          <div class="grid gap-4 sm:grid-cols-2 mb-8">
            <button id="btn-create-game" @click="handleCreateGame" :disabled="isCreating"
              class="flex items-center justify-center gap-3 px-6 py-4 bg-primary text-cream rounded-2xl font-semibold text-lg hover:scale-[1.03] active:scale-[0.98] transition-all shadow-md cursor-pointer disabled:opacity-50">
              <Loader2 v-if="isCreating" :stroke-width="2" class="w-6 h-6 animate-spin" />
              <Gamepad2 v-else :stroke-width="1.8" class="w-6 h-6" />
              {{ t('play.logged.create_game') }}
            </button>
            <button id="btn-join-game" @click="showJoinModal = true"
              class="flex items-center justify-center gap-3 px-6 py-4 border-2 border-brown text-brown rounded-2xl font-semibold text-lg hover:bg-brown hover:text-cream transition-colors cursor-pointer">
              <Users :stroke-width="1.8" class="w-6 h-6" />
              {{ t('play.logged.join_game') }}
            </button>
          </div>

          <!-- Join Modal -->
          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2"
          >
            <div v-if="showJoinModal" class="bg-brown rounded-2xl p-6 mb-6">
              <form @submit.prevent="handleJoinGame" class="space-y-4">
                <p class="text-cream font-semibold text-lg">{{ t('game.join.title') }}</p>
                <input
                  v-model="joinCode"
                  type="text"
                  :placeholder="t('game.join.placeholder')"
                  class="w-full px-4 py-3 rounded-xl border-2 border-primary bg-cream text-brown placeholder:text-brown/40 focus:outline-none focus:ring-[3px] focus:ring-primary/25 transition-all text-center text-2xl font-game tracking-[0.3em] uppercase"
                  maxlength="6"
                  autofocus
                />
                <div class="flex gap-3">
                  <button type="button" @click="showJoinModal = false; joinCode = ''"
                    class="flex-1 py-3 rounded-xl border border-cream/30 text-cream/70 font-semibold hover:bg-cream/10 transition-colors cursor-pointer">
                    {{ t('game.join.cancel') }}
                  </button>
                  <button type="submit" :disabled="!joinCode.trim() || isJoining"
                    class="flex-1 py-3 rounded-xl bg-primary text-cream font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50">
                    <Loader2 v-if="isJoining" :stroke-width="2" class="w-5 h-5 animate-spin inline" />
                    {{ t('game.join.submit') }}
                  </button>
                </div>
              </form>
            </div>
          </Transition>

          <button id="btn-logout" @click="handleLogout"
            class="inline-flex items-center gap-2 text-sm text-brown/50 hover:text-red transition-colors cursor-pointer">
            <LogOut :stroke-width="1.5" class="w-4 h-4" />
            {{ t('play.logged.logout') }}
          </button>
        </div>
      </div>

      <!-- AUTH FORMS -->
      <template v-else>
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

        <!-- FEATURES + DEMO -->
        <div class="flex flex-col gap-8">
          <div class="bg-primary/10 rounded-3xl p-8">
            <p class="font-semibold text-brown mb-4">{{ t('play.features.title') }}</p>
            <ul class="space-y-3">
              <li v-for="(item, i) in featureItems" :key="i"
                class="flex items-start gap-3 text-brown/70 text-sm leading-relaxed">
                <span class="text-primary mt-0.5">✓</span>
                {{ item }}
              </li>
            </ul>
          </div>

          <div class="bg-cream-dark rounded-3xl p-8 text-center">
            <p class="font-semibold text-brown text-lg mb-2">{{ t('play.demo.title') }}</p>
            <p class="text-brown/60 text-sm mb-6 leading-relaxed">{{ t('play.demo.desc') }}</p>
            <button id="btn-demo"
              class="px-8 py-3 border-2 border-brown text-brown rounded-full font-semibold hover:bg-brown hover:text-cream transition-colors cursor-pointer">
              {{ t('play.demo.cta') }}
            </button>
          </div>
        </div>
      </template>

    </div>
  </div>
</template>
