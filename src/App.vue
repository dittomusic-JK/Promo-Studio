<script setup lang="ts">
import { RouterView } from 'vue-router'
import WizardNav from './components/shared/WizardNav.vue'
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="app-header__title">
        <span>Promo</span> Studio
      </div>
    </header>

    <WizardNav />

    <main class="app-main">
      <RouterView v-slot="{ Component }">
        <Transition name="view" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>
