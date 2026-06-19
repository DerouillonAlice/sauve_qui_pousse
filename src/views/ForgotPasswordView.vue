<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-vue-next'
import WaveEdge from '@/components/WaveEdge.vue'
import { apiFetch } from '@/services/api'

const { t } = useI18n()

const email = ref('')
const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

async function handleSubmit() {
  if (!email.value) return
  isLoading.value = true
  successMessage.value = ''
  errorMessage.value = ''
  
  try {
    await apiFetch('/forgot-password', {
      method: 'POST',
      body: { email: email.value }
    })
    successMessage.value = t('play.forgot.success')
    email.value = ''
  } catch (error: any) {
    // If backend throws an error
    errorMessage.value = error.message || t('auth.error.server')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="bg-white min-h-screen pb-20 lg:pb-0">
    <section class="py-16 px-6 text-center bg-cream-dark">
      <div class="max-w-xl mx-auto">
        <h1 class="text-brown mb-3">{{ t('play.forgot.title') }}</h1>
        <p class="text-brown/70 text-lg">{{ t('play.forgot.subtitle') }}</p>
      </div>
    </section>

    <WaveEdge color="var(--color-cream-dark)" :size="48" />

    <div class="max-w-xl mx-auto px-6 py-16">
      <div class="bg-brown rounded-3xl p-8">
        
        <!-- Error -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div v-if="errorMessage" class="flex items-start gap-3 bg-red/20 text-cream rounded-xl px-4 py-3 mb-4 text-sm">
            <AlertCircle :stroke-width="1.5" class="w-5 h-5 mt-0.5 shrink-0" />
            <span>{{ errorMessage }}</span>
          </div>
        </Transition>

        <!-- Success -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div v-if="successMessage" class="flex items-start gap-3 bg-primary/30 text-cream rounded-xl px-4 py-3 mb-4 text-sm">
            <CheckCircle2 :stroke-width="1.5" class="w-5 h-5 mt-0.5 shrink-0" />
            <span>{{ successMessage }}</span>
          </div>
        </Transition>

        <form class="space-y-4" @submit.prevent="handleSubmit">
          <div class="flex flex-col gap-1">
            <label for="forgot-email" class="text-cream font-semibold text-sm">{{ t('play.forgot.email') }}</label>
            <input id="forgot-email" v-model="email" type="email" required autocomplete="email"
              class="w-full px-4 py-3 rounded-xl border-2 border-primary bg-cream text-brown placeholder:text-brown/40 focus:outline-none focus:ring-[3px] focus:ring-primary/25 transition-all" />
          </div>

          <div class="pt-2">
            <button id="forgot-submit" type="submit" :disabled="isLoading"
              class="mx-auto flex items-center justify-center gap-2 px-10 py-3 bg-primary text-cream rounded-full font-bold cursor-pointer hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed transition-transform">
              <Loader2 v-if="isLoading" :stroke-width="2" class="w-5 h-5 animate-spin" />
              {{ t('play.forgot.submit') }}
            </button>
          </div>

          <p class="text-center text-sm text-cream/70 pt-2 mt-4">
            <router-link to="/compte" class="text-primary font-semibold hover:underline cursor-pointer">
              {{ t('play.forgot.back') }}
            </router-link>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>
