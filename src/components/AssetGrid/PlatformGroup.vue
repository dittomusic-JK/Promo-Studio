<script setup lang="ts">
import { computed } from 'vue'
import type { AssetTemplate, Platform } from '@/types'
import { useAssetsStore } from '@/stores/assets'
import AssetThumbnail from './AssetThumbnail.vue'

const props = defineProps<{
  platform: Platform
  label: string
  templates: AssetTemplate[]
}>()

const assetsStore = useAssetsStore()

const allSelected = computed(() =>
  props.templates.every((t) => assetsStore.selections.has(t.id)),
)

function toggleAll() {
  if (allSelected.value) {
    assetsStore.deselectAllForPlatform(props.platform)
  } else {
    assetsStore.selectAllForPlatform(props.platform)
  }
}
</script>

<template>
  <div class="platform-group">
    <div class="platform-group__header">
      <h3 class="platform-group__title">{{ label }}</h3>
      <button class="btn btn--sm btn--ghost" @click="toggleAll">
        {{ allSelected ? 'Deselect all' : 'Select all' }}
      </button>
    </div>
    <div class="platform-group__grid">
      <AssetThumbnail
        v-for="template in templates"
        :key="template.id"
        :template="template"
        :selected="assetsStore.selections.has(template.id)"
        @toggle="assetsStore.toggleAsset(template.id)"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens' as *;

.platform-group {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
  }

  &__title {
    font-size: 1.0625rem;
    font-weight: 600;
    color: $text-primary;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1rem;
  }
}
</style>
