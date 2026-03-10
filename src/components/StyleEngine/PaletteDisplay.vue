<script setup lang="ts">
import type { Palette } from '@/types'

defineProps<{
  palette: Palette
}>()

const swatches = ['dominant', 'accent', 'neutral', 'text'] as const
</script>

<template>
  <div class="palette-display">
    <h3 class="palette-display__title">Extracted Palette</h3>
    <div class="palette-display__swatches">
      <div
        v-for="key in swatches"
        :key="key"
        class="palette-display__swatch"
        :title="palette[key]"
      >
        <div
          :class="['palette-display__colour', { 'palette-display__colour--dominant': key === 'dominant' }]"
          :style="{ background: palette[key] }"
        />
        <span class="palette-display__label">{{ key }}</span>
      </div>
    </div>
    <div class="palette-display__gradient">
      <div
        class="palette-display__gradient-bar"
        :style="{
          background: `linear-gradient(90deg, ${palette.gradient[0]}, ${palette.gradient[1]})`,
        }"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens' as *;

.palette-display {
  &__title {
    font-size: 0.9375rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
    color: $text-primary;
  }

  &__swatches {
    display: flex;
    gap: 1.25rem;
    margin-bottom: 1rem;
  }

  &__swatch {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.375rem;
  }

  &__colour {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: 2px solid $border-subtle;
    transition: transform 0.2s ease;

    &--dominant {
      width: 64px;
      height: 64px;
      border-color: rgba(255, 255, 255, 0.15);
      box-shadow: 0 0 12px rgba(0, 0, 0, 0.3);
    }

    &:hover {
      transform: scale(1.08);
    }
  }

  &__label {
    font-size: 0.6875rem;
    text-transform: capitalize;
    color: $text-muted;
  }

  &__gradient-bar {
    height: 8px;
    border-radius: $radius-pill;
  }
}
</style>
