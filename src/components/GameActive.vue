<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGame } from '@/composables/useGame'
import { ChevronRight, Award, Leaf, LogOut, Loader2 } from 'lucide-vue-next'
import type { SpinResult } from '@/composables/useGame'
import deckImg   from '@/assets/img/deck_of_cards.svg'
import medalImg  from '@/assets/img/medal.svg'

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

/* ── wheel ── */
const wheelDeg    = ref(0)
const wheelMoving = ref(false)

// Rotation cible (mod 360) pour que le pointeur TOP (270° SVG) pointe le bon secteur.
// Centres SVG (0°=right, CW): Pioche=0°, Bonus=135°, Malus=225°
// Rotation = 270° - centre_secteur  (mod 360)
const LANDING: Record<string, number> = {
  card:       270,  // Pioche  (centre 0°)   → 270-0   = 270
  extra_spin: 135,  // Bonus   (centre 135°) → 270-135 = 135
  skip:       45,   // Malus   (centre 225°) → 270-225 = 45
}

/* ── spin phase ── */
type Phase = 'idle' | 'spinning' | 'result'
const phase      = ref<Phase>('idle')
const spinResult = ref<SpinResult | null>(null)
const isEndingTurn = ref(false)

async function handleSpin() {
  if (!currentParticipant.value || phase.value !== 'idle') return
  phase.value       = 'spinning'
  wheelMoving.value = true

  // Appel API
  const result = await spin(currentParticipant.value.id)

  // Calcul de l'angle d'atterrissage selon le résultat
  const landing    = LANDING[result?.resultType ?? 'card'] ?? 90
  const currentMod = wheelDeg.value % 360
  const diff       = (landing - currentMod + 360) % 360
  wheelDeg.value   = wheelDeg.value + 5 * 360 + diff

  // Attendre la fin de la transition CSS (3.2s)
  await new Promise<void>(r => setTimeout(r, 3300))
  wheelMoving.value = false

  // Toujours afficher un panneau résultat — jamais d'auto end-turn
  spinResult.value = result
  phase.value      = 'result'
}

async function handleContinue() {
  spinResult.value   = null
  phase.value        = 'idle'
  isEndingTurn.value = true
  await endTurn()
  isEndingTurn.value = false
}

/* ── win modal ── */
const showWinModal     = ref(false)
const selectedWinnerId = ref<number | null>(null)
const isDeclaringWin   = ref(false)

async function handleWinRound() {
  if (!selectedWinnerId.value) return
  isDeclaringWin.value = true
  await winRound(selectedWinnerId.value)
  showWinModal.value     = false
  selectedWinnerId.value = null
  phase.value            = 'idle'
  isDeclaringWin.value   = false
}

/* ── misc ── */
const roundNumber  = computed(() => currentRound.value?.roundNumber ?? 1)
const totalRounds  = 3  // la partie se finit après 3 manches jouées
const avatarColors     = ['bg-primary', 'bg-amber-400', 'bg-sky-400', 'bg-pink-400']

const sortedParticipants = computed(() =>
  [...participants.value].sort((a, b) => b.roundsWon - a.roundsWon)
)
const winner = computed(() => sortedParticipants.value[0] ?? null)

</script>

<template>
  <div class="min-h-screen bg-cream flex flex-col">

    <!-- ═══ TOP BAR ═══ -->
    <div class="flex items-center justify-between px-4 py-3 bg-brown">
      <div class="flex items-center gap-2">
        <Leaf :stroke-width="1.5" class="w-5 h-5 text-primary" />
        <span class="font-game text-cream text-lg">{{ t('game.active.round', { n: roundNumber }) }}</span>
      </div>
      <button @click="showWinModal = true" :disabled="isFinished"
        class="flex items-center gap-2 px-4 py-2 bg-primary text-cream rounded-full font-bold text-sm cursor-pointer hover:scale-105 active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed">
        <Award :stroke-width="2" class="w-4 h-4" />
        {{ t('game.active.sauve') }}
      </button>
    </div>

    <!-- ═══ CONTENT ═══ -->
    <div class="flex-1 flex flex-col items-center px-4 py-6 gap-6 max-w-lg mx-auto w-full">

      <!-- Error -->
      <div v-if="game.error" class="w-full px-4 py-3 bg-red/10 text-red rounded-xl text-sm">
        {{ game.error }}
      </div>

      <!-- Current player -->
      <div class="text-center">
        <p class="text-brown/45 text-xs uppercase tracking-widest mb-2">{{ t('game.active.turn') }}</p>
        <div class="flex items-center justify-center gap-3">
          <div class="w-11 h-11 rounded-full flex items-center justify-center text-white text-lg font-bold"
            :class="avatarColors[(currentParticipant ? participants.indexOf(currentParticipant) : 0) % 4]">
            {{ currentParticipant?.displayName.charAt(0).toUpperCase() ?? '?' }}
          </div>
          <span class="text-brown text-2xl font-game">{{ currentParticipant?.displayName ?? '—' }}</span>
        </div>
      </div>

      <!-- ── ROUE ── -->
      <div class="relative w-64 h-64 sm:w-72 sm:h-72 select-none">

        <!-- Pointeur fixe (haut) -->
        <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-20">
          <svg width="20" height="20" viewBox="0 0 20 20">
            <polygon points="10,18 2,2 18,2" fill="#623435" />
          </svg>
        </div>

        <!-- Roue SVG rotative -->
        <div
          class="w-full h-full rounded-full overflow-hidden shadow-xl"
          :style="{
            transform: `rotate(${wheelDeg}deg)`,
            transition: wheelMoving ? 'transform 3.2s cubic-bezier(0.1, 0.85, 0.2, 1)' : 'none'
          }"
        >
          <svg viewBox="0 0 200 200" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <!-- Piocher (50% — de 12h à 6h par la droite) -->
            <path d="M 100 100 L 100 10 A 90 90 0 0 1 100 190 Z" fill="#bec059" />
            <!-- Bonus (25% — de 6h à 9h) -->
            <path d="M 100 100 L 100 190 A 90 90 0 0 1 10 100 Z" fill="#fadd83" />
            <!-- Malus (25% — de 9h à 12h) -->
            <path d="M 100 100 L 10 100 A 90 90 0 0 1 100 10 Z" fill="#e20000" />

            <!-- Séparateurs -->
            <line x1="100" y1="100" x2="100" y2="10"  stroke="white" stroke-width="3" />
            <line x1="100" y1="100" x2="100" y2="190" stroke="white" stroke-width="3" />
            <line x1="100" y1="100" x2="10"  y2="100" stroke="white" stroke-width="3" />

            <!-- Labels -->
            <text x="150" y="95" text-anchor="middle" font-size="11" fill="white" font-weight="bold" font-family="sans-serif">Pioche</text>
            <text x="150" y="108" text-anchor="middle" font-size="9" fill="white" font-family="sans-serif">une carte</text>

            <text x="63" y="132" text-anchor="middle" font-size="11" fill="#623435" font-weight="bold" font-family="sans-serif">BONUS</text>
            <text x="63" y="68"  text-anchor="middle" font-size="11" fill="white"   font-weight="bold" font-family="sans-serif">MALUS</text>

            <!-- Centre pivot -->
            <circle cx="100" cy="100" r="14" fill="white" stroke="#623435" stroke-width="2.5" />
          </svg>
        </div>
      </div>

      <!-- Bouton TOURNER -->
      <button
        @click="handleSpin"
        :disabled="phase !== 'idle' || isFinished || isEndingTurn"
        class="flex items-center gap-3 px-10 py-4 bg-brown text-cream rounded-full font-bold text-base cursor-pointer hover:scale-105 active:scale-95 transition-transform shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
      >
        <Loader2 v-if="phase === 'spinning'" :stroke-width="2" class="w-5 h-5 animate-spin" />
        <span>{{ phase === 'spinning' ? '…' : t('game.active.spin') }}</span>
      </button>

      <!-- ── RÉSULTAT ── -->
      <Transition
        enter-active-class="transition-all duration-400 ease-out"
        enter-from-class="opacity-0 translate-y-4 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div v-if="phase === 'result'" class="w-full">

          <!-- ERREUR — l'API a échoué -->
          <div v-if="!spinResult" class="bg-red/10 rounded-3xl p-6 text-center">
            <p class="text-red text-sm mb-4">{{ game.error ?? 'Une erreur est survenue lors du spin.' }}</p>
            <button @click="handleContinue" :disabled="isEndingTurn"
              class="px-8 py-3 bg-brown text-cream rounded-full font-bold cursor-pointer hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 flex items-center gap-2 mx-auto">
              <Loader2 v-if="isEndingTurn" :stroke-width="2" class="w-5 h-5 animate-spin" />
              <ChevronRight v-else :stroke-width="2" class="w-5 h-5" />
              {{ t('game.active.end_turn') }}
            </button>
          </div>

          <!-- PIOCHE (card) — piocher dans la pioche physique -->
          <div v-else-if="spinResult.resultType === 'card'" class="bg-cream-dark rounded-3xl p-6 text-center shadow-md">
            <img :src="deckImg" alt="Pioche" class="w-32 h-32 mx-auto mb-4 object-contain" />
            <h3 class="text-brown font-game text-2xl mb-2">Piochez une carte !</h3>
            <p class="text-brown/55 text-sm mb-6 leading-relaxed">Prenez la première carte de la pioche physique et appliquez son effet.</p>
            <button @click="handleContinue" :disabled="isEndingTurn"
              class="px-8 py-3 bg-brown text-cream rounded-full font-bold cursor-pointer hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 flex items-center gap-2 mx-auto">
              <Loader2 v-if="isEndingTurn" :stroke-width="2" class="w-5 h-5 animate-spin" />
              <ChevronRight v-else :stroke-width="2" class="w-5 h-5" />
              {{ t('game.active.end_turn') }}
            </button>
          </div>

          <!-- BONUS (extra_spin) — à implémenter avec la DB -->
          <div v-else-if="spinResult.resultType === 'extra_spin'" class="bg-yellow/40 rounded-3xl p-6 text-center">
            <div class="text-4xl mb-2">⭐</div>
            <h3 class="text-brown font-game text-2xl mb-2">BONUS</h3>
            <p class="text-brown/55 text-sm mb-6">Appliquez l'effet bonus.</p>
            <button @click="handleContinue" :disabled="isEndingTurn"
              class="px-8 py-3 bg-brown text-cream rounded-full font-bold cursor-pointer hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 flex items-center gap-2 mx-auto">
              <Loader2 v-if="isEndingTurn" :stroke-width="2" class="w-5 h-5 animate-spin" />
              <ChevronRight v-else :stroke-width="2" class="w-5 h-5" />
              {{ t('game.active.end_turn') }}
            </button>
          </div>

          <!-- MALUS (skip) — à implémenter avec la DB -->
          <div v-else class="bg-red/10 rounded-3xl p-6 text-center">
            <div class="text-4xl mb-2">💀</div>
            <h3 class="text-red font-game text-2xl mb-2">MALUS</h3>
            <p class="text-red/55 text-sm mb-6">Appliquez l'effet malus.</p>
            <button @click="handleContinue" :disabled="isEndingTurn"
              class="px-8 py-3 bg-red text-white rounded-full font-bold cursor-pointer hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 flex items-center gap-2 mx-auto">
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
          <div v-for="(p, i) in participants" :key="p.id"
            :class="p.id === currentParticipant?.id ? 'ring-2 ring-primary' : 'ring-1 ring-brown/10'"
            class="bg-cream-dark rounded-2xl py-3 px-3 flex flex-col items-center gap-1">
            <div class="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
              :class="avatarColors[i % 4]">
              {{ p.displayName.charAt(0).toUpperCase() }}
            </div>
            <p class="text-brown text-xs font-semibold truncate w-full text-center">{{ p.displayName }}</p>
            <div class="flex gap-0.5">
              <span v-for="n in totalRounds" :key="n"
                :class="n <= p.roundsWon ? 'bg-primary' : 'bg-brown/15'"
                class="w-2 h-2 rounded-full" />
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- ═══ LEAVE ═══ -->
    <div class="flex justify-center pb-8">
      <button @click="leaveGame"
        class="flex items-center gap-2 text-xs text-brown/30 hover:text-red transition-colors cursor-pointer">
        <LogOut :stroke-width="1.5" class="w-4 h-4" />
        {{ t('game.active.leave') }}
      </button>
    </div>

    <!-- ═══ MODAL SAUVE QUI POUSSE ═══ -->
    <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-all duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="showWinModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-brown/60 backdrop-blur-sm" @click.self="showWinModal = false">
        <div class="bg-cream rounded-3xl p-6 w-full max-w-sm shadow-2xl">
          <div class="text-center mb-5">
            <div class="text-3xl mb-2">🌿</div>
            <h3 class="text-brown font-game text-2xl">{{ t('game.active.sauve') }}</h3>
            <p class="text-brown/50 text-sm mt-1">{{ t('game.active.winner_prompt') }}</p>
          </div>
          <div class="grid grid-cols-2 gap-2 mb-5">
            <button v-for="(p, i) in participants" :key="p.id" @click="selectedWinnerId = p.id"
              :class="selectedWinnerId === p.id ? 'ring-2 ring-primary bg-primary/10' : 'ring-1 ring-brown/15 bg-cream-dark'"
              class="flex items-center gap-2 px-3 py-3 rounded-2xl cursor-pointer transition-all hover:ring-2 hover:ring-primary/50">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                :class="avatarColors[i % 4]">
                {{ p.displayName.charAt(0).toUpperCase() }}
              </div>
              <span class="text-brown text-sm font-semibold truncate">{{ p.displayName }}</span>
            </button>
          </div>
          <div class="flex gap-3">
            <button @click="showWinModal = false; selectedWinnerId = null"
              class="flex-1 py-3 rounded-xl border border-brown/20 text-brown/60 font-semibold text-sm hover:bg-brown/5 transition-colors cursor-pointer">
              {{ t('game.active.cancel') }}
            </button>
            <button @click="handleWinRound" :disabled="!selectedWinnerId || isDeclaringWin"
              class="flex-1 py-3 rounded-xl bg-primary text-cream font-bold text-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              <Loader2 v-if="isDeclaringWin" :stroke-width="2" class="w-4 h-4 animate-spin" />
              <Trophy v-else :stroke-width="2" class="w-4 h-4" />
              {{ t('game.active.confirm_win') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ═══ PAGE GAGNANT (plein écran) ═══ -->
    <Transition
      enter-active-class="transition-all duration-700 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
    >
      <div v-if="isFinished" class="fixed inset-0 z-50 bg-brown overflow-y-auto">
        <div class="min-h-full flex flex-col items-center justify-center px-6 py-12 gap-8">

          <!-- Médaille -->
          <img :src="medalImg" alt="Médaille" class="w-36 sm:w-48 drop-shadow-2xl" />

          <!-- Titre -->
          <div class="text-center">
            <p class="text-primary font-semibold text-sm uppercase tracking-widest mb-2">Partie terminée</p>
            <h1 class="font-game text-cream text-5xl sm:text-7xl leading-tight">
              {{ winner?.displayName }}
            </h1>
            <p class="text-cream/60 mt-2 text-lg">a remporté la partie ! 🎉</p>
          </div>

          <!-- Podium -->
          <div class="w-full max-w-sm flex flex-col gap-2">
            <div
              v-for="(p, i) in sortedParticipants" :key="p.id"
              class="flex items-center gap-4 px-5 py-4 rounded-2xl"
              :class="i === 0 ? 'bg-primary text-cream' : 'bg-white/10 text-cream/80'"
            >
              <span class="text-2xl w-8 text-center shrink-0">
                {{ i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉' }}
              </span>
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                :class="avatarColors[participants.indexOf(p) % 4]"
              >
                {{ p.displayName.charAt(0).toUpperCase() }}
              </div>
              <span class="font-semibold flex-1">{{ p.displayName }}</span>
              <span class="font-bold text-sm">
                {{ p.roundsWon }} manche{{ p.roundsWon > 1 ? 's' : '' }}
              </span>
            </div>
          </div>

          <!-- Bouton -->
          <button
            @click="leaveGame"
            class="px-12 py-4 bg-primary text-cream rounded-full font-bold text-lg cursor-pointer hover:scale-105 active:scale-95 transition-transform shadow-xl shadow-primary/30"
          >
            Terminer la partie
          </button>

        </div>
      </div>
    </Transition>

  </div>
</template>
