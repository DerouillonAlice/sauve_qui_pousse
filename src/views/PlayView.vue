<script setup lang="ts">
import { ref, computed, onUnmounted, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuth } from '@/composables/useAuth'
import { useGame } from '@/composables/useGame'
import GameLobby from '@/components/GameLobby.vue'
import GameActive from '@/components/GameActive.vue'
import { LogOut, Gamepad2, Users, Loader2, AlertCircle, CheckCircle2 } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const { t, tm } = useI18n()
const router = useRouter()
const { state: auth, isAuthenticated, logout } = useAuth()
const { state: game, isInGame, isActive, isFinished, createGame, joinGame, leaveGame, stopPolling } = useGame()

const featureItems = computed(() => tm('play.features.items') as string[])

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

  <div v-else class="bg-white min-h-screen pt-10 lg:pt-16 pb-24">

    <div class="max-w-3xl mx-auto px-6 gap-12">

      <!-- IN-GAME: LOBBY -->
      <div v-if="isAuthenticated && isInGame" class="lg:col-span-2">
        <GameLobby @leave="handleLeaveGame" />
      </div>

      <!-- LOGGED-IN: CREATE / JOIN -->
      <div v-else-if="isAuthenticated" class="bg-cream rounded-3xl p-8 sm:p-12 shadow-sm text-center">
        <div class="max-w-md mx-auto">
          <div class="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Gamepad2 :stroke-width="1.5" class="w-8 h-8" />
          </div>
          <h2 class="text-brown font-game text-3xl mb-2">Prêt à jouer ?</h2>
          <p class="text-brown/60 text-sm mb-10">Créez une nouvelle partie ou rejoignez vos amis avec un code.</p>

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

          <div class="flex flex-col sm:flex-row gap-4 mb-8">
            <button id="btn-create-game" @click="handleCreateGame" :disabled="isCreating"
              class="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-primary text-cream rounded-2xl font-semibold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md cursor-pointer disabled:opacity-50">
              <Loader2 v-if="isCreating" :stroke-width="2" class="w-6 h-6 animate-spin" />
              <Gamepad2 v-else :stroke-width="1.8" class="w-6 h-6" />
              Créer une partie
            </button>
            <button id="btn-join-game" @click="showJoinModal = true"
              class="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-brown text-cream rounded-2xl font-semibold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md cursor-pointer">
              <Users :stroke-width="1.8" class="w-6 h-6" />
              Rejoindre
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

    </div>
  </div>
</template>
