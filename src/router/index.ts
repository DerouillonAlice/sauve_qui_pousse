import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    { path: '/',        name: 'home',   component: HomeView },
    { path: '/regles',  name: 'regles', component: () => import('@/views/RulesView.vue') },
    { path: '/cartes',  name: 'cartes', component: () => import('@/views/CardsView.vue') },
    { path: '/jouer',   name: 'jouer',  component: () => import('@/views/PlayView.vue') },
  ],
})

export default router
