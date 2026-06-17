<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
const { t, tm } = useI18n()

type Mode = 'login' | 'register'
const mode = ref<Mode>('login')
</script>

<template>
  <div class="bg-cream min-h-screen">

    <!-- HERO -->
    <section class="py-16 px-6 text-center bg-cream-dark">
      <div class="max-w-xl mx-auto">
        <h1 class="text-brown mb-3">{{ t('play.hero.title') }}</h1>
        <p class="text-brown/70 text-lg">{{ t('play.hero.subtitle') }}</p>
      </div>
    </section>

    <div class="max-w-4xl mx-auto px-6 py-16 grid gap-12 lg:grid-cols-2">

      <!-- FORMULAIRE -->
      <div class="bg-white/70 rounded-3xl p-8 shadow-sm">
        <!-- Tabs -->
        <div class="flex gap-2 mb-8 bg-cream rounded-xl p-1">
          <button v-for="m in (['login', 'register'] as Mode[])" :key="m"
            @click="mode = m"
            class="flex-1 py-2 rounded-lg text-sm font-semibold transition-colors"
            :class="mode === m ? 'bg-primary text-cream' : 'text-brown/60 hover:text-brown'">
            {{ m === 'login' ? t('play.login.title') : t('play.register.title') }}
          </button>
        </div>

        <!-- Login -->
        <form v-if="mode === 'login'" class="space-y-4">
          <input type="email" :placeholder="t('play.login.email')"
            class="w-full px-4 py-3 rounded-xl border border-primary/20 bg-cream text-brown placeholder-brown/40 focus:outline-none focus:border-primary" />
          <input type="password" :placeholder="t('play.login.password')"
            class="w-full px-4 py-3 rounded-xl border border-primary/20 bg-cream text-brown placeholder-brown/40 focus:outline-none focus:border-primary" />
          <button type="submit"
            class="w-full py-3 bg-primary text-cream rounded-xl font-semibold hover:scale-[1.02] transition-transform">
            {{ t('play.login.submit') }}
          </button>
          <p class="text-center text-sm text-brown/50 hover:text-brown cursor-pointer">
            {{ t('play.login.forgot') }}
          </p>
        </form>

        <!-- Register -->
        <form v-else class="space-y-4">
          <p class="text-brown/60 text-sm mb-2">{{ t('play.register.subtitle') }}</p>
          <input type="text" :placeholder="t('play.register.firstname')"
            class="w-full px-4 py-3 rounded-xl border border-primary/20 bg-cream text-brown placeholder-brown/40 focus:outline-none focus:border-primary" />
          <input type="email" :placeholder="t('play.register.email')"
            class="w-full px-4 py-3 rounded-xl border border-primary/20 bg-cream text-brown placeholder-brown/40 focus:outline-none focus:border-primary" />
          <input type="password" :placeholder="t('play.register.password')"
            class="w-full px-4 py-3 rounded-xl border border-primary/20 bg-cream text-brown placeholder-brown/40 focus:outline-none focus:border-primary" />
          <button type="submit"
            class="w-full py-3 bg-primary text-cream rounded-xl font-semibold hover:scale-[1.02] transition-transform">
            {{ t('play.register.submit') }}
          </button>
          <p class="text-xs text-brown/40 text-center leading-relaxed">
            {{ t('play.register.legal') }}
          </p>
        </form>
      </div>

      <!-- FEATURES + DEMO -->
      <div class="flex flex-col gap-8">
        <div class="bg-primary/10 rounded-3xl p-8">
          <p class="font-semibold text-brown mb-4">{{ t('play.features.title') }}</p>
          <ul class="space-y-3">
            <li v-for="(item, i) in (tm('play.features.items') as string[])" :key="i"
              class="flex items-start gap-3 text-brown/70 text-sm leading-relaxed">
              <span class="text-primary mt-0.5">✓</span>
              {{ item }}
            </li>
          </ul>
        </div>

        <div class="bg-cream-dark rounded-3xl p-8 text-center">
          <p class="font-semibold text-brown text-lg mb-2">{{ t('play.demo.title') }}</p>
          <p class="text-brown/60 text-sm mb-6 leading-relaxed">{{ t('play.demo.desc') }}</p>
          <button
            class="px-8 py-3 border-2 border-brown text-brown rounded-full font-semibold hover:bg-brown hover:text-cream transition-colors">
            {{ t('play.demo.cta') }}
          </button>
        </div>
      </div>

    </div>
  </div>
</template>
