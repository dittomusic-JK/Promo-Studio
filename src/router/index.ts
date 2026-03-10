import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'select-release',
      component: () => import('../views/SelectRelease.vue'),
    },
    {
      path: '/design',
      name: 'design-studio',
      component: () => import('../views/DesignStudio.vue'),
    },
    {
      path: '/export',
      name: 'export-formats',
      component: () => import('../views/ExportFormats.vue'),
    },
  ],
})

export default router
