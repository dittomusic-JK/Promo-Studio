<script setup lang="ts">
import { useStyleStore } from '@/stores/style'

const styleStore = useStyleStore()

const presetAccentColours = [
  '#ff006e', '#12c1ae', '#5f1fff', '#287ef7',
  '#f6c443', '#00e785', '#ec0515', '#8640f4',
]

function setAccent(color: string) {
  styleStore.setAccentOverride(
    color === styleStore.accentOverride ? null : color,
  )
}
</script>

<template>
  <div class="style-overrides">
    <h3 class="style-overrides__title">Accent Colour Override</h3>
    <p class="style-overrides__hint">Optional. Click to override, click again to reset.</p>
    <div class="style-overrides__swatches">
      <button
        v-for="c in presetAccentColours"
        :key="c"
        :class="['style-overrides__swatch', { 'style-overrides__swatch--active': styleStore.accentOverride === c }]"
        :style="{ background: c }"
        @click="setAccent(c)"
      />
      <div v-if="styleStore.palette" class="style-overrides__current">
        <span class="style-overrides__current-label">Current</span>
        <span
          class="style-overrides__swatch style-overrides__swatch--current"
          :style="{ background: styleStore.effectiveAccent }"
          :title="styleStore.effectiveAccent"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens' as *;

.style-overrides {
  margin-top: 1.5rem;

  &__title {
    font-size: 0.9375rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
    color: $text-primary;
  }

  &__hint {
    font-size: 0.75rem;
    color: $text-muted;
    margin-bottom: 0.75rem;
  }

  &__swatches {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    flex-wrap: wrap;
  }

  &__swatch {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 2px solid transparent;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      transform: scale(1.15);
      box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
    }

    &--active {
      border-color: $text-primary;
      box-shadow: 0 0 0 3px rgba($brand-primary, 0.3);
    }

    &--current {
      cursor: default;
      width: 28px;
      height: 28px;
    }
  }

  &__current {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    margin-left: 0.75rem;

    &-label {
      font-size: 0.75rem;
      color: $text-muted;
    }
  }
}
</style>
