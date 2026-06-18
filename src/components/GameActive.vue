<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGame } from '@/composables/useGame'
import { ChevronRight, Award, Leaf, LogOut, Loader2, Trophy } from 'lucide-vue-next'
import type { SpinResult } from '@/composables/useGame'
import deckImg      from '@/assets/img/deck_of_cards.svg'
import medalImg     from '@/assets/img/medal.svg'
import ladybugImg   from '@/assets/img/ladybug.svg'
import pesticideImg from '@/assets/img/pesticide.svg'
import logoSauveImg from '@/assets/logo_sauve.png'

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

const EFFECT_ICONS: Record<string, { icon: string, tooltip: string }> = {
  'protect_malus': { icon: '🛡️', tooltip: 'Protégé contre les malus' },
  'global_no_malus': { icon: '🚫', tooltip: 'Aucun malus pour personne' },
  'redirect_malus': { icon: '↩️', tooltip: 'Redirige le prochain malus' },
  'protect_decomposers': { icon: '🐛', tooltip: 'Décomposeurs protégés' },
  'protect_player': { icon: '🫂', tooltip: 'Immunisé contre les attaques' },
  'skip_turn': { icon: '⌛', tooltip: 'Passe son tour' },
  'neighbor_chooses_discard': { icon: '👉', tooltip: 'Le voisin choisit la défausse' },
  'hand_visible': { icon: '👁️', tooltip: 'Main visible' },
  'cannot_win': { icon: '🤐', tooltip: 'Ne peut pas gagner ce tour' },
}

function getPlayerEffects(participantId: number) {
  return game.session?.activeEffects?.filter(e => e.participantId === participantId) ?? []
}

/* ── wheel ── */
const wheelDeg    = ref(0)
const wheelMoving = ref(false)

// Rotation cible (mod 360) pour que le pointeur TOP pointe le bon secteur.
// Angle d'atterrissage = 360 - angle_centre_secteur_depuis_le_haut
const LANDING: Record<string, number> = {
  card:       252,  // Pioche (centre 108°)
  skip:       108,  // Passe ton tour (centre 252°)
  malus:      54,   // Malus (centre 306°)
  extra_spin: 18,   // Bonus (centre 342°)
}

/* ── spin phase ── */
type Phase = 'idle' | 'spinning' | 'result'
const phase      = ref<Phase>('idle')
const spinResult = ref<SpinResult | null>(null)
const isEndingTurn = ref(false)

// Sépare la description écologique de l'effet de jeu
function splitCardDesc(desc: string | null | undefined): { story: string; effect: string } {
  if (!desc) return { story: '', effect: '' }
  const idx = desc.indexOf('Effet :')
  if (idx === -1) return { story: desc, effect: '' }
  return { story: desc.slice(0, idx).trim(), effect: desc.slice(idx + 7).trim() }
}
const cardParts = computed(() => splitCardDesc(spinResult.value?.card?.description))

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

// Bloquer le scroll du body quand le podium est affiché
watch(isFinished, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
}, { immediate: true })

onUnmounted(() => { document.body.style.overflow = '' })
</script>

<template>
  <div class="min-h-screen bg-white flex flex-col">

    <!-- ═══ TOP BAR ═══ -->
    <div class="flex items-center justify-center px-4 py-3 bg-brown gap-2">
      <Leaf :stroke-width="1.5" class="w-5 h-5 text-primary" />
      <span class="font-game text-cream text-lg">{{ t('game.active.round', { n: roundNumber }) }}</span>
    </div>

    <!-- ═══ CONTENT ═══ -->
    <div class="flex-1 flex flex-col items-center px-4 py-6 gap-6 max-w-5xl mx-auto w-full">

      <!-- Error -->
      <div v-if="game.error" class="w-full px-4 py-3 bg-red/10 text-red rounded-xl text-sm">
        {{ game.error }}
      </div>

      <!-- ── SCORES ── -->
      <div class="w-full">
        <p class="text-brown/40 text-xs uppercase tracking-wider mb-2 text-center">{{ t('game.active.scores') }}</p>
        <div class="flex flex-wrap justify-center gap-3">
          <div v-for="(p, i) in participants" :key="p.id"
            :class="p.id === currentParticipant?.id ? 'ring-2 ring-primary bg-primary/5' : 'ring-1 ring-brown/10 bg-cream-dark'"
            class="rounded-2xl py-4 px-5 w-28 flex flex-col items-center gap-2 shadow-sm">

            <!-- Avatar avec emoji d'effet superposé -->
            <div class="relative w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-sm shrink-0"
              :class="avatarColors[i % 4]">
              {{ p.displayName.charAt(0).toUpperCase() }}
              <!-- Premier effet actif affiché EN GRAND sur l'avatar -->
              <span v-if="getPlayerEffects(p.id).length > 0"
                class="absolute inset-0 flex items-center justify-center text-lg rounded-full bg-black/30"
                :title="EFFECT_ICONS[getPlayerEffects(p.id)[0]?.effectCode ?? '']?.tooltip ?? 'Effet actif'">
                {{ EFFECT_ICONS[getPlayerEffects(p.id)[0]?.effectCode ?? '']?.icon ?? '✨' }}
              </span>
            </div>

            <p class="text-brown text-sm font-semibold truncate w-full text-center">{{ p.displayName }}</p>

            <!-- Libellé de l'effet sous le nom -->
            <p v-if="getPlayerEffects(p.id).length > 0"
              class="text-xs text-primary font-medium text-center leading-tight truncate w-full"
              :title="EFFECT_ICONS[getPlayerEffects(p.id)[0]?.effectCode ?? '']?.tooltip">
              {{ EFFECT_ICONS[getPlayerEffects(p.id)[0]?.effectCode ?? '']?.tooltip ?? 'Effet actif' }}
              <span class="text-brown/40">({{ getPlayerEffects(p.id)[0]?.turnsRemaining }}t)</span>
            </p>

            <div class="flex gap-0.5">
              <span v-for="n in totalRounds" :key="n"
                :class="n <= p.roundsWon ? 'bg-primary' : 'bg-brown/15'"
                class="w-2 h-2 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <!-- Current player -->
      <div class="text-center mt-2">
        <p class="text-brown/45 text-xs uppercase tracking-widest mb-2">{{ t('game.active.turn') }}</p>
        <div class="flex items-center justify-center gap-3">
          <div class="w-11 h-11 rounded-full flex items-center justify-center text-white text-lg font-bold"
            :class="avatarColors[(currentParticipant ? participants.indexOf(currentParticipant) : 0) % 4]">
            {{ currentParticipant?.displayName.charAt(0).toUpperCase() ?? '?' }}
          </div>
          <span class="text-brown text-2xl font-game">{{ currentParticipant?.displayName ?? '—' }}</span>
        </div>
      </div>

      <!-- ── ZONE JEU (Roue + Bouton) ── -->
      <div class="flex flex-col items-center justify-center gap-6 w-full mt-2 md:mt-6">
        
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
            <!-- Pioche (60% — de 0° à 216°) -->
            <path d="M 100 100 L 100 10 A 90 90 0 1 1 47.1 172.8 Z" fill="#bec059" />
            <!-- Passe ton tour (20% — de 216° à 288°) -->
            <path d="M 100 100 L 47.1 172.8 A 90 90 0 0 1 14.4 72.2 Z" fill="#38bdf8" />
            <!-- Malus (10% — de 288° à 324°) -->
            <path d="M 100 100 L 14.4 72.2 A 90 90 0 0 1 47.1 27.2 Z" fill="#e20000" />
            <!-- Bonus (10% — de 324° à 360°) -->
            <path d="M 100 100 L 47.1 27.2 A 90 90 0 0 1 100 10 Z" fill="#fadd83" />

            <!-- Séparateurs -->
            <line x1="100" y1="100" x2="100" y2="10" stroke="white" stroke-width="3" />
            <line x1="100" y1="100" x2="47.1" y2="172.8" stroke="white" stroke-width="3" />
            <line x1="100" y1="100" x2="14.4" y2="72.2" stroke="white" stroke-width="3" />
            <line x1="100" y1="100" x2="47.1" y2="27.2" stroke="white" stroke-width="3" />

            <!-- Labels -->
            <g transform="rotate(108, 100, 100)">
              <text x="100" y="38" text-anchor="middle" font-size="11" fill="white" font-weight="bold" font-family="sans-serif">Pioche</text>
              <text x="100" y="52" text-anchor="middle" font-size="9" fill="white" font-family="sans-serif">une carte</text>
            </g>
            <g transform="rotate(252, 100, 100)">
              <text x="100" y="38" text-anchor="middle" font-size="10" fill="white" font-weight="bold" font-family="sans-serif">Passe</text>
              <text x="100" y="50" text-anchor="middle" font-size="9" fill="white" font-family="sans-serif">ton tour</text>
            </g>
            <g transform="rotate(306, 100, 100)">
              <text x="100" y="45" text-anchor="middle" font-size="11" fill="white" font-weight="bold" font-family="sans-serif">Malus</text>
            </g>
            <g transform="rotate(342, 100, 100)">
              <text x="100" y="45" text-anchor="middle" font-size="11" fill="#623435" font-weight="bold" font-family="sans-serif">Bonus</text>
            </g>

            <!-- Centre pivot avec logo -->
            <circle cx="100" cy="100" r="18" fill="white" stroke="#623435" stroke-width="2.5" />
            <image :href="logoSauveImg" x="87" y="87" width="26" height="26" />
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

      <!-- Bouton SAUVE QUI POUSSE — prominent, sous la roue -->
      <button @click="showWinModal = true" :disabled="isFinished"
        class="flex items-center gap-3 px-8 py-4 bg-primary text-cream rounded-full font-bold text-lg cursor-pointer hover:scale-105 active:scale-95 transition-transform shadow-xl shadow-primary/30 disabled:opacity-40 disabled:cursor-not-allowed ring-4 ring-primary/20">
        <Award :stroke-width="2.5" class="w-6 h-6" />
        {{ t('game.active.sauve') }}
      </button>
      </div>

      <!-- ── RÉSULTAT (Popup) ── -->
      <Transition
        enter-active-class="transition-all duration-400 ease-out"
        enter-from-class="opacity-0 translate-y-4 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div v-if="phase === 'result'" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brown/80 backdrop-blur-sm">
          <div class="w-full max-w-sm rounded-3xl bg-cream shadow-2xl overflow-hidden">

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

          <!-- BONUS (extra_spin) -->
          <div v-else-if="spinResult.resultType === 'extra_spin'" class="bg-yellow/10 border-[3px] border-yellow/50 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <!-- Effet visuel de fond -->
            <div class="absolute -top-10 -right-10 w-40 h-40 bg-yellow/30 rounded-full blur-3xl"></div>
            
            <div class="flex flex-col items-center text-center mb-6 relative z-10">
              <div class="w-20 h-20 rounded-full bg-yellow/30 flex items-center justify-center mb-4 shadow-inner ring-4 ring-yellow/20 p-2">
                <img :src="ladybugImg" alt="Bonus" class="w-full h-full object-contain" />
              </div>
              <h3 class="text-brown font-game text-3xl leading-tight">{{ spinResult.card?.title ?? 'Bonus !' }}</h3>
            </div>
            
            <div v-if="spinResult.card" class="relative z-10 flex flex-col gap-3 mb-6">
              <!-- Contexte écologique -->
              <p v-if="cardParts.story" class="text-brown/70 text-sm italic text-center leading-relaxed">
                {{ cardParts.story }}
              </p>
              <!-- Effet de jeu -->
              <div v-if="cardParts.effect" class="bg-yellow/40 border-2 border-yellow/60 rounded-2xl px-4 py-3 text-center">
                <p class="text-xs font-bold text-brown/50 uppercase tracking-wide mb-1">⚡ Effet</p>
                <p class="text-brown font-bold text-base leading-snug">{{ cardParts.effect }}</p>
              </div>
            </div>
            
            <button @click="handleContinue" :disabled="isEndingTurn"
              class="relative z-10 w-full py-4 bg-brown text-cream rounded-full font-bold text-lg cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md">
              <Loader2 v-if="isEndingTurn" :stroke-width="2" class="w-6 h-6 animate-spin" />
              <ChevronRight v-else :stroke-width="2" class="w-6 h-6" />
              {{ t('game.active.end_turn') }}
            </button>
          </div>

          <!-- PASSE TON TOUR (skip) -->
          <div v-else-if="spinResult.resultType === 'skip'" class="bg-sky-400/10 border-2 border-sky-400/30 rounded-3xl p-5 shadow-md">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-12 h-12 rounded-full bg-sky-400/20 flex items-center justify-center text-2xl shrink-0">⌛</div>
              <div>
                <h3 class="text-brown font-game text-xl leading-tight">Passe ton tour</h3>
              </div>
            </div>
            <p class="text-brown/70 text-sm mb-5">Dommage, vous passez votre tour pour cette fois.</p>
            <button @click="handleContinue" :disabled="isEndingTurn"
              class="w-full py-3 bg-sky-500 text-white rounded-full font-bold cursor-pointer hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2">
              <Loader2 v-if="isEndingTurn" :stroke-width="2" class="w-5 h-5 animate-spin" />
              <ChevronRight v-else :stroke-width="2" class="w-5 h-5" />
              {{ t('game.active.end_turn') }}
            </button>
          </div>

          <!-- MALUS (malus) -->
          <div v-else class="bg-red/5 border-[3px] border-red/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <!-- Effet visuel de fond -->
            <div class="absolute -top-10 -right-10 w-40 h-40 bg-red/10 rounded-full blur-3xl"></div>
            
            <div class="flex flex-col items-center text-center mb-6 relative z-10">
              <div class="w-20 h-20 rounded-full bg-red/15 flex items-center justify-center mb-4 shadow-inner ring-4 ring-red/10 p-2">
                <img :src="pesticideImg" alt="Malus" class="w-full h-full object-contain" />
              </div>
              <h3 class="text-brown font-game text-3xl leading-tight">{{ spinResult.card?.title ?? 'Malus !' }}</h3>
            </div>
            
            <div v-if="spinResult.card" class="relative z-10 flex flex-col gap-3 mb-6">
              <p v-if="cardParts.story" class="text-brown/70 text-sm italic text-center leading-relaxed">
                {{ cardParts.story }}
              </p>
              <div v-if="cardParts.effect" class="bg-red/15 border-2 border-red/30 rounded-2xl px-4 py-3 text-center">
                <p class="text-xs font-bold text-red/60 uppercase tracking-wide mb-1">⚡ Effet</p>
                <p class="text-red font-bold text-base leading-snug">{{ cardParts.effect }}</p>
              </div>
            </div>
            
            <button @click="handleContinue" :disabled="isEndingTurn"
              class="relative z-10 w-full py-4 bg-red text-white rounded-full font-bold text-lg cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md">
              <Loader2 v-if="isEndingTurn" :stroke-width="2" class="w-6 h-6 animate-spin" />
              <ChevronRight v-else :stroke-width="2" class="w-6 h-6" />
              {{ t('game.active.end_turn') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

      <!-- Scores moved to the top -->

    </div>

    <!-- ═══ LEAVE ═══ -->
    <div class="flex justify-center pb-24 lg:pb-8 pt-2">
      <button @click="leaveGame"
        class="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-red/30 text-red/60 hover:bg-red/8 hover:border-red/60 hover:text-red font-semibold text-sm transition-all cursor-pointer">
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
