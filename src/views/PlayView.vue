<script setup lang="ts">
import { ref, onUnmounted, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuth } from '@/composables/useAuth'
import { useGame } from '@/composables/useGame'
import GameLobby from '@/components/GameLobby.vue'
import GameActive from '@/components/GameActive.vue'
import { LogOut, Gamepad2, Users, Loader2, AlertCircle } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()
const { isAuthenticated, logout } = useAuth()
const { state: game, isInGame, isActive, isFinished, createGame, joinGame, leaveGame, stopPolling } = useGame()

watchEffect(() => {
  if (!isAuthenticated.value) {
    router.push('/compte')
  }
})

const showJoinModal = ref(false)
const joinCode = ref('')
const isJoining = ref(false)
const isCreating = ref(false)

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

function handleLogout() {
  leaveGame()
  logout()
}

onUnmounted(() => stopPolling())
</script>

<template>
  <!-- Full-screen game view — bypasses hero+grid entirely -->
  <GameActive v-if="isAuthenticated && isInGame && (isActive || isFinished)" />

  <div v-else class="bg-white pt-8 lg:pt-14 pb-14">

    <div class="max-w-3xl mx-auto px-6">

      <!-- IN-GAME: LOBBY -->
      <div v-if="isAuthenticated && isInGame" class="lg:col-span-2">
        <GameLobby @leave="handleLeaveGame" />
      </div>

      <!-- LOGGED-IN: CREATE / JOIN -->
      <div v-else-if="isAuthenticated" class="bg-cream rounded-3xl p-6 sm:p-8 shadow-sm text-center">
        <div class="max-w-md mx-auto">
          <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Gamepad2 :stroke-width="1.5" class="w-6 h-6" />
          </div>
          <h2 class="text-brown font-game text-2xl mb-1">{{ t('play.logged.ready_to_play') }}</h2>
          <p class="text-brown/60 text-sm mb-6">{{ t('play.logged.create_or_join') }}</p>

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

          <div class="flex flex-col gap-6 mb-6">
            <button id="btn-create-game" @click="handleCreateGame" :disabled="isCreating"
              class="w-full flex items-center justify-center gap-3 px-4 py-4 bg-primary text-cream rounded-2xl font-semibold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md cursor-pointer disabled:opacity-50">
              <Loader2 v-if="isCreating" :stroke-width="2" class="w-6 h-6 animate-spin" />
              <Gamepad2 v-else :stroke-width="1.8" class="w-6 h-6" />
              {{ t('play.logged.create_game') }}
            </button>

            <div class="relative">
              <div class="absolute inset-0 flex items-center" aria-hidden="true">
                <div class="w-full border-t border-brown/10"></div>
              </div>
              <div class="relative flex justify-center">
                <span class="px-3 bg-cream text-sm text-brown/40 font-semibold uppercase tracking-wider">{{ t('play.logged.or') }}</span>
              </div>
            </div>

            <div class="bg-brown rounded-2xl p-6 shadow-inner">
              <form @submit.prevent="handleJoinGame" class="space-y-4">
                <p class="text-cream font-semibold text-lg">{{ t('game.join.title') }}</p>
                <input
                  v-model="joinCode"
                  type="text"
                  :placeholder="t('game.join.placeholder')"
                  class="w-full px-4 py-3 rounded-xl border-2 border-primary bg-cream text-brown placeholder:text-brown/40 focus:outline-none focus:ring-[3px] focus:ring-primary/25 transition-all text-center text-2xl font-game tracking-[0.3em] uppercase"
                  maxlength="6"
                />
                <button type="submit" :disabled="!joinCode.trim() || isJoining"
                  class="w-full py-3 rounded-xl bg-primary text-cream font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
                  <Loader2 v-if="isJoining" :stroke-width="2" class="w-5 h-5 animate-spin" />
                  <Users v-else :stroke-width="1.8" class="w-5 h-5" />
                  {{ t('game.join.submit') }}
                </button>
              </form>
            </div>
          </div>

          <button id="btn-logout" @click="handleLogout"
            class="inline-flex items-center gap-2 text-sm text-brown/50 hover:text-red transition-colors cursor-pointer">
            <LogOut :stroke-width="1.5" class="w-4 h-4" />
            {{ t('play.logged.logout') }}
          </button>
        </div>
      </div>

    </div>
  </div>
</template>
