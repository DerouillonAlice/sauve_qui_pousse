<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuth } from '@/composables/useAuth'
import { LogOut, Gamepad2, Users, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-vue-next'

const { t, tm } = useI18n()
const { state: auth, isAuthenticated, login, register, logout, clearError } = useAuth()

const featureItems = computed(() => tm('play.features.items') as string[])

/* ── Form state ── */
type Mode = 'login' | 'register'
const mode = ref<Mode>('login')
const successMessage = ref('')

// Login form
const loginEmail = ref('')
const loginPassword = ref('')
const showLoginPassword = ref(false)

// Register form
const registerPseudo = ref('')
const registerEmail = ref('')
const registerPassword = ref('')
const registerConfirmPassword = ref('')
const showRegisterPassword = ref(false)
const showRegisterConfirmPassword = ref(false)

function switchMode(m: Mode) {
  mode.value = m
  clearError()
  successMessage.value = ''
}

/* ── Handlers ── */
async function handleLogin() {
  clearError()
  successMessage.value = ''
  if (!loginEmail.value || !loginPassword.value) {
    return
  }
  await login(loginEmail.value, loginPassword.value)
}

async function handleRegister() {
  clearError()
  successMessage.value = ''

  if (!registerPseudo.value || !registerEmail.value || !registerPassword.value || !registerConfirmPassword.value) {
    return
  }

  if (registerPassword.value !== registerConfirmPassword.value) {
    // We manually set an i18n error key via a hack — the composable uses i18n keys for errors
    ;(auth as { error: string | null }).error = 'auth.error.passwords_mismatch'
    return
  }

  const ok = await register(registerEmail.value, registerPassword.value, registerPseudo.value)
  if (ok) {
    successMessage.value = t('play.register.success')
  }
}

function handleLogout() {
  logout()
  loginEmail.value = ''
  loginPassword.value = ''
  registerPseudo.value = ''
  registerEmail.value = ''
  registerPassword.value = ''
  registerConfirmPassword.value = ''
  successMessage.value = ''
  mode.value = 'login'
}
</script>

<template>
  <div class="bg-cream min-h-screen">

    <!-- HERO -->
    <section class="py-16 px-6 text-center bg-cream-dark">
      <div class="max-w-xl mx-auto">
        <h1 class="text-brown mb-3">{{ t('play.hero.title') }}</h1>
        <p class="text-brown/70 text-lg">{{ t('play.hero.subtitle') }}</p>
      </div>
    </section>

    <div class="max-w-4xl mx-auto px-6 py-16 grid gap-12 lg:grid-cols-2">

      <!-- ═══════════ LOGGED-IN STATE ═══════════ -->
      <div v-if="isAuthenticated" class="bg-white/70 rounded-3xl p-8 shadow-sm lg:col-span-2">
        <div class="max-w-lg mx-auto text-center">

          <!-- Avatar & Welcome -->
          <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-lime flex items-center justify-center text-cream text-3xl font-game shadow-lg">
            {{ auth.user?.pseudo?.charAt(0)?.toUpperCase() ?? '?' }}
          </div>
          <h2 class="text-brown mb-1">{{ t('play.logged.welcome') }}</h2>
          <p class="text-primary font-semibold text-2xl font-game mb-2">{{ auth.user?.pseudo }}</p>
          <p class="text-brown/60 text-sm mb-10">{{ t('play.logged.subtitle') }}</p>

          <!-- Action buttons -->
          <div class="grid gap-4 sm:grid-cols-2 mb-8">
            <button
              id="btn-create-game"
              class="flex items-center justify-center gap-3 px-6 py-4 bg-primary text-cream rounded-2xl font-semibold text-lg hover:scale-[1.03] active:scale-[0.98] transition-all shadow-md"
            >
              <Gamepad2 :stroke-width="1.8" class="w-6 h-6" />
              {{ t('play.logged.create_game') }}
            </button>
            <button
              id="btn-join-game"
              class="flex items-center justify-center gap-3 px-6 py-4 border-2 border-brown text-brown rounded-2xl font-semibold text-lg hover:bg-brown hover:text-cream transition-colors"
            >
              <Users :stroke-width="1.8" class="w-6 h-6" />
              {{ t('play.logged.join_game') }}
            </button>
          </div>

          <!-- Logout -->
          <button
            id="btn-logout"
            @click="handleLogout"
            class="inline-flex items-center gap-2 text-sm text-brown/50 hover:text-red transition-colors cursor-pointer"
          >
            <LogOut :stroke-width="1.5" class="w-4 h-4" />
            {{ t('play.logged.logout') }}
          </button>
        </div>
      </div>

      <!-- ═══════════ AUTH FORMS ═══════════ -->
      <template v-else>
        <div class="bg-white/70 rounded-3xl p-8 shadow-sm">
          <!-- Tabs -->
          <div class="flex gap-2 mb-8 bg-cream rounded-xl p-1">
            <button v-for="m in (['login', 'register'] as Mode[])" :key="m"
              @click="switchMode(m)"
              :id="`tab-${m}`"
              class="flex-1 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
              :class="mode === m ? 'bg-primary text-cream' : 'text-brown/60 hover:text-brown'">
              {{ m === 'login' ? t('play.login.title') : t('play.register.title') }}
            </button>
          </div>

          <!-- Error message -->
          <Transition name="fade">
            <div v-if="auth.error" class="flex items-start gap-3 bg-red/10 text-red rounded-xl px-4 py-3 mb-4 text-sm">
              <AlertCircle :stroke-width="1.5" class="w-5 h-5 mt-0.5 shrink-0" />
              <span>{{ t(auth.error) }}</span>
            </div>
          </Transition>

          <!-- Success message -->
          <Transition name="fade">
            <div v-if="successMessage" class="flex items-start gap-3 bg-primary/10 text-brown rounded-xl px-4 py-3 mb-4 text-sm">
              <CheckCircle2 :stroke-width="1.5" class="w-5 h-5 mt-0.5 shrink-0 text-primary" />
              <span>{{ successMessage }}</span>
            </div>
          </Transition>

          <!-- Login Form -->
          <form v-if="mode === 'login'" class="space-y-4" @submit.prevent="handleLogin">
            <div class="relative">
              <input
                id="login-email"
                v-model="loginEmail"
                type="email"
                :placeholder="t('play.login.email')"
                required
                autocomplete="email"
                class="w-full px-4 py-3 rounded-xl border border-primary/20 bg-cream text-brown placeholder-brown/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div class="relative">
              <input
                id="login-password"
                v-model="loginPassword"
                :type="showLoginPassword ? 'text' : 'password'"
                :placeholder="t('play.login.password')"
                required
                autocomplete="current-password"
                class="w-full px-4 py-3 pr-12 rounded-xl border border-primary/20 bg-cream text-brown placeholder-brown/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <button
                type="button"
                @click="showLoginPassword = !showLoginPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-brown/40 hover:text-brown transition-colors cursor-pointer"
                tabindex="-1"
              >
                <EyeOff v-if="showLoginPassword" :stroke-width="1.5" class="w-5 h-5" />
                <Eye v-else :stroke-width="1.5" class="w-5 h-5" />
              </button>
            </div>
            <button
              id="login-submit"
              type="submit"
              :disabled="auth.isLoading"
              class="w-full py-3 bg-primary text-cream rounded-xl font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              <Loader2 v-if="auth.isLoading" :stroke-width="2" class="w-5 h-5 animate-spin" />
              {{ t('play.login.submit') }}
            </button>
            <p class="text-center text-sm text-brown/50 hover:text-brown cursor-pointer transition-colors">
              {{ t('play.login.forgot') }}
            </p>
          </form>

          <!-- Register Form -->
          <form v-else class="space-y-4" @submit.prevent="handleRegister">
            <p class="text-brown/60 text-sm mb-2">{{ t('play.register.subtitle') }}</p>
            <input
              id="register-pseudo"
              v-model="registerPseudo"
              type="text"
              :placeholder="t('play.register.pseudo')"
              required
              autocomplete="username"
              class="w-full px-4 py-3 rounded-xl border border-primary/20 bg-cream text-brown placeholder-brown/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <input
              id="register-email"
              v-model="registerEmail"
              type="email"
              :placeholder="t('play.register.email')"
              required
              autocomplete="email"
              class="w-full px-4 py-3 rounded-xl border border-primary/20 bg-cream text-brown placeholder-brown/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <div class="relative">
              <input
                id="register-password"
                v-model="registerPassword"
                :type="showRegisterPassword ? 'text' : 'password'"
                :placeholder="t('play.register.password')"
                required
                autocomplete="new-password"
                class="w-full px-4 py-3 pr-12 rounded-xl border border-primary/20 bg-cream text-brown placeholder-brown/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <button
                type="button"
                @click="showRegisterPassword = !showRegisterPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-brown/40 hover:text-brown transition-colors cursor-pointer"
                tabindex="-1"
              >
                <EyeOff v-if="showRegisterPassword" :stroke-width="1.5" class="w-5 h-5" />
                <Eye v-else :stroke-width="1.5" class="w-5 h-5" />
              </button>
            </div>
            <div class="relative">
              <input
                id="register-confirm-password"
                v-model="registerConfirmPassword"
                :type="showRegisterConfirmPassword ? 'text' : 'password'"
                :placeholder="t('play.register.confirm_password')"
                required
                autocomplete="new-password"
                class="w-full px-4 py-3 pr-12 rounded-xl border border-primary/20 bg-cream text-brown placeholder-brown/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <button
                type="button"
                @click="showRegisterConfirmPassword = !showRegisterConfirmPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-brown/40 hover:text-brown transition-colors cursor-pointer"
                tabindex="-1"
              >
                <EyeOff v-if="showRegisterConfirmPassword" :stroke-width="1.5" class="w-5 h-5" />
                <Eye v-else :stroke-width="1.5" class="w-5 h-5" />
              </button>
            </div>
            <button
              id="register-submit"
              type="submit"
              :disabled="auth.isLoading"
              class="w-full py-3 bg-primary text-cream rounded-xl font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              <Loader2 v-if="auth.isLoading" :stroke-width="2" class="w-5 h-5 animate-spin" />
              {{ t('play.register.submit') }}
            </button>
            <p class="text-xs text-brown/40 text-center leading-relaxed">
              {{ t('play.register.legal') }}
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
            <button
              id="btn-demo"
              class="px-8 py-3 border-2 border-brown text-brown rounded-full font-semibold hover:bg-brown hover:text-cream transition-colors cursor-pointer">
              {{ t('play.demo.cta') }}
            </button>
          </div>
        </div>
      </template>

    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
