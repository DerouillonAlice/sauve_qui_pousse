<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-vue-next'
import WaveEdge from '@/components/WaveEdge.vue'
import { apiFetch } from '@/services/api'

const route = useRoute()
const { t } = useI18n()

const token = ref<string>('')
const password = ref('')
const passwordConfirm = ref('')

const isLoading = ref(false)
const isSuccess = ref(false)
const errorMessage = ref('')

onMounted(() => {
  const qToken = route.query.token
  if (!qToken || typeof qToken !== 'string') {
    errorMessage.value = t('play.reset.invalid_token')
  } else {
    token.value = qToken
  }
})

async function handleSubmit() {
  if (!token.value) return
  if (password.value !== passwordConfirm.value) {
    errorMessage.value = t('play.reset.mismatch')
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  
  try {
    await apiFetch('/reset-password', {
      method: 'POST',
      body: { token: token.value, password: password.value }
    })
    isSuccess.value = true
  } catch (error: any) {
    errorMessage.value = error.message || t('play.reset.invalid_token')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="bg-white min-h-screen pb-20 lg:pb-0">
    <section class="py-16 px-6 text-center bg-cream-dark">
      <div class="max-w-xl mx-auto">
        <h1 class="text-brown mb-3">{{ t('play.reset.title') }}</h1>
        <p class="text-brown/70 text-lg">{{ t('play.reset.subtitle') }}</p>
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
          <div v-if="isSuccess" class="flex flex-col items-center gap-3 bg-primary/30 text-cream rounded-xl px-4 py-6 mb-4 text-center">
            <CheckCircle2 :stroke-width="1.5" class="w-12 h-12 mb-2 text-primary" />
            <span class="font-bold">{{ t('play.reset.success') }}</span>
            <router-link to="/compte" class="mt-4 px-6 py-2 bg-primary text-cream rounded-full font-bold hover:scale-[1.03] active:scale-[0.97] transition-transform">
              {{ t('play.reset.login_link') }}
            </router-link>
          </div>
        </Transition>

        <form v-if="!isSuccess && token" class="space-y-4" @submit.prevent="handleSubmit">
          <div class="flex flex-col gap-1">
            <label for="reset-password" class="text-cream font-semibold text-sm">{{ t('play.reset.password') }}</label>
            <input id="reset-password" v-model="password" type="password" required minlength="8" autocomplete="new-password"
              class="w-full px-4 py-3 rounded-xl border-2 border-primary bg-cream text-brown placeholder:text-brown/40 focus:outline-none focus:ring-[3px] focus:ring-primary/25 transition-all" />
          </div>
          
          <div class="flex flex-col gap-1">
            <label for="reset-password-confirm" class="text-cream font-semibold text-sm">{{ t('play.reset.confirm_password') }}</label>
            <input id="reset-password-confirm" v-model="passwordConfirm" type="password" required minlength="8" autocomplete="new-password"
              class="w-full px-4 py-3 rounded-xl border-2 border-primary bg-cream text-brown placeholder:text-brown/40 focus:outline-none focus:ring-[3px] focus:ring-primary/25 transition-all" />
          </div>

          <div class="pt-2">
            <button id="reset-submit" type="submit" :disabled="isLoading"
              class="mx-auto flex items-center justify-center gap-2 px-10 py-3 bg-primary text-cream rounded-full font-bold cursor-pointer hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed transition-transform">
              <Loader2 v-if="isLoading" :stroke-width="2" class="w-5 h-5 animate-spin" />
              {{ t('play.reset.submit') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
