<script setup lang="ts">
import type { StyleDirection, Palette, StyleDirectionId } from '@/types'

const props = defineProps<{
  direction: StyleDirection
  selected: boolean
  palette: Palette
}>()

const emit = defineEmits<{
  select: [id: StyleDirectionId]
}>()

function previewStyle() {
  switch (props.direction.id) {
    case 'dark':
      return {
        background: darken(props.palette.dominant, 0.7),
        color: '#fff',
        borderColor: props.palette.accent,
      }
    case 'light':
      return {
        background: '#f8f8ff',
        color: props.palette.dominant,
        borderColor: props.palette.accent,
      }
    case 'full-bleed':
      return {
        background: `linear-gradient(135deg, ${props.palette.dominant}, ${props.palette.accent})`,
        color: '#fff',
        borderColor: props.palette.accent,
      }
    case 'duotone':
      return {
        background: `linear-gradient(135deg, ${props.palette.dominant}, ${props.palette.accent})`,
        color: '#fff',
        borderColor: props.palette.dominant,
        filter: 'saturate(1.5)',
      }
    default:
      return {}
  }
}

function darken(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgb(${Math.round(r * (1 - amount))}, ${Math.round(g * (1 - amount))}, ${Math.round(b * (1 - amount))})`
}
</script>

<template>
  <div
    :class="['direction-card', { 'direction-card--selected': selected }]"
    @click="emit('select', direction.id)"
  >
    <div class="direction-card__preview" :style="previewStyle()">
      <span class="direction-card__preview-text">Aa</span>
    </div>
    <div class="direction-card__info">
      <h4 class="direction-card__name">{{ direction.name }}</h4>
      <p class="direction-card__desc">{{ direction.description }}</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens' as *;

.direction-card {
  cursor: pointer;
  border: 2px solid $border-subtle;
  border-radius: $radius-lg;
  overflow: hidden;
  transition: all 0.3s ease;
  background: $surface-2;

  &:hover {
    border-color: rgba($brand-primary, 0.4);
    transform: translateY(-3px);
    box-shadow: $shadow-card;
  }

  &--selected {
    border-color: $brand-primary;
    box-shadow: $glow-primary;

    .direction-card__info {
      background: rgba($brand-primary, 0.06);
    }
  }

  &__preview {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 140px;
    transition: all 0.3s ease;

    &-text {
      font-size: 2.5rem;
      font-weight: 700;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }
  }

  &__info {
    padding: 0.875rem;
    border-top: 1px solid $border-subtle;
    transition: background 0.3s ease;
  }

  &__name {
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 0.2rem;
    color: $text-primary;
  }

  &__desc {
    font-size: 0.75rem;
    color: $text-secondary;
    line-height: 1.4;
  }
}
</style>
