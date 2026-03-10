<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  progress: number
  total: number
}>()

const percentage = computed(() =>
  props.total > 0 ? Math.round((props.progress / props.total) * 100) : 0,
)
</script>

<template>
  <div class="export-progress">
    <div class="export-progress__bar">
      <div
        class="export-progress__fill"
        :style="{ width: `${percentage}%` }"
      />
    </div>
    <span class="export-progress__text">
      Rendering {{ progress }} of {{ total }} assets ({{ percentage }}%)
    </span>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens' as *;

@keyframes progress-pulse {
  0%, 100% { box-shadow: none; }
  50% { box-shadow: 0 0 12px rgba($brand-primary, 0.4); }
}

.export-progress {
  margin: 1.5rem 0;

  &__bar {
    height: 12px;
    background: $surface-3;
    border-radius: $radius-pill;
    overflow: hidden;
    margin-bottom: 0.5rem;
    animation: progress-pulse 2s ease infinite;
  }

  &__fill {
    height: 100%;
    background: linear-gradient(90deg, $brand-primary, $brand-secondary);
    border-radius: $radius-pill;
    transition: width 0.3s ease;
  }

  &__text {
    font-size: 0.8125rem;
    color: $text-secondary;
  }
}
</style>
