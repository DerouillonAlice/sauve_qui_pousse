<script setup lang="ts">
/**
 * WaveEdge — Bordure festonnée (scalloped) réutilisable.
 *
 * Utilise un radial-gradient CSS qui tile parfaitement,
 * sans distorsion des demi-cercles quelle que soit la largeur.
 *
 * Props :
 *  - color    : couleur CSS, ex: 'var(--color-primary)', '#bec059'
 *  - position : 'bottom' (festons vers le bas) ou 'top' (festons vers le haut)
 *  - size     : diamètre d'un feston en pixels (défaut: 40)
 */
const props = withDefaults(
  defineProps<{
    color?: string
    position?: 'top' | 'bottom'
    size?: number
  }>(),
  {
    color: 'var(--color-primary)',
    position: 'bottom',
    size: 80,
  },
)
</script>

<template>
  <div
    class="wave-edge w-full pointer-events-none"
    :class="position === 'top' ? 'rotate-180' : ''"
    :style="{
      '--wave-color': props.color,
      '--wave-size': `${props.size}px`,
      height: `${props.size / 2}px`,
    }"
  />
</template>

<style scoped>
.wave-edge {
  background: radial-gradient(
    circle at 50% 0%,
    var(--wave-color) calc(var(--wave-size) / 2 - 0.5px),
    transparent calc(var(--wave-size) / 2)
  );
  background-size: var(--wave-size) 100%;
  background-repeat: repeat-x;
}
</style>
