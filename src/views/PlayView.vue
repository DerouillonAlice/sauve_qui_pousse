<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuth } from '@/composables/useAuth'
import { LogOut, Gamepad2, Users, Loader2, AlertCircle, CheckCircle2 } from 'lucide-vue-next'

const { t, tm } = useI18n()
const { state: auth, isAuthenticated, login, register, logout, clearError } = useAuth()

const featureItems = computed(() => tm('play.features.items') as string[])

/* ── Form state ── */
type Mode = 'login' | 'register'
const mode = ref<Mode>('register')
const successMessage = ref('')

// Login form
const loginEmail = ref('')
const loginPassword = ref('')

// Register form
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

/* ── Handlers ── */
async function handleLogin() {
  clearError()
  successMessage.value = ''
  if (!loginEmail.value || !loginPassword.value) return
  await login(loginEmail.value, loginPassword.value)
}

async function handleRegister() {
  clearError()
  successMessage.value = ''

  if (!registerFirstname.value || !registerLastname.value || !registerEmail.value || !registerPassword.value || !registerConfirmPassword.value) {
    return
  }

  if (registerPassword.value !== registerConfirmPassword.value) {
    ;(auth as { error: string | null }).error = 'auth.error.passwords_mismatch'
    return
  }

  // Use firstname as pseudo for the backend
  const pseudo = registerFirstname.value
  const ok = await register(registerEmail.value, registerPassword.value, pseudo)
  if (ok) {
    successMessage.value = t('play.register.success')
  }
}

function handleLogout() {
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
          <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-lime flex items-center justify-center text-cream text-3xl font-game shadow-lg">
            {{ auth.user?.pseudo?.charAt(0)?.toUpperCase() ?? '?' }}
          </div>
          <h2 class="text-brown mb-1">{{ t('play.logged.welcome') }}</h2>
          <p class="text-primary font-semibold text-2xl font-game mb-2">{{ auth.user?.pseudo }}</p>
          <p class="text-brown/60 text-sm mb-10">{{ t('play.logged.subtitle') }}</p>

          <div class="grid gap-4 sm:grid-cols-2 mb-8">
            <button id="btn-create-game"
              class="flex items-center justify-center gap-3 px-6 py-4 bg-primary text-cream rounded-2xl font-semibold text-lg hover:scale-[1.03] active:scale-[0.98] transition-all shadow-md">
              <Gamepad2 :stroke-width="1.8" class="w-6 h-6" />
              {{ t('play.logged.create_game') }}
            </button>
            <button id="btn-join-game"
              class="flex items-center justify-center gap-3 px-6 py-4 border-2 border-brown text-brown rounded-2xl font-semibold text-lg hover:bg-brown hover:text-cream transition-colors">
              <Users :stroke-width="1.8" class="w-6 h-6" />
              {{ t('play.logged.join_game') }}
            </button>
          </div>

          <button id="btn-logout" @click="handleLogout"
            class="inline-flex items-center gap-2 text-sm text-brown/50 hover:text-red transition-colors cursor-pointer">
            <LogOut :stroke-width="1.5" class="w-4 h-4" />
            {{ t('play.logged.logout') }}
          </button>
        </div>
      </div>

      <!-- ═══════════ AUTH FORMS ═══════════ -->
      <template v-else>
        <div class="auth-card">

          <!-- Error message -->
          <Transition name="fade">
            <div v-if="auth.error" class="flex items-start gap-3 bg-red/20 text-cream rounded-xl px-4 py-3 mb-4 text-sm">
              <AlertCircle :stroke-width="1.5" class="w-5 h-5 mt-0.5 shrink-0" />
              <span>{{ t(auth.error) }}</span>
            </div>
          </Transition>

          <!-- Success message -->
          <Transition name="fade">
            <div v-if="successMessage" class="flex items-start gap-3 bg-primary/30 text-cream rounded-xl px-4 py-3 mb-4 text-sm">
              <CheckCircle2 :stroke-width="1.5" class="w-5 h-5 mt-0.5 shrink-0" />
              <span>{{ successMessage }}</span>
            </div>
          </Transition>

          <!-- ── REGISTER FORM ── -->
          <form v-if="mode === 'register'" class="space-y-4" @submit.prevent="handleRegister">
            <h2 class="text-cream font-game text-3xl mb-6">{{ t('play.register.title') }}</h2>

            <div class="auth-field">
              <label for="register-firstname" class="auth-label">{{ t('play.register.firstname') }}</label>
              <input id="register-firstname" v-model="registerFirstname" type="text" required autocomplete="given-name"
                class="auth-input" />
            </div>

            <div class="auth-field">
              <label for="register-lastname" class="auth-label">{{ t('play.register.lastname') }}</label>
              <input id="register-lastname" v-model="registerLastname" type="text" required autocomplete="family-name"
                class="auth-input" />
            </div>

            <div class="auth-field">
              <label for="register-email" class="auth-label">{{ t('play.register.email') }}</label>
              <input id="register-email" v-model="registerEmail" type="email" required autocomplete="email"
                class="auth-input" />
            </div>

            <div class="auth-field">
              <label for="register-password" class="auth-label">{{ t('play.register.password') }}</label>
              <input id="register-password" v-model="registerPassword" type="password" required autocomplete="new-password"
                minlength="8" class="auth-input" />
              <span class="text-cream/50 text-xs mt-1">{{ t('play.register.password_hint') }}</span>
            </div>

            <div class="auth-field">
              <label for="register-confirm-password" class="auth-label">{{ t('play.register.confirm_password') }}</label>
              <input id="register-confirm-password" v-model="registerConfirmPassword" type="password" required
                autocomplete="new-password" class="auth-input" />
            </div>

            <div class="pt-2">
              <button id="register-submit" type="submit" :disabled="auth.isLoading" class="auth-submit">
                <Loader2 v-if="auth.isLoading" :stroke-width="2" class="w-5 h-5 animate-spin" />
                {{ t('play.register.submit') }}
              </button>
            </div>

            <p class="text-xs text-cream/50 text-center leading-relaxed">
              {{ t('play.register.legal') }}
            </p>

            <p class="text-center text-sm text-cream/70 pt-2">
              {{ t('play.register.switch_login') }}
              <button type="button" @click="switchMode('login')" class="text-primary font-semibold hover:underline cursor-pointer">
                {{ t('play.register.switch_login_link') }}
              </button>
            </p>
          </form>

          <!-- ── LOGIN FORM ── -->
          <form v-else class="space-y-4" @submit.prevent="handleLogin">
            <h2 class="text-cream font-game text-3xl mb-6">{{ t('play.login.title') }}</h2>

            <div class="auth-field">
              <label for="login-email" class="auth-label">{{ t('play.login.email') }}</label>
              <input id="login-email" v-model="loginEmail" type="email" required autocomplete="email"
                class="auth-input" />
            </div>

            <div class="auth-field">
              <label for="login-password" class="auth-label">{{ t('play.login.password') }}</label>
              <input id="login-password" v-model="loginPassword" type="password" required autocomplete="current-password"
                class="auth-input" />
            </div>

            <div class="pt-2">
              <button id="login-submit" type="submit" :disabled="auth.isLoading" class="auth-submit">
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

<style scoped>
/* ── Auth card (dark brown container) ── */
.auth-card {
  background-color: var(--color-brown);
  border-radius: 1.5rem;
  padding: 2rem;
}

/* ── Field groups ── */
.auth-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

/* ── Labels ── */
.auth-label {
  color: var(--color-cream);
  font-weight: 600;
  font-size: 0.875rem;
}

/* ── Inputs ── */
.auth-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: 2px solid var(--color-primary);
  background-color: var(--color-cream);
  color: var(--color-brown);
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.auth-input::placeholder {
  color: rgba(77, 51, 25, 0.4);
}
.auth-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(190, 192, 89, 0.25);
}

/* ── Submit button ── */
.auth-submit {
  width: auto;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 2.5rem;
  background-color: var(--color-primary);
  color: var(--color-cream);
  border-radius: 9999px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.15s ease;
}
.auth-submit:hover {
  transform: scale(1.03);
}
.auth-submit:active {
  transform: scale(0.97);
}
.auth-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── Transitions ── */
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
