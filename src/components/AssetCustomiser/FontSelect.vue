<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import type { FontOption } from '@/types'

const props = defineProps<{
  modelValue: string
  fonts: FontOption[]
  categories: { label: string; key: FontOption['category'] }[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const open = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const selectedFont = computed(() =>
  props.fonts.find(f => f.family === props.modelValue),
)

function select(font: FontOption) {
  emit('update:modelValue', font.family)
  open.value = false
}

function onClickOutside(e: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('mousedown', onClickOutside))
</script>

<template>
  <div ref="dropdownRef" class="font-select" :class="{ 'font-select--open': open }">
    <button class="font-select__trigger" @click="open = !open">
      <span
        class="font-select__preview"
        :style="{ fontFamily: selectedFont?.family }"
      >{{ selectedFont?.name ?? 'Select font' }}</span>
      <svg class="font-select__chevron" width="12" height="12" viewBox="0 0 12 12"><path fill="currentColor" d="M3 5l3 3 3-3z"/></svg>
    </button>
    <div v-if="open" class="font-select__dropdown">
      <template v-for="cat in categories" :key="cat.key">
        <div
          v-if="fonts.some(f => f.category === cat.key)"
          class="font-select__group-label"
        >{{ cat.label }}</div>
        <button
          v-for="f in fonts.filter(ff => ff.category === cat.key)"
          :key="f.id"
          :class="['font-select__option', { 'font-select__option--active': f.family === modelValue }]"
          @click="select(f)"
        >
          <span :style="{ fontFamily: f.family }">{{ f.name }}</span>
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens' as *;

.font-select {
  position: relative;
  width: 100%;

  &__trigger {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.375rem 0.5rem;
    border-radius: $radius-sm;
    border: 1px solid $border-subtle;
    background: $surface-2;
    color: $text-primary;
    font-size: 0.8125rem;
    cursor: pointer;
    transition: border-color 0.2s ease;
    text-align: left;

    &:hover,
    &:focus {
      border-color: rgba($brand-primary, 0.4);
      outline: none;
    }
  }

  &--open &__trigger {
    border-color: rgba($brand-primary, 0.5);
  }

  &__preview {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  }

  &__chevron {
    flex-shrink: 0;
    margin-left: 0.25rem;
    color: $text-muted;
    transition: transform 0.2s ease;
  }

  &--open &__chevron {
    transform: rotate(180deg);
  }

  &__dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    max-height: 280px;
    overflow-y: auto;
    background: $surface-3;
    border: 1px solid $border-medium;
    border-radius: $radius-sm;
    box-shadow: $shadow-elevated;
    z-index: 50;
    padding: 0.25rem 0;
  }

  &__group-label {
    padding: 0.5rem 0.625rem 0.25rem;
    font-size: 0.6875rem;
    font-weight: 600;
    color: $text-muted;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  &__option {
    display: block;
    width: 100%;
    padding: 0.375rem 0.625rem;
    border: none;
    background: transparent;
    color: $text-primary;
    font-size: 0.875rem;
    cursor: pointer;
    text-align: left;
    transition: background 0.15s ease;

    &:hover {
      background: rgba($brand-primary, 0.12);
    }

    &--active {
      background: rgba($brand-primary, 0.18);
      color: $brand-primary-hover;
    }
  }
}
</style>
