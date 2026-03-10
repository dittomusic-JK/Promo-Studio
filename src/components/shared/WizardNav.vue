<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const steps = [
  { name: 'select-release', label: 'Select Release', number: 1 },
  { name: 'design-studio', label: 'Design Studio', number: 2 },
  { name: 'export-formats', label: 'Export', number: 3 },
]

const currentStepIndex = computed(() =>
  steps.findIndex((s) => s.name === route.name),
)

function stepClass(index: number) {
  if (index === currentStepIndex.value) return 'wizard-nav__step--active'
  if (index < currentStepIndex.value) return 'wizard-nav__step--completed'
  return ''
}

function connectorClass(index: number) {
  if (index < currentStepIndex.value) return 'wizard-nav__connector--completed'
  if (index === currentStepIndex.value) return 'wizard-nav__connector--active'
  return ''
}

function goToStep(index: number) {
  if (index < currentStepIndex.value) {
    router.push({ name: steps[index]!.name })
  }
}
</script>

<template>
  <nav class="wizard-nav">
    <template v-for="(step, i) in steps" :key="step.name">
      <div
        :class="['wizard-nav__step', stepClass(i)]"
        @click="goToStep(i)"
      >
        <span class="wizard-nav__step-number">
          <template v-if="i < currentStepIndex">&#10003;</template>
          <template v-else>{{ step.number }}</template>
        </span>
        <span class="wizard-nav__step-label">{{ step.label }}</span>
      </div>
      <div
        v-if="i < steps.length - 1"
        :class="['wizard-nav__connector', connectorClass(i)]"
      />
    </template>
  </nav>
</template>
