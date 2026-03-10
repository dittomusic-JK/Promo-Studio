<script setup lang="ts">
import type { AssetTemplate } from '@/types'

const props = defineProps<{
  template: AssetTemplate
  selected: boolean
}>()

const emit = defineEmits<{
  toggle: []
}>()

const aspectRatio = `${props.template.width} / ${props.template.height}`
</script>

<template>
  <div
    :class="['asset-thumb', { 'asset-thumb--selected': selected }]"
    @click="emit('toggle')"
  >
    <div class="asset-thumb__preview" :style="{ aspectRatio }">
      <div class="asset-thumb__placeholder">
        <span class="asset-thumb__dimensions">
          {{ template.width }} &times; {{ template.height }}
        </span>
      </div>
    </div>
    <div class="asset-thumb__info">
      <span class="asset-thumb__name">{{ template.name }}</span>
      <span class="asset-thumb__format">{{ template.format }}</span>
    </div>
    <div class="asset-thumb__check">
      <svg v-if="selected" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
      <div v-else class="asset-thumb__check-empty" />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens' as *;

.asset-thumb {
  position: relative;
  cursor: pointer;
  border: 2px solid $border-subtle;
  border-radius: $radius-lg;
  overflow: hidden;
  transition: all 0.3s ease;
  background: $surface-2;
  opacity: 0.65;

  &:hover {
    opacity: 0.85;
    border-color: rgba($brand-primary, 0.3);
    transform: translateY(-2px);
  }

  &--selected {
    opacity: 1;
    border-color: $brand-primary;
    box-shadow: $glow-primary;
  }

  &__preview {
    background: $surface-3;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    max-height: 200px;
  }

  &__placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    min-height: 80px;
  }

  &__dimensions {
    font-size: 0.6875rem;
    color: $text-muted;
  }

  &__info {
    padding: 0.5rem 0.625rem;
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
  }

  &__name {
    font-size: 0.8125rem;
    font-weight: 600;
    color: $text-primary;
  }

  &__format {
    font-size: 0.6875rem;
    color: $text-muted;
  }

  &__check {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    color: $brand-primary-hover;

    &-empty {
      width: 20px;
      height: 20px;
      border: 2px solid $surface-4;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.3);
    }
  }
}
</style>
