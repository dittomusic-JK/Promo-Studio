<script setup lang="ts">
import type { AssetTemplate } from '@/types'

const props = defineProps<{
  template: AssetTemplate
  selected: string
}>()

const emit = defineEmits<{
  select: [variantId: string]
}>()
</script>

<template>
  <div class="variant-picker">
    <h4 class="variant-picker__title">Layout Variant</h4>
    <div class="variant-picker__options">
      <button
        v-for="variant in template.variants"
        :key="variant.id"
        :class="['variant-picker__btn', { 'variant-picker__btn--active': selected === variant.id }]"
        @click="emit('select', variant.id)"
      >
        {{ variant.name }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens' as *;

.variant-picker {
  &__title {
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: $text-primary;
  }

  &__options {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  &__btn {
    padding: 0.4rem 0.875rem;
    border: 1px solid $border-subtle;
    border-radius: $radius-pill;
    background: $surface-2;
    font-size: 0.8125rem;
    color: $text-secondary;
    transition: all 0.2s ease;

    &:hover {
      border-color: rgba($brand-primary, 0.4);
      color: $text-primary;
    }

    &--active {
      border-color: $brand-primary;
      background: rgba($brand-primary, 0.12);
      color: $brand-primary-hover;
      font-weight: 600;
      box-shadow: $glow-primary-sm;
    }
  }
}
</style>
