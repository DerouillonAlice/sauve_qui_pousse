<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGame } from '@/composables/useGame'
import { ChevronRight, Leaf, LogOut, Loader2, Trophy } from 'lucide-vue-next'
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

const EFFECT_META: Record<string, { icon: string; label: string; desc: string; ring: string; badge: string }> = {
  'protect_malus':           { icon: '🛡️', label: 'Protégé malus',      desc: 'Les cartes malus ne s\'appliquent pas à ce joueur pendant cet effet.',            ring: 'ring-primary ring-offset-2',   badge: 'bg-primary/20 text-primary' },
  'protect_player':          { icon: '🛡️', label: 'Immunisé',           desc: 'Ce joueur est immunisé contre toutes les attaques des autres joueurs.',            ring: 'ring-primary ring-offset-2',   badge: 'bg-primary/20 text-primary' },
  'global_no_malus':         { icon: '🚫', label: 'Aucun malus',         desc: 'Personne ne peut recevoir de malus tant que cet effet est actif.',                  ring: 'ring-primary ring-offset-2',   badge: 'bg-primary/20 text-primary' },
  'protect_decomposers':     { icon: '🌿', label: 'Décomposeurs OK',     desc: 'Les cartes décomposeurs de ce joueur sont protégées contre la défausse forcée.',   ring: 'ring-primary ring-offset-2',   badge: 'bg-primary/20 text-primary' },
  'redirect_malus':          { icon: '↩️', label: 'Redirige malus',      desc: 'Le prochain malus reçu est automatiquement renvoyé vers un adversaire.',           ring: 'ring-amber-400 ring-offset-2', badge: 'bg-amber-100 text-amber-700' },
  'skip_turn':               { icon: '⌛', label: 'Passe son tour',      desc: 'Ce joueur passe son tour sans pouvoir jouer.',                                      ring: 'ring-red ring-offset-2',       badge: 'bg-red/15 text-red' },
  'neighbor_chooses_discard':{ icon: '👉', label: 'Voisin choisit',      desc: 'Le voisin de gauche choisit quelle carte ce joueur doit défausser.',               ring: 'ring-red ring-offset-2',       badge: 'bg-red/15 text-red' },
  'hand_visible':            { icon: '👁️', label: 'Main visible',        desc: 'Toutes les cartes de ce joueur sont visibles par les autres joueurs.',              ring: 'ring-amber-400 ring-offset-2', badge: 'bg-amber-100 text-amber-700' },
  'cannot_win':              { icon: '🤐', label: 'Bloqué',              desc: 'Ce joueur ne peut pas crier "Sauve qui pousse !" pendant cet effet.',               ring: 'ring-red ring-offset-2',       badge: 'bg-red/15 text-red' },
}

function getPlayerEffects(participantId: number) {
  return game.session?.activeEffects?.filter(e => e.participantId === participantId) ?? []
}
function effectMeta(code: string) {
  return EFFECT_META[code] ?? { icon: '✨', label: 'Effet actif', desc: '', ring: 'ring-primary ring-offset-2', badge: 'bg-primary/20 text-primary' }
}

/* ── wheel ── */
const wheelDeg    = ref(0)
const wheelMoving = ref(false)

// Rotation cible (mod 360) pour que le pointeur TOP pointe le bon secteur.
// Angle d'atterrissage = 360 - angle_centre_secteur_depuis_le_haut
const LANDING: Record<string, number> = {
  card:       315,  // Pioche   (centre ~45°  dans le SVG)
  skip:       207,  // Passe    (centre ~153° dans le SVG)
  malus:       80,  // Malus    (centre ~280° dans le SVG)
  extra_spin: 334,  // Bonus    (centre ~26°  dans le SVG)
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
    <div class="flex items-center justify-between px-4 py-5 bg-brown">
      <div class="flex items-center gap-2 min-w-[80px]">
        <Leaf :stroke-width="1.5" class="w-5 h-5 text-primary" />
        <span class="font-game text-cream text-lg">{{ t('game.active.round', { n: roundNumber }) }}</span>
      </div>
      <button @click="showWinModal = true" :disabled="isFinished"
        class="flex items-center gap-2 px-5 py-2.5 bg-primary text-cream rounded-full font-bold text-sm cursor-pointer hover:scale-105 active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed">
        <img :src="ladybugImg" class="w-5 h-5 object-contain" aria-hidden="true" />
        {{ t('game.active.sauve') }}
      </button>
      <div class="min-w-[80px] flex justify-end">
        <button @click="leaveGame"
          class="flex items-center gap-1.5 text-cream/50 hover:text-red transition-colors cursor-pointer text-sm">
          <LogOut :stroke-width="1.5" class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- ═══ CONTENT ═══ -->
    <div class="flex-1 flex flex-col items-center px-4 py-3 gap-3 max-w-5xl mx-auto w-full">

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
            class="rounded-2xl py-4 px-5 w-28 flex flex-col items-center gap-2 shadow-sm relative group">

            <!-- Avatar avec anneau coloré si effet actif -->
            <div class="relative w-14 h-14 shrink-0">
              <div class="w-full h-full rounded-full flex items-center justify-center text-white text-xl font-bold shadow-sm transition-all"
                :class="[
                  avatarColors[i % 4],
                  !spinResult && getPlayerEffects(p.id).length > 0 ? 'ring-4 ' + effectMeta(getPlayerEffects(p.id)[0]?.effectCode ?? '').ring : ''
                ]">
                {{ p.displayName.charAt(0).toUpperCase() }}
              </div>
              <!-- Badge coin haut-droite -->
              <span v-if="!spinResult && getPlayerEffects(p.id).length > 0"
                class="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center text-sm leading-none">
                {{ effectMeta(getPlayerEffects(p.id)[0]?.effectCode ?? '').icon }}
              </span>
            </div>

            <p class="text-brown text-sm font-semibold truncate w-full text-center">{{ p.displayName }}</p>

            <!-- Badge effet visible -->
            <div v-if="!spinResult && getPlayerEffects(p.id).length > 0"
              class="rounded-full px-2 py-0.5 text-xs font-bold text-center w-full truncate"
              :class="effectMeta(getPlayerEffects(p.id)[0]?.effectCode ?? '').badge">
              {{ effectMeta(getPlayerEffects(p.id)[0]?.effectCode ?? '').label }}
              <span class="font-normal opacity-60">&nbsp;{{ getPlayerEffects(p.id)[0]?.turnsRemaining }}t</span>
            </div>

            <div class="flex gap-0.5">
              <span v-for="n in totalRounds" :key="n"
                :class="n <= p.roundsWon ? 'bg-primary' : 'bg-brown/15'"
                class="w-2 h-2 rounded-full" />
            </div>

            <!-- Tooltip effet au hover -->
            <div v-if="!spinResult && getPlayerEffects(p.id).length > 0"
              class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-xl px-3 py-3 shadow-xl z-30 bg-brown text-cream
                     opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150">
              <p class="font-bold text-sm mb-1">
                {{ effectMeta(getPlayerEffects(p.id)[0]?.effectCode ?? '').icon }}
                {{ effectMeta(getPlayerEffects(p.id)[0]?.effectCode ?? '').label }}
              </p>
              <p class="text-xs text-cream/80 leading-snug mb-2">
                {{ effectMeta(getPlayerEffects(p.id)[0]?.effectCode ?? '').desc }}
              </p>
              <p v-for="e in getPlayerEffects(p.id)" :key="e.effectCode ?? ''" class="text-xs text-primary font-semibold">
                {{ e.turnsRemaining ?? 0 }} tour{{ (e.turnsRemaining ?? 0) > 1 ? 's' : '' }} restant{{ (e.turnsRemaining ?? 0) > 1 ? 's' : '' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Current player -->
      <div class="text-center mt-0">
        <p class="text-brown/45 text-xs uppercase tracking-widest mb-1">{{ t('game.active.turn') }}</p>
        <div class="flex items-center justify-center gap-3">
          <div class="w-11 h-11 rounded-full flex items-center justify-center text-white text-lg font-bold"
            :class="avatarColors[(currentParticipant ? participants.indexOf(currentParticipant) : 0) % 4]">
            {{ currentParticipant?.displayName.charAt(0).toUpperCase() ?? '?' }}
          </div>
          <span class="text-brown text-2xl font-game">{{ currentParticipant?.displayName ?? '—' }}</span>
        </div>
      </div>

      <!-- ── ZONE JEU (Roue + Bouton) ── -->
      <div class="flex flex-col items-center justify-center gap-6 w-full mt-0">
        
        <!-- ── ROUE ── -->
        <div class="relative w-80 h-80 sm:w-96 sm:h-96 select-none drop-shadow-xl">
          <svg viewBox="0 0 566.93 566.93" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <!-- Corps de la roue (tourne) -->
            <g :style="{
              transform: `rotate(${wheelDeg}deg)`,
              transformOrigin: '283.46px 285.07px',
              transition: wheelMoving ? 'transform 3.2s cubic-bezier(0.1, 0.85, 0.2, 1)' : 'none'
            }">
              <!-- rayons centre -->
              <polyline fill="none" stroke="#1d1d1b" stroke-width="3" stroke-miterlimit="10" points="283.46 259.58 283.46 285.06 283.46 310.57"/>
              <polyline fill="none" stroke="#1d1d1b" stroke-width="3" stroke-miterlimit="10" points="291.34 309.32 283.47 285.08 275.59 260.82"/>
              <polyline fill="none" stroke="#1d1d1b" stroke-width="3" stroke-miterlimit="10" points="268.48 264.45 283.46 285.06 298.45 305.69"/>
              <polyline fill="none" stroke="#1d1d1b" stroke-width="3" stroke-miterlimit="10" points="262.84 270.09 283.45 285.07 304.08 300.05"/>
              <polyline fill="none" stroke="#1d1d1b" stroke-width="3" stroke-miterlimit="10" points="259.22 277.2 283.45 285.07 307.71 292.95"/>
              <polyline fill="none" stroke="#1d1d1b" stroke-width="3" stroke-miterlimit="10" points="257.97 285.07 283.46 285.07 308.96 285.07"/>
              <polyline fill="none" stroke="#1d1d1b" stroke-width="3" stroke-miterlimit="10" points="259.22 292.95 283.46 285.08 307.71 277.2"/>
              <polyline fill="none" stroke="#1d1d1b" stroke-width="3" stroke-miterlimit="10" points="262.85 300.05 283.46 285.08 304.09 270.09"/>
              <polyline fill="none" stroke="#1d1d1b" stroke-width="3" stroke-miterlimit="10" points="268.48 305.69 283.46 285.08 298.45 264.45"/>
              <polyline fill="none" stroke="#1d1d1b" stroke-width="3" stroke-miterlimit="10" points="275.59 309.32 283.46 285.09 291.34 260.82"/>
              <!-- secteurs -->
              <path fill="#aed227" stroke="#1d1d1b" stroke-miterlimit="10" d="M262.84,270.09c-1.57,2.14-2.8,4.53-3.62,7.11l-180.49-58.65c7.05-21.71,17.45-41.91,30.61-59.98l153.5,111.52Z"/>
              <path fill="#7ba049" stroke="#1d1d1b" stroke-miterlimit="10" d="M268.48,264.45c-2.17,1.57-4.07,3.48-5.64,5.64l-153.5-111.52c13.28-18.26,29.36-34.34,47.61-47.62l111.53,153.5Z"/>
              <path fill="#aed227" stroke="#1d1d1b" stroke-miterlimit="10" d="M275.58,260.82c-2.58.83-4.96,2.07-7.1,3.63l-111.53-153.5c18.07-13.16,38.28-23.57,59.99-30.62l58.64,180.49Z"/>
              <path fill="#e23a12" stroke="#1d1d1b" stroke-miterlimit="10" d="M283.46,69.85v189.73c-2.75,0-5.39.43-7.87,1.24h-.01l-58.64-180.49c20.95-6.8,43.31-10.48,66.52-10.48Z"/>
              <path fill="#aed227" stroke="#1d1d1b" stroke-miterlimit="10" d="M349.99,80.33l-58.64,180.49h0c-2.48-.8-5.13-1.24-7.88-1.24V69.85c23.22,0,45.58,3.68,66.53,10.48Z"/>
              <path fill="#7ba049" stroke="#1d1d1b" stroke-miterlimit="10" d="M409.98,110.95l-111.53,153.5c-2.14-1.56-4.52-2.8-7.1-3.63l58.64-180.49c21.71,7.05,41.92,17.46,59.99,30.62Z"/>
              <path fill="#aed227" stroke="#1d1d1b" stroke-miterlimit="10" d="M457.59,158.57l-153.5,111.52c-1.57-2.16-3.47-4.07-5.64-5.64l111.53-153.5c18.25,13.28,34.33,29.36,47.61,47.62Z"/>
              <path fill="#e23a12" stroke="#1d1d1b" stroke-miterlimit="10" d="M488.2,218.55l-180.49,58.65c-.82-2.58-2.05-4.97-3.62-7.11l153.5-111.52c13.16,18.07,23.56,38.27,30.61,59.98Z"/>
              <path fill="#aed227" stroke="#1d1d1b" stroke-miterlimit="10" d="M498.68,285.07h-189.72c0-2.75-.43-5.39-1.25-7.87l180.49-58.65c6.8,20.95,10.48,43.31,10.48,66.52Z"/>
              <path fill="#7ba049" stroke="#1d1d1b" stroke-miterlimit="10" d="M498.68,285.07c0,23.21-3.68,45.57-10.48,66.52l-180.49-58.64c.81-2.48,1.25-5.13,1.25-7.88h189.72Z"/>
              <path fill="#aed227" stroke="#1d1d1b" stroke-miterlimit="10" d="M488.2,351.59c-7.05,21.72-17.46,41.92-30.61,59.99l-153.51-111.53c1.57-2.14,2.8-4.53,3.63-7.1l180.49,58.64Z"/>
              <path fill="#e23a12" stroke="#1d1d1b" stroke-miterlimit="10" d="M457.59,411.58c-13.28,18.25-29.36,34.33-47.61,47.61l-111.53-153.5c2.17-1.57,4.07-3.47,5.63-5.64l153.51,111.53Z"/>
              <path fill="#aed227" stroke="#1d1d1b" stroke-miterlimit="10" d="M409.98,459.19c-18.07,13.16-38.28,23.57-59.99,30.62l-58.65-180.49c2.58-.83,4.97-2.06,7.11-3.63l111.53,153.5Z"/>
              <path fill="#7ba049" stroke="#1d1d1b" stroke-miterlimit="10" d="M349.99,489.81c-20.95,6.8-43.31,10.48-66.53,10.48v-189.72c2.75,0,5.4-.44,7.88-1.25l58.65,180.49Z"/>
              <path fill="#aed227" stroke="#1d1d1b" stroke-miterlimit="10" d="M283.46,310.57v189.72c-23.21,0-45.57-3.68-66.52-10.48l58.65-180.49c2.48.82,5.12,1.25,7.87,1.25Z"/>
              <path fill="#e23a12" stroke="#1d1d1b" stroke-miterlimit="10" d="M275.59,309.32l-58.65,180.49c-21.71-7.05-41.92-17.46-59.99-30.62l111.53-153.5c2.14,1.57,4.53,2.81,7.11,3.63Z"/>
              <path fill="#aed227" stroke="#1d1d1b" stroke-miterlimit="10" d="M268.48,305.69l-111.53,153.5c-18.25-13.28-34.33-29.36-47.61-47.61l153.51-111.53c1.56,2.17,3.46,4.07,5.63,5.64Z"/>
              <path fill="#7ba049" stroke="#1d1d1b" stroke-miterlimit="10" d="M262.85,300.05l-153.51,111.53c-13.15-18.07-23.56-38.27-30.61-59.98l180.49-58.65c.83,2.57,2.06,4.96,3.63,7.1Z"/>
              <path fill="#aed227" stroke="#1d1d1b" stroke-miterlimit="10" d="M259.22,292.95l-180.49,58.64c-6.8-20.95-10.48-43.31-10.48-66.52h189.72c0,2.75.44,5.4,1.25,7.88Z"/>
              <path fill="#e23a12" stroke="#1d1d1b" stroke-miterlimit="10" d="M259.22,277.2c-.82,2.48-1.25,5.12-1.25,7.87H68.25c0-23.21,3.68-45.57,10.48-66.52l180.49,58.65Z"/>
              <!-- centre blanc + logo -->
              <circle cx="283.46" cy="285.07" r="52" fill="white" stroke="#623435" stroke-width="2.5" stroke-miterlimit="10"/>
              <image :href="logoSauveImg" x="248" y="250" width="71" height="71" />
              <!-- labels MALUS -->
              <text fill="#f5debf" font-family="MagicalNeverland-Regular, 'Magical Neverland'" font-size="12" transform="translate(87.69 271.09) rotate(-80)">MALUS</text>
              <text fill="#f5debf" font-family="MagicalNeverland-Regular, 'Magical Neverland'" font-size="12" transform="translate(239.23 92.96) rotate(-10)">MALUS</text>
              <text fill="#f5debf" font-family="MagicalNeverland-Regular, 'Magical Neverland'" font-size="12" transform="translate(450.21 181.54) rotate(62)">MALUS</text>
              <text fill="#f5debf" font-family="MagicalNeverland-Regular, 'Magical Neverland'" font-size="12" transform="translate(433.75 412.62) rotate(135)">MALUS</text>
              <text fill="#f5debf" font-family="MagicalNeverland-Regular, 'Magical Neverland'" font-size="12" transform="translate(208.12 465.82) rotate(-155)">MALUS</text>
              <!-- labels PIOCHE -->
              <text fill="#623435" font-family="MagicalNeverland-Regular, 'Magical Neverland'" font-size="12" transform="translate(297.41 85.64) rotate(10)">PIOCHE</text>
              <text fill="#623435" font-family="MagicalNeverland-Regular, 'Magical Neverland'" font-size="12" transform="translate(409.24 133.41) rotate(45)">PIOCHE</text>
              <text fill="#623435" font-family="MagicalNeverland-Regular, 'Magical Neverland'" font-size="12" transform="translate(473.27 236.57) rotate(80)">PIOCHE</text>
              <text fill="#623435" font-family="MagicalNeverland-Regular, 'Magical Neverland'" font-size="12" transform="translate(465.24 356.86) rotate(115)">PIOCHE</text>
              <text fill="#623435" font-family="MagicalNeverland-Regular, 'Magical Neverland'" font-size="12" transform="translate(387.38 450.07) rotate(153)">PIOCHE</text>
              <text fill="#623435" font-family="MagicalNeverland-Regular, 'Magical Neverland'" font-size="12" transform="translate(271.33 479.53) rotate(-170)">PIOCHE</text>
              <text fill="#623435" font-family="MagicalNeverland-Regular, 'Magical Neverland'" font-size="12" transform="translate(158.93 434.91) rotate(-137)">PIOCHE</text>
              <text fill="#623435" font-family="MagicalNeverland-Regular, 'Magical Neverland'" font-size="12" transform="translate(93.08 332.44) rotate(-99)">PIOCHE</text>
              <text fill="#623435" font-family="MagicalNeverland-Regular, 'Magical Neverland'" font-size="12" transform="translate(102.9 211.76) rotate(-64)">PIOCHE</text>
              <text fill="#623435" font-family="MagicalNeverland-Regular, 'Magical Neverland'" font-size="12" transform="translate(178.35 118.55) rotate(-26)">PIOCHE</text>
              <!-- labels BONUS -->
              <text fill="#f5debf" font-family="MagicalNeverland-Regular, 'Magical Neverland'" font-size="12" transform="translate(356.65 101.44) rotate(26)">BONUS</text>
              <text fill="#f5debf" font-family="MagicalNeverland-Regular, 'Magical Neverland'" font-size="12" transform="translate(479.7 300.15) rotate(99)">BONUS</text>
              <text fill="#f5debf" font-family="MagicalNeverland-Regular, 'Magical Neverland'" font-size="12" transform="translate(330.94 476.26) rotate(170)">BONUS</text>
              <text fill="#f5debf" font-family="MagicalNeverland-Regular, 'Magical Neverland'" font-size="12" transform="translate(115.57 389.09) rotate(-116)">BONUS</text>
              <text fill="#f5debf" font-family="MagicalNeverland-Regular, 'Magical Neverland'" font-size="12" transform="translate(132.75 157.45) rotate(-46)">BONUS</text>
            </g>

            <!-- Pointeur fixe -->
            <polygon fill="#b5d14c" stroke="#623435" stroke-miterlimit="10" points="283.46,90.95 267.4,42.28 299.52,42.28"/>
          </svg>
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
        <div v-if="phase === 'result'" class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 pb-20 sm:pb-4 bg-brown/80 backdrop-blur-sm">
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


    <!-- ═══ MODAL SAUVE QUI POUSSE ═══ -->
    <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-all duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="showWinModal" class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 pb-20 sm:pb-4 bg-brown/60 backdrop-blur-sm" @click.self="showWinModal = false">
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
