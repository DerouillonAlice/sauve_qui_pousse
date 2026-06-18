<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGame } from '@/composables/useGame'
import { useAuth } from '@/composables/useAuth'
import { ChevronRight, Award, Leaf, LogOut, Loader2, Trophy } from 'lucide-vue-next'
import WaveEdge from '@/components/WaveEdge.vue'
import type { SpinResult } from '@/composables/useGame'
import deckImg          from '@/assets/img/deck_of_cards.svg'
import medalImg         from '@/assets/img/medal.svg'
import beeLadybugImg    from '@/assets/img/bee_ladybug.svg'
import hornet1Img       from '@/assets/img/hornet_1.svg'
import branchBee1Img    from '@/assets/img/branch_bee_1.svg'
import branchLadybug2Img from '@/assets/img/branch_ladybug_2.svg'

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

// 20 secteurs (18°/secteur). Pattern: P,P,M,P,B répété x4 → 12 Pioche, 4 Malus, 4 Bonus
// Secteur i centré à SVG (270 + i*18)°. LANDING = (270 - centre + 360) % 360
const LANDING: Record<string, number> = {
  card:       180,  // Pioche  secteur 10, centre SVG 90°
  extra_spin: 108,  // Bonus   secteur 14, centre SVG 162°
  skip:       234,  // Malus   secteur 7,  centre SVG 36°
}

const WHEEL_PATTERN = ['pioche','pioche','malus','pioche','bonus','pioche','pioche','malus','pioche','bonus','pioche','pioche','malus','pioche','bonus','pioche','pioche','malus','pioche','bonus'] as const

const wheelSectors = computed(() => {
  const toRad = (d: number) => d * Math.PI / 180
  const cx = 100, cy = 100, r = 90
  return WHEEL_PATTERN.map((type, i) => {
    const centerDeg = (270 + i * 18) % 360
    const startDeg  = (centerDeg - 9 + 360) % 360
    const endDeg    = (centerDeg + 9) % 360
    const x1 = cx + r * Math.cos(toRad(startDeg))
    const y1 = cy + r * Math.sin(toRad(startDeg))
    const x2 = cx + r * Math.cos(toRad(endDeg))
    const y2 = cy + r * Math.sin(toRad(endDeg))
    const path = `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`
    const color = type === 'bonus' ? '#4a6020' : type === 'malus' ? '#c73c18' : i % 2 === 0 ? '#bec059' : '#8fa83c'
    const label = type === 'pioche' ? 'PIOCHE' : type === 'bonus' ? 'BONUS' : 'MALUS'
    return { i, centerDeg, path, color, label }
  })
})

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
const { state: auth } = useAuth()
const isOwner      = computed(() => game.session?.ownerId === auth.user?.id)
const roundNumber  = computed(() => currentRound.value?.roundNumber ?? 1)
const totalRounds  = 3  // la partie se finit après 3 manches jouées
const avatarColors = ['bg-primary', 'bg-amber-400', 'bg-sky-400', 'bg-pink-400']

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
  <div class="min-h-screen bg-cream flex flex-col">

    <!-- ═══ HERO PRIMARY — Doodles + Barre + Roue ═══ -->
    <section class="relative overflow-hidden bg-primary pb-10">

      <!-- Doodles absolus -->
      <img :src="beeLadybugImg"    aria-hidden="true" class="absolute top-0 left-0 w-24 sm:w-36 pointer-events-none select-none" />
      <img :src="hornet1Img"       aria-hidden="true" class="absolute top-0 right-0 w-20 sm:w-28 pointer-events-none select-none" />
      <img :src="branchBee1Img"    aria-hidden="true" class="absolute bottom-0 left-0 w-32 sm:w-44 pointer-events-none select-none" />
      <img :src="branchLadybug2Img" aria-hidden="true" class="absolute bottom-0 right-0 w-32 sm:w-44 pointer-events-none select-none" />

      <!-- Barre info -->
      <div class="relative z-10 flex items-center justify-between px-4 pt-3 pb-4">
        <div class="flex items-center gap-2">
          <Leaf :stroke-width="1.5" class="w-5 h-5 text-cream/70" />
          <span class="font-game text-cream text-lg">{{ t('game.active.round', { n: roundNumber }) }}</span>
        </div>
        <button @click="showWinModal = true" :disabled="isFinished"
          class="flex items-center gap-2 px-5 py-2.5 bg-cream text-primary rounded-full font-bold text-sm cursor-pointer hover:scale-105 active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-black/20 ring-2 ring-cream/30">
          <Award :stroke-width="2.5" class="w-4 h-4" />
          {{ t('game.active.sauve') }}
        </button>
      </div>

      <!-- Joueur actuel -->
      <div class="relative z-10 text-center mb-4">
        <p class="text-cream/50 text-xs uppercase tracking-widest mb-2">{{ t('game.active.turn') }}</p>
        <div class="flex items-center justify-center gap-3">
          <div class="w-11 h-11 rounded-full flex items-center justify-center text-white text-lg font-bold ring-2 ring-cream/30"
            :class="avatarColors[(currentParticipant ? participants.indexOf(currentParticipant) : 0) % 4]">
            {{ currentParticipant?.displayName.charAt(0).toUpperCase() ?? '?' }}
          </div>
          <span class="text-cream text-2xl font-game">{{ currentParticipant?.displayName ?? '—' }}</span>
        </div>
      </div>

      <!-- ── ROUE (hôte uniquement) ── -->
      <template v-if="isOwner">
        <div class="relative z-10 w-56 h-56 sm:w-64 sm:h-64 mx-auto select-none">
          <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-20">
            <svg width="20" height="20" viewBox="0 0 20 20">
              <polygon points="10,18 2,2 18,2" fill="white" />
            </svg>
          </div>
          <div class="w-full h-full rounded-full overflow-hidden shadow-2xl shadow-black/30"
            :style="{
              transform: `rotate(${wheelDeg}deg)`,
              transition: wheelMoving ? 'transform 3.2s cubic-bezier(0.1, 0.85, 0.2, 1)' : 'none'
            }">
            <svg viewBox="0 0 200 200" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <path v-for="s in wheelSectors" :key="s.i"
                :d="s.path" :fill="s.color"
                stroke="rgba(255,255,255,0.35)" stroke-width="0.6" />
              <text v-for="s in wheelSectors" :key="'t'+s.i"
                :transform="`translate(100,100) rotate(${s.centerDeg}) translate(27,0)`"
                text-anchor="start" dominant-baseline="central"
                font-size="5.5" font-weight="bold" fill="white" font-family="sans-serif"
                style="letter-spacing:0.4px">{{ s.label }}</text>
              <circle cx="100" cy="100" r="15" fill="white" stroke="#623435" stroke-width="2.5" />
              <path d="M100 109 C100 109 92 102 92 95 C92 88 96 83 100 82 C104 83 108 88 108 95 C108 102 100 109 100 109Z" fill="#4a6020" />
            </svg>
          </div>
        </div>
        <div class="relative z-10 flex justify-center mt-6">
          <button @click="handleSpin"
            :disabled="phase !== 'idle' || isFinished || isEndingTurn"
            class="flex items-center gap-3 px-10 py-4 bg-cream text-brown rounded-full font-bold text-base cursor-pointer hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-black/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100">
            <Loader2 v-if="phase === 'spinning'" :stroke-width="2" class="w-5 h-5 animate-spin" />
            <span>{{ phase === 'spinning' ? '…' : t('game.active.spin') }}</span>
          </button>
        </div>
      </template>

      <!-- Vue non-hôte : juste "Sauve qui pousse!" -->
      <template v-else>
        <div class="relative z-10 flex flex-col items-center gap-4 mt-4 px-6">
          <p class="text-cream/60 text-sm text-center leading-relaxed">
            La partie est en cours sur la tablette de l'hôte.
          </p>
          <button @click="showWinModal = true" :disabled="isFinished"
            class="px-10 py-5 bg-cream text-brown rounded-full font-bold text-xl cursor-pointer hover:scale-105 active:scale-95 transition-transform shadow-xl shadow-black/25 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-3">
            <Award :stroke-width="2" class="w-6 h-6" />
            {{ t('game.active.sauve') }}
          </button>
        </div>
      </template>

    </section>

    <!-- Vague de transition primary → cream -->
    <WaveEdge color="var(--color-primary)" :size="56" />

    <!-- ═══ SECTION CREAM — Résultat + Scores ═══ -->
    <div class="flex-1 flex flex-col items-center px-4 pb-6 gap-6 max-w-lg mx-auto w-full">

      <!-- Error -->
      <div v-if="game.error" class="w-full px-4 py-3 bg-red/10 text-red rounded-xl text-sm mt-4">
        {{ game.error }}
      </div>

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

          <!-- BONUS (extra_spin) -->
          <div v-else-if="spinResult.resultType === 'extra_spin'" class="bg-yellow/20 border-2 border-yellow/60 rounded-3xl p-5 shadow-md">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-12 h-12 rounded-full bg-yellow/50 flex items-center justify-center text-2xl shrink-0">⭐</div>
              <div>
                <p class="text-xs text-brown/40 uppercase tracking-wider font-semibold">Bonus</p>
                <h3 class="text-brown font-game text-xl leading-tight">{{ spinResult.card?.title ?? 'Bonus !' }}</h3>
              </div>
            </div>
            <p v-if="spinResult.card?.description" class="text-brown/70 text-sm leading-relaxed bg-yellow/30 rounded-2xl px-4 py-3 mb-5">
              {{ spinResult.card.description }}
            </p>
            <p v-else class="text-brown/55 text-sm mb-5">Appliquez l'effet bonus.</p>
            <button @click="handleContinue" :disabled="isEndingTurn"
              class="w-full py-3 bg-brown text-cream rounded-full font-bold cursor-pointer hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2">
              <Loader2 v-if="isEndingTurn" :stroke-width="2" class="w-5 h-5 animate-spin" />
              <ChevronRight v-else :stroke-width="2" class="w-5 h-5" />
              {{ t('game.active.end_turn') }}
            </button>
          </div>

          <!-- MALUS (skip) -->
          <div v-else class="bg-red/8 border-2 border-red/25 rounded-3xl p-5 shadow-md">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-12 h-12 rounded-full bg-red/15 flex items-center justify-center text-2xl shrink-0">💀</div>
              <div>
                <p class="text-xs text-red/60 uppercase tracking-wider font-semibold">Malus</p>
                <h3 class="text-brown font-game text-xl leading-tight">{{ spinResult.card?.title ?? 'Malus !' }}</h3>
              </div>
            </div>
            <p v-if="spinResult.card?.description" class="text-brown/70 text-sm leading-relaxed bg-red/10 rounded-2xl px-4 py-3 mb-5">
              {{ spinResult.card.description }}
            </p>
            <p v-else class="text-red/55 text-sm mb-5">Appliquez l'effet malus.</p>
            <button @click="handleContinue" :disabled="isEndingTurn"
              class="w-full py-3 bg-red text-white rounded-full font-bold cursor-pointer hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2">
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
