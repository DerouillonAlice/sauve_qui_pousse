<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGame } from '@/composables/useGame'
import { Loader2, RotateCcw, ChevronRight, Award, Leaf, LogOut, Trophy } from 'lucide-vue-next'
import type { SpinResult } from '@/composables/useGame'

const { t } = useI18n()
const {
  state: game,
  isFinished,
  participants,
  currentParticipant,
  currentRound,
  spin,
  endTurn,
  winRound,
  leaveGame,
} = useGame()

/* ── wheel phases ── */
type Phase = 'idle' | 'spinning' | 'result'
const phase = ref<Phase>('idle')
const spinResult = ref<SpinResult | null>(null)
const isEndingTurn = ref(false)

async function handleSpin() {
  if (!currentParticipant.value || phase.value !== 'idle') return
  phase.value = 'spinning'
  const result = await spin(currentParticipant.value.id)
  spinResult.value = result
  phase.value = result ? 'result' : 'idle'
}

async function handleContinue() {
  if (spinResult.value?.resultType === 'extra_spin') {
    spinResult.value = null
    phase.value = 'idle'
    return
  }
  spinResult.value = null
  phase.value = 'idle'
  isEndingTurn.value = true
  await endTurn()
  isEndingTurn.value = false
}

/* ── win round modal ── */
const showWinModal = ref(false)
const selectedWinnerId = ref<number | null>(null)
const isDeclaringWin = ref(false)

async function handleWinRound() {
  if (!selectedWinnerId.value) return
  isDeclaringWin.value = true
  await winRound(selectedWinnerId.value)
  showWinModal.value = false
  selectedWinnerId.value = null
  phase.value = 'idle'
  isDeclaringWin.value = false
}

/* ── current round number ── */
const roundNumber = computed(() => currentRound.value?.roundNumber ?? 1)
const totalRoundsToWin = 3

/* ── card appearance ── */
interface CardStyle { bg: string; text: string; badge: string; icon: string; sign: string }
function cardStyle(type: string | undefined): CardStyle {
  switch (type) {
    case 'insect_pollinator': return { bg: 'bg-lime/30', text: 'text-primary', badge: 'bg-primary/20 text-primary', icon: '🐝', sign: '+3' }
    case 'insect_predator':   return { bg: 'bg-lime/20', text: 'text-primary', badge: 'bg-primary/20 text-primary', icon: '🐞', sign: '+2' }
    case 'insect_decomposer': return { bg: 'bg-lime/20', text: 'text-primary', badge: 'bg-primary/20 text-primary', icon: '🪱', sign: '+1' }
    case 'neutral':           return { bg: 'bg-cream-dark', text: 'text-brown', badge: 'bg-brown/10 text-brown', icon: '🌾', sign: '0' }
    case 'insecticide_contact': return { bg: 'bg-red/10', text: 'text-red', badge: 'bg-red/15 text-red', icon: '☠️', sign: '-3' }
    case 'pesticide_systemic':  return { bg: 'bg-red/10', text: 'text-red', badge: 'bg-red/15 text-red', icon: '🧪', sign: '-2' }
    case 'disaster':            return { bg: 'bg-red/10', text: 'text-red', badge: 'bg-red/15 text-red', icon: '⚡', sign: '-1' }
    default:                    return { bg: 'bg-cream-dark', text: 'text-brown', badge: 'bg-brown/10 text-brown', icon: '🎴', sign: '?' }
  }
}

const cs = computed(() => cardStyle(spinResult.value?.card?.type))

/* ── avatar colors ── */
const avatarColors = [
  'from-primary to-lime',
  'from-amber-500 to-orange-400',
  'from-sky-400 to-blue-500',
  'from-pink-400 to-rose-500',
]
</script>

<template>
  <div class="min-h-screen bg-cream flex flex-col">

    <!-- ═══ TOP BAR ═══ -->
    <div class="flex items-center justify-between px-4 py-3 bg-brown">
      <div class="flex items-center gap-2">
        <Leaf :stroke-width="1.5" class="w-5 h-5 text-primary" />
        <span class="text-cream font-game text-lg">
          {{ t('game.active.round', { n: roundNumber }) }}
        </span>
      </div>
      <button
        @click="showWinModal = true"
        :disabled="isFinished"
        class="flex items-center gap-2 px-4 py-2 bg-primary text-cream rounded-full font-bold text-sm cursor-pointer hover:scale-[1.05] active:scale-[0.97] transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Award :stroke-width="2" class="w-4 h-4" />
        {{ t('game.active.sauve') }}
      </button>
    </div>

    <!-- ═══ MAIN AREA ═══ -->
    <div class="flex-1 flex flex-col items-center justify-start px-4 py-6 gap-6 max-w-lg mx-auto w-full">

      <!-- Error -->
      <div v-if="game.error" class="w-full flex items-center gap-3 px-4 py-3 bg-red/10 text-red rounded-xl text-sm">
        <span>{{ t(game.error) }}</span>
      </div>

      <!-- Current player -->
      <div class="w-full text-center">
        <p class="text-brown/50 text-xs uppercase tracking-wider mb-2">{{ t('game.active.turn') }}</p>
        <div class="flex items-center justify-center gap-3">
          <div
            class="w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xl font-bold shadow-md"
            :class="avatarColors[(currentParticipant ? participants.indexOf(currentParticipant) : 0) % 4]"
          >
            {{ currentParticipant?.displayName.charAt(0).toUpperCase() ?? '?' }}
          </div>
          <span class="text-brown text-2xl font-game">{{ currentParticipant?.displayName ?? '—' }}</span>
        </div>
      </div>

      <!-- ── WHEEL ── -->
      <div class="relative flex items-center justify-center my-2">
        <!-- Outer ring -->
        <div
          class="w-48 h-48 rounded-full border-4 border-primary/20 flex items-center justify-center transition-transform duration-300"
          :class="{ 'animate-[spin_0.6s_ease-in-out_infinite]': phase === 'spinning' }"
        >
          <!-- Inner circle = button -->
          <button
            @click="handleSpin"
            :disabled="phase !== 'idle' || isFinished || isEndingTurn"
            class="w-36 h-36 rounded-full bg-gradient-to-br from-primary to-lime flex flex-col items-center justify-center gap-1 shadow-xl shadow-primary/30 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
          >
            <Loader2 v-if="phase === 'spinning'" :stroke-width="2" class="w-10 h-10 text-cream animate-spin" />
            <template v-else>
              <RotateCcw :stroke-width="2" class="w-8 h-8 text-cream" />
              <span class="text-cream font-bold text-xs uppercase tracking-widest">{{ t('game.active.spin') }}</span>
            </template>
          </button>
        </div>
      </div>

      <!-- ── SPIN RESULT ── -->
      <Transition
        enter-active-class="transition-all duration-400 ease-out"
        enter-from-class="opacity-0 translate-y-4 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 translate-y-2 scale-95"
      >
        <div v-if="phase === 'result' && spinResult" class="w-full">

          <!-- EXTRA SPIN -->
          <div v-if="spinResult.resultType === 'extra_spin'"
            class="bg-brown rounded-3xl p-6 text-center">
            <div class="text-4xl mb-2">🎲</div>
            <h3 class="text-cream font-game text-xl mb-1">{{ t('game.active.extra_spin_title') }}</h3>
            <p class="text-cream/60 text-sm mb-5">{{ t('game.active.extra_spin_desc') }}</p>
            <button @click="handleContinue"
              class="inline-flex items-center gap-2 px-8 py-3 bg-primary text-cream rounded-full font-bold cursor-pointer hover:scale-[1.03] active:scale-[0.97] transition-transform">
              <RotateCcw :stroke-width="2" class="w-5 h-5" />
              {{ t('game.active.spin_again') }}
            </button>
          </div>

          <!-- SKIP -->
          <div v-else-if="spinResult.resultType === 'skip'"
            class="bg-cream-dark rounded-3xl p-6 text-center">
            <div class="text-4xl mb-2">🍃</div>
            <h3 class="text-brown font-game text-xl mb-1">{{ t('game.active.skip_title') }}</h3>
            <p class="text-brown/50 text-sm mb-5">{{ t('game.active.skip_desc') }}</p>
            <button @click="handleContinue" :disabled="isEndingTurn"
              class="inline-flex items-center gap-2 px-8 py-3 bg-brown text-cream rounded-full font-bold cursor-pointer hover:scale-[1.03] active:scale-[0.97] transition-transform disabled:opacity-50">
              <Loader2 v-if="isEndingTurn" :stroke-width="2" class="w-5 h-5 animate-spin" />
              <ChevronRight v-else :stroke-width="2" class="w-5 h-5" />
              {{ t('game.active.end_turn') }}
            </button>
          </div>

          <!-- CARD -->
          <div v-else-if="spinResult.card"
            :class="cs.bg"
            class="rounded-3xl p-6 text-center shadow-md">
            <div class="text-4xl mb-2">{{ cs.icon }}</div>
            <span :class="cs.badge" class="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-3">
              {{ cs.sign }} pts
            </span>
            <h3 :class="cs.text" class="font-game text-xl mb-1">{{ spinResult.card.title }}</h3>
            <p class="text-brown/60 text-sm leading-relaxed mb-5">{{ spinResult.card.description }}</p>
            <button @click="handleContinue" :disabled="isEndingTurn"
              class="inline-flex items-center gap-2 px-8 py-3 bg-brown text-cream rounded-full font-bold cursor-pointer hover:scale-[1.03] active:scale-[0.97] transition-transform disabled:opacity-50">
              <Loader2 v-if="isEndingTurn" :stroke-width="2" class="w-5 h-5 animate-spin" />
              <ChevronRight v-else :stroke-width="2" class="w-5 h-5" />
              {{ t('game.active.end_turn') }}
            </button>
          </div>

        </div>
      </Transition>

      <!-- ── SCORES ── -->
      <div class="w-full">
        <p class="text-brown/40 text-xs uppercase tracking-wider mb-2 text-center">{{ t('game.active.scores') }}</p>
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div
            v-for="(p, i) in participants"
            :key="p.id"
            :class="p.id === currentParticipant?.id ? 'ring-2 ring-primary' : 'ring-1 ring-brown/10'"
            class="bg-cream-dark rounded-2xl py-3 px-3 flex flex-col items-center gap-1"
          >
            <div
              class="w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-sm font-bold"
              :class="avatarColors[i % 4]"
            >
              {{ p.displayName.charAt(0).toUpperCase() }}
            </div>
            <p class="text-brown text-xs font-semibold truncate w-full text-center">{{ p.displayName }}</p>
            <div class="flex gap-0.5">
              <span v-for="n in totalRoundsToWin" :key="n"
                :class="n <= p.roundsWon ? 'bg-primary' : 'bg-brown/15'"
                class="w-2 h-2 rounded-full" />
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- ═══ FOOTER ═══ -->
    <div class="flex justify-center pb-8">
      <button @click="leaveGame"
        class="inline-flex items-center gap-2 text-xs text-brown/30 hover:text-red transition-colors cursor-pointer">
        <LogOut :stroke-width="1.5" class="w-4 h-4" />
        {{ t('game.active.leave') }}
      </button>
    </div>

    <!-- ═══ WIN ROUND MODAL ═══ -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="showWinModal"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-brown/60 backdrop-blur-sm"
        @click.self="showWinModal = false">
        <div class="bg-cream rounded-3xl p-6 w-full max-w-sm shadow-2xl">
          <div class="text-center mb-5">
            <div class="text-3xl mb-2">🌿</div>
            <h3 class="text-brown font-game text-2xl">{{ t('game.active.sauve') }}</h3>
            <p class="text-brown/50 text-sm mt-1">{{ t('game.active.winner_prompt') }}</p>
          </div>
          <div class="grid grid-cols-2 gap-2 mb-5">
            <button
              v-for="(p, i) in participants"
              :key="p.id"
              @click="selectedWinnerId = p.id"
              :class="selectedWinnerId === p.id
                ? 'ring-2 ring-primary bg-primary/10'
                : 'ring-1 ring-brown/15 bg-cream-dark'"
              class="flex items-center gap-2 px-3 py-3 rounded-2xl cursor-pointer transition-all hover:ring-2 hover:ring-primary/50"
            >
              <div
                class="w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-sm font-bold shrink-0"
                :class="avatarColors[i % 4]"
              >{{ p.displayName.charAt(0).toUpperCase() }}</div>
              <span class="text-brown text-sm font-semibold truncate">{{ p.displayName }}</span>
            </button>
          </div>
          <div class="flex gap-3">
            <button @click="showWinModal = false; selectedWinnerId = null"
              class="flex-1 py-3 rounded-xl border border-brown/20 text-brown/60 font-semibold text-sm hover:bg-brown/5 transition-colors cursor-pointer">
              {{ t('game.active.cancel') }}
            </button>
            <button
              @click="handleWinRound"
              :disabled="!selectedWinnerId || isDeclaringWin"
              class="flex-1 py-3 rounded-xl bg-primary text-cream font-bold text-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              <Loader2 v-if="isDeclaringWin" :stroke-width="2" class="w-4 h-4 animate-spin" />
              <Trophy v-else :stroke-width="2" class="w-4 h-4" />
              {{ t('game.active.confirm_win') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ═══ GAME FINISHED OVERLAY ═══ -->
    <Transition
      enter-active-class="transition-all duration-500 ease-out"
      enter-from-class="opacity-0 scale-90"
      enter-to-class="opacity-100 scale-100"
    >
      <div v-if="isFinished"
        class="fixed inset-0 z-50 flex items-center justify-center p-6 bg-brown/80 backdrop-blur-sm">
        <div class="bg-cream rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl">
          <div class="text-5xl mb-4">🏆</div>
          <h2 class="text-brown font-game mb-2">{{ t('game.active.game_over') }}</h2>
          <div class="flex flex-col gap-2 my-6">
            <div v-for="(p, i) in [...participants].sort((a, b) => b.roundsWon - a.roundsWon)"
              :key="p.id"
              :class="i === 0 ? 'bg-primary/15 ring-2 ring-primary' : 'bg-cream-dark'"
              class="flex items-center gap-3 px-4 py-3 rounded-2xl">
              <span class="text-lg">{{ i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉' }}</span>
              <div class="w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-sm font-bold"
                :class="avatarColors[participants.indexOf(p) % 4]">
                {{ p.displayName.charAt(0).toUpperCase() }}
              </div>
              <span class="text-brown font-semibold flex-1 text-left">{{ p.displayName }}</span>
              <span class="text-primary font-bold text-sm">{{ p.roundsWon }} manche{{ p.roundsWon > 1 ? 's' : '' }}</span>
            </div>
          </div>
          <button @click="leaveGame"
            class="w-full py-4 bg-brown text-cream rounded-full font-bold text-lg cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform">
            {{ t('game.active.finish') }}
          </button>
        </div>
      </div>
    </Transition>

  </div>
</template>
