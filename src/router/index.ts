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
    { path: '/compte',           name: 'compte',   component: () => import('@/views/ProfileView.vue') },
    { path: '/mentions-legales', name: 'mentions', component: () => import('@/views/MentionsLegalesView.vue') },
    { path: '/cgu',              name: 'cgu',      component: () => import('@/views/CGUView.vue') },
    { path: '/cgv',              name: 'cgv',      component: () => import('@/views/CGVView.vue') },
    { path: '/mot-de-passe-oublie', name: 'forgot-password', component: () => import('@/views/ForgotPasswordView.vue') },
    { path: '/reinitialiser-mot-de-passe', name: 'reset-password', component: () => import('@/views/ResetPasswordView.vue') },
  ],
})

export default router
