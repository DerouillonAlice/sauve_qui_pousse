<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGame } from '@/composables/useGame'
import { useAuth } from '@/composables/useAuth'
import { Copy, Check, UserPlus, Play, ArrowLeft, Loader2, Users, Crown, AlertCircle } from 'lucide-vue-next'

const { t } = useI18n()
const { state: auth } = useAuth()
const {
  state: game,
  isLobby,
  participants,
  addGuestPlayer,
  startGame,
  leaveGame,
  clearError,
} = useGame()

const MAX_PLAYERS = 4

/* ── Add guest ── */
const guestName = ref('')
const isAddingGuest = ref(false)

async function handleAddGuest() {
  if (!guestName.value.trim() || !game.session) return
  isAddingGuest.value = true
  clearError()
  await addGuestPlayer(game.session.joinCode, guestName.value.trim())
  guestName.value = ''
  isAddingGuest.value = false
}

/* ── Copy code ── */
const copied = ref(false)
function copyCode() {
  if (!game.session) return
  navigator.clipboard.writeText(game.session.joinCode)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}

/* ── Start game ── */
const isStarting = ref(false)
async function handleStart() {
  isStarting.value = true
  clearError()
  await startGame()
  isStarting.value = false
}

/* ── Leave ── */
const emit = defineEmits<{ leave: [] }>()
function handleLeave() {
  leaveGame()
  emit('leave')
}

/* ── Computed ── */
const isOwner = computed(() => {
  return game.session?.ownerId === auth.user?.id
})

const canStart = computed(() => {
  return isOwner.value && participants.value.length >= 2 && isLobby.value
})

const canAddMore = computed(() => {
  return participants.value.length < MAX_PLAYERS
})

/* ── Avatar colors ── */
const avatarColors = [
  'from-primary to-lime',
  'from-amber-500 to-orange-400',
  'from-sky-400 to-blue-500',
  'from-pink-400 to-rose-500',
]
</script>

<template>
  <div class="max-w-lg mx-auto px-4 py-6 flex flex-col gap-6">

    <!-- Header -->
    <div class="flex items-center gap-4">
      <button @click="handleLeave"
        class="w-10 h-10 flex items-center justify-center rounded-full bg-cream-dark text-brown hover:bg-primary hover:text-cream transition-colors cursor-pointer">
        <ArrowLeft :stroke-width="2" class="w-5 h-5" />
      </button>
      <h2 class="text-brown text-2xl font-game">{{ t('game.lobby.title') }}</h2>
    </div>

    <!-- Join Code Card -->
    <div class="bg-brown rounded-3xl p-6 text-center">
      <p class="text-cream/70 text-sm mb-3">{{ t('game.lobby.code_label') }}</p>
      <div class="flex items-center justify-center gap-4">
        <span class="text-5xl text-primary tracking-[0.5rem] font-bold font-game">
          {{ game.session?.joinCode }}
        </span>
        <button @click="copyCode" :title="t('game.lobby.copy')"
          class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 text-cream hover:bg-white/20 transition-colors cursor-pointer">
          <Check v-if="copied" :stroke-width="2" class="w-5 h-5 text-primary" />
          <Copy v-else :stroke-width="2" class="w-5 h-5" />
        </button>
      </div>
      <p class="text-cream/50 text-xs mt-3">{{ t('game.lobby.code_hint') }}</p>
    </div>

    <!-- Error -->
    <Transition name="fade">
      <div v-if="game.error" class="flex items-center gap-3 px-4 py-3 bg-red-500/10 text-red-600 rounded-xl text-sm">
        <AlertCircle :stroke-width="1.5" class="w-5 h-5 shrink-0" />
        <span>{{ game.error }}</span>
      </div>
    </Transition>

    <!-- Players Grid -->
    <div>
      <p class="flex items-center gap-2 text-brown font-semibold text-sm mb-3">
        <Users :stroke-width="1.5" class="w-5 h-5 inline" />
        {{ t('game.lobby.players') }} ({{ participants.length }}/{{ MAX_PLAYERS }})
      </p>

      <div class="grid grid-cols-2 gap-3">
        <div
          v-for="(player, index) in participants"
          :key="player.id"
          class="bg-cream-dark rounded-2xl py-5 px-4 flex flex-col items-center gap-2 relative"
        >
          <div
            class="w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl font-bold relative bg-gradient-to-br"
            :class="avatarColors[index % avatarColors.length]"
          >
            {{ player.displayName.charAt(0).toUpperCase() }}
            <Crown v-if="game.session?.ownerId && player.isUser && index === 0"
              :stroke-width="2" class="absolute -top-3 -right-2 w-5 h-5 text-amber-400 drop-shadow" />
          </div>
          <p class="text-brown font-semibold text-sm text-center">{{ player.displayName }}</p>
          <span v-if="player.isGuest"
            class="text-[0.625rem] uppercase tracking-wide text-primary bg-primary/15 px-2 py-0.5 rounded-full font-semibold">
            {{ t('game.lobby.guest') }}
          </span>
        </div>

        <!-- Add Player Slot -->
        <div v-if="canAddMore && isOwner"
          class="bg-cream-dark rounded-2xl p-4 flex items-center justify-center border-2 border-dashed border-brown/20">
          <form @submit.prevent="handleAddGuest" class="flex gap-2 w-full">
            <input
              v-model="guestName"
              type="text"
              :placeholder="t('game.lobby.guest_name_placeholder')"
              class="flex-1 min-w-0 px-3 py-2 rounded-xl border-2 border-primary bg-cream text-brown text-sm focus:outline-none focus:ring-3 focus:ring-primary/25"
              maxlength="20"
            />
            <button
              type="submit"
              :disabled="!guestName.trim() || isAddingGuest"
              class="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-primary text-cream cursor-pointer hover:scale-105 transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Loader2 v-if="isAddingGuest" :stroke-width="2" class="w-5 h-5 animate-spin" />
              <UserPlus v-else :stroke-width="2" class="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- Start Button -->
    <div v-if="isOwner" class="text-center">
      <button
        @click="handleStart"
        :disabled="!canStart || isStarting"
        class="inline-flex items-center justify-center gap-3 px-12 py-4 bg-primary text-cream rounded-full font-bold text-lg cursor-pointer shadow-lg shadow-primary/30 hover:scale-103 hover:shadow-xl hover:shadow-primary/40 active:scale-97 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Loader2 v-if="isStarting" :stroke-width="2" class="w-6 h-6 animate-spin" />
        <Play v-else :stroke-width="2" class="w-6 h-6" />
        {{ t('game.lobby.start') }}
      </button>
      <p v-if="participants.length < 2" class="text-brown/50 text-xs mt-3">
        {{ t('game.lobby.need_players') }}
      </p>
    </div>

    <!-- Waiting message for non-owners -->
    <div v-else class="flex items-center justify-center gap-3 py-4 text-brown/70">
      <Loader2 :stroke-width="2" class="w-6 h-6 animate-spin text-primary" />
      <p>{{ t('game.lobby.waiting_host') }}</p>
    </div>

  </div>
</template>
