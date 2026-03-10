<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useReleaseStore } from '@/stores/release'
import ReleaseCard from '@/components/ReleasePicker/ReleaseCard.vue'
import ReleaseSearch from '@/components/ReleasePicker/ReleaseSearch.vue'

const router = useRouter()
const store = useReleaseStore()

onMounted(() => {
  store.fetchCatalog()
})

async function handleSelect(id: number) {
  await store.selectRelease(id)
  router.push({ name: 'design-studio' })
}
</script>

<template>
  <div class="select-release">
    <div class="section-header">
      <h1 class="section-header__title">Select a Release</h1>
      <p class="section-header__subtitle">
        Choose a release to generate promotional assets for.
      </p>
    </div>

    <ReleaseSearch />

    <div v-if="store.loading" class="select-release__loading">
      Loading releases...
    </div>

    <div v-else class="select-release__grid">
      <ReleaseCard
        v-for="release in store.filteredCatalog"
        :key="release.id"
        :release="release"
        @select="handleSelect"
      />
    </div>

    <div
      v-if="!store.loading && store.filteredCatalog.length === 0"
      class="select-release__empty"
    >
      No releases found. Try adjusting your search or filters.
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens' as *;

.select-release {
  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1.25rem;
    margin-top: 1.5rem;
  }

  &__loading,
  &__empty {
    text-align: center;
    padding: 4rem 2rem;
    color: $text-muted;
    font-size: 0.9375rem;
  }
}
</style>
