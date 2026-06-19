<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGame } from '@/composables/useGame'
import { useAuth } from '@/composables/useAuth'
import { Copy, Check, UserPlus, Play, ArrowLeft, Loader2, Crown, AlertCircle, X } from 'lucide-vue-next'
import ladybugImg from '@/assets/img/ladybug.svg'

const { t } = useI18n()
const { state: auth } = useAuth()
const {
  state: game,
  isLobby,
  participants,
  addGuestPlayer,
  removeGuestPlayer,
  startGame,
  leaveGame,
  clearError,
} = useGame()

const MAX_PLAYERS = 5

/* ── Add guest ── */
const guestName = ref('')
const isAddingGuest = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

async function handleAddGuest() {
  const name = guestName.value.trim()
  if (!name || !game.session) return
  isAddingGuest.value = true
  clearError()
  await addGuestPlayer(game.session.joinCode, name)
  guestName.value = ''
  isAddingGuest.value = false
  await nextTick()
  inputRef.value?.focus()
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
const isOwner = computed(() => game.session?.ownerId === auth.user?.id)
const canStart = computed(() => isOwner.value && participants.value.length >= 2 && isLobby.value)
const canAddMore = computed(() => participants.value.length < MAX_PLAYERS)

const avatarColors = ['bg-primary', 'bg-amber-400', 'bg-sky-400', 'bg-pink-400']

/* ── Slots restants visualisés ── */
const emptySlots = computed(() => Math.max(0, MAX_PLAYERS - participants.value.length))
</script>

<template>
  <div class="relative">
    <img :src="ladybugImg" aria-hidden="true"
      class="hidden sm:block absolute top-4 right-16 w-36 pointer-events-none select-none -rotate-10" />
  <div class="max-w-lg mx-auto px-4 py-6 flex flex-col gap-5">

    <!-- Header -->
    <div class="flex items-center gap-3">
      <button @click="handleLeave"
        class="w-10 h-10 flex items-center justify-center rounded-full bg-cream-dark text-brown hover:bg-primary hover:text-cream transition-colors cursor-pointer shrink-0">
        <ArrowLeft :stroke-width="2" class="w-5 h-5" />
      </button>
      <h2 class="text-brown text-2xl font-game leading-tight">{{ t('game.lobby.title') }}</h2>
    </div>

    <!-- Code de partie mis en valeur -->
    <div class="bg-brown rounded-3xl px-4 py-5 sm:px-6 text-center">
      <p class="text-cream/50 text-xs uppercase tracking-wider mb-2">{{ t('game.lobby.code_label') }}</p>
      <div class="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
        <span class="text-primary font-game text-4xl sm:text-5xl tracking-[0.2em] sm:tracking-[0.35em]">{{ game.session?.joinCode }}</span>
        <button @click="copyCode"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cream/10 hover:bg-cream/20 text-cream/70 hover:text-cream transition-all cursor-pointer text-xs font-semibold">
          <Check v-if="copied" class="w-3.5 h-3.5" />
          <Copy v-else class="w-3.5 h-3.5" />
          {{ copied ? 'Copié !' : 'Copier' }}
        </button>
      </div>
    </div>

    <!-- Error -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div v-if="game.error" class="flex items-center gap-3 px-4 py-3 bg-red/10 text-red rounded-xl text-sm">
        <AlertCircle :stroke-width="1.5" class="w-5 h-5 shrink-0" />
        <span>{{ t(game.error) }}</span>
      </div>
    </Transition>

    <!-- ── AJOUT DE JOUEURS (owner only, prominent) ── -->
    <div v-if="isOwner && canAddMore" class="bg-brown rounded-3xl p-5">
      <p class="text-cream font-semibold text-base mb-1">
        {{ t('game.lobby.add_players_title') }}
      </p>
      <p class="text-cream/50 text-xs mb-4">{{ t('game.lobby.add_players_hint') }}</p>

      <form @submit.prevent="handleAddGuest" class="flex gap-2">
        <input
          ref="inputRef"
          v-model="guestName"
          type="text"
          :placeholder="t('game.lobby.guest_name_placeholder')"
          class="flex-1 min-w-0 px-4 py-3 rounded-xl border-2 border-primary bg-cream text-brown placeholder:text-brown/40 focus:outline-none focus:ring-[3px] focus:ring-primary/25 transition-all text-base"
          maxlength="20"
          autofocus
        />
        <button
          type="submit"
          :disabled="!guestName.trim() || isAddingGuest"
          class="shrink-0 flex items-center gap-2 px-5 py-3 bg-primary text-cream rounded-xl font-semibold cursor-pointer hover:scale-[1.03] active:scale-[0.97] transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Loader2 v-if="isAddingGuest" :stroke-width="2" class="w-5 h-5 animate-spin" />
          <UserPlus v-else :stroke-width="2" class="w-5 h-5" />
          <span class="hidden sm:inline">{{ t('game.lobby.add_btn') }}</span>
        </button>
      </form>
    </div>

    <!-- ── LISTE DES JOUEURS ── -->
    <div class="flex flex-col gap-2">
      <p class="text-brown/60 text-xs font-semibold uppercase tracking-wider px-1">
        {{ participants.length }}/{{ MAX_PLAYERS }} {{ t('game.lobby.players') }}
      </p>

      <!-- Joueurs présents -->
      <div
        v-for="(player, index) in participants"
        :key="player.id"
        class="flex items-center gap-3 bg-cream-dark rounded-2xl px-4 py-3"
      >
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center text-white text-base font-bold shrink-0 bg-gradient-to-br relative"
          :class="avatarColors[index % avatarColors.length]"
        >
          {{ player.displayName.charAt(0).toUpperCase() }}
          <Crown v-if="player.isUser && game.session?.ownerId === auth.user?.id && index === 0"
            :stroke-width="2" class="absolute -top-2.5 -right-1.5 w-4 h-4 text-amber-400 drop-shadow" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-brown font-semibold text-sm truncate">{{ player.displayName }}</p>
          <p v-if="player.isGuest" class="text-primary text-xs font-medium">{{ t('game.lobby.guest') }}</p>
          <p v-else-if="player.isOwner" class="text-brown/40 text-xs">{{ t('game.lobby.host') }}</p>
          <p v-else class="text-brown/40 text-xs">Joueur</p>
        </div>
        <button v-if="isOwner && player.isGuest"
          @click="removeGuestPlayer(player.id)"
          class="shrink-0 w-7 h-7 flex items-center justify-center rounded-full hover:bg-red/15 text-brown/30 hover:text-red transition-colors cursor-pointer">
          <X :stroke-width="2" class="w-4 h-4" />
        </button>
      </div>

      <!-- Slots vides -->
      <div
        v-for="i in emptySlots"
        :key="`empty-${i}`"
        class="flex items-center gap-3 rounded-2xl px-4 py-3 border-2 border-dashed border-brown/15"
      >
        <div class="w-10 h-10 rounded-full bg-brown/10 flex items-center justify-center shrink-0">
          <span class="text-brown/20 text-lg">+</span>
        </div>
        <p class="text-brown/30 text-sm italic">{{ t('game.lobby.empty_slot') }}</p>
      </div>
    </div>

    <!-- ── LANCER (owner) ── -->
    <div v-if="isOwner" class="pt-2 text-center">
      <p v-if="participants.length < 2" class="text-brown/50 text-sm mb-3 bg-cream-dark rounded-xl px-4 py-2">
        {{ t('game.lobby.need_players') }}
      </p>
      <button
        @click="handleStart"
        :disabled="!canStart || isStarting"
        class="inline-flex items-center justify-center gap-3 px-12 py-4 bg-primary text-cream rounded-full font-bold text-lg cursor-pointer shadow-lg shadow-primary/30 hover:scale-[1.03] hover:shadow-xl hover:shadow-primary/40 active:scale-[0.97] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100"
      >
        <Loader2 v-if="isStarting" :stroke-width="2" class="w-6 h-6 animate-spin" />
        <Play v-else :stroke-width="2" class="w-6 h-6 fill-cream" />
        {{ t('game.lobby.start') }}
      </button>
    </div>

    <!-- ── ATTENTE (non-owner) ── -->
    <div v-else class="flex items-center justify-center gap-3 py-4 text-brown/60">
      <Loader2 :stroke-width="2" class="w-5 h-5 animate-spin text-primary" />
      <p class="text-sm">{{ t('game.lobby.waiting_host') }}</p>
    </div>

  </div>
  </div>
</template>
