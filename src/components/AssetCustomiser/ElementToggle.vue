<script setup lang="ts">
import { computed } from 'vue'
import type { AssetTemplate } from '@/types'

const props = defineProps<{
  template: AssetTemplate
  variantId: string
  hiddenElements: string[]
}>()

const emit = defineEmits<{
  toggle: [elements: string[]]
}>()

const variant = computed(() =>
  props.template.variants.find((v) => v.id === props.variantId) ?? props.template.variants[0]!,
)

const toggleableElements = computed(() => {
  const fromTemplate = variant.value?.elements.filter((el) => el.toggleable && el.content) ?? []
  // Badge is always toggleable (rendered by drawStoreBadges, not template elements)
  const badgeEntry = { content: '{{badge}}', toggleable: true } as import('@/types').TemplateElement
  return [...fromTemplate, badgeEntry]
})

function isVisible(content: string): boolean {
  return !props.hiddenElements.includes(content)
}

function toggle(content: string) {
  const next = isVisible(content)
    ? [...props.hiddenElements, content]
    : props.hiddenElements.filter((c) => c !== content)
  emit('toggle', next)
}

function labelFor(content: string): string {
  const map: Record<string, string> = {
    '{{musicType}}': 'Music Type',
    '{{artistName}}': 'Artist Name',
    '{{releaseDate}}': 'Release Date',
    '{{badge}}': 'Badge (Out Now / Pre-Save)',
    '{{smartLink}}': 'Smart Link',
    '{{label}}': 'Label Name',
  }
  return map[content] ?? content
}
</script>

<template>
  <div class="element-toggle">
    <h4 class="element-toggle__title">Toggle Elements</h4>
    <div class="element-toggle__list">
      <label
        v-for="el in toggleableElements"
        :key="el.content"
        class="toggle-switch"
      >
        <input
          type="checkbox"
          :checked="isVisible(el.content!)"
          @change="toggle(el.content!)"
        />
        <span class="toggle-switch__track" />
        <span class="toggle-switch__label">{{ labelFor(el.content!) }}</span>
      </label>
    </div>
    <p v-if="toggleableElements.length === 0" class="element-toggle__empty">
      No toggleable elements in this variant.
    </p>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens' as *;

.element-toggle {
  &__title {
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: $text-primary;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  &__empty {
    font-size: 0.8125rem;
    color: $text-muted;
  }
}
</style>
