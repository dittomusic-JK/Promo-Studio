<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAssetsStore } from '@/stores/assets'
import { useReleaseStore } from '@/stores/release'
import { useStyleStore } from '@/stores/style'
import { useRenderer } from '@/composables/useRenderer'
import PlatformGroup from '@/components/AssetGrid/PlatformGroup.vue'
import ExportProgress from '@/components/ExportProgress.vue'
import { templatesByPlatform, platformLabels } from '@/lib/templates'
import type { Platform } from '@/types'

const router = useRouter()
const assetsStore = useAssetsStore()
const releaseStore = useReleaseStore()
const styleStore = useStyleStore()
const { exportAll } = useRenderer()

const platforms = Object.keys(templatesByPlatform) as Platform[]

onMounted(() => {
  if (!releaseStore.selectedRelease || !styleStore.resolvedStyle) {
    router.push({ name: 'select-release' })
    return
  }
  // Auto-select all if nothing selected yet
  if (assetsStore.selectedCount === 0) {
    assetsStore.selectAll()
  }
})

async function handleExport() {
  if (!releaseStore.selectedRelease || !styleStore.resolvedStyle) return

  assetsStore.exporting = true
  assetsStore.exportProgress = 0

  try {
    await exportAll(
      releaseStore.selectedRelease,
      styleStore.resolvedStyle,
      assetsStore.selections,
      (progress) => {
        assetsStore.exportProgress = progress
      },
    )
  } finally {
    assetsStore.exporting = false
  }
}

function goBack() {
  router.push({ name: 'design-studio' })
}

function startOver() {
  assetsStore.reset()
  styleStore.reset()
  releaseStore.clearSelection()
  router.push({ name: 'select-release' })
}
</script>

<template>
  <div class="export-formats">
    <div class="section-header">
      <h1 class="section-header__title">Select Formats & Export</h1>
      <p class="section-header__subtitle">
        Choose which formats to generate, then export as a ZIP.
      </p>
    </div>

    <!-- Summary Stats -->
    <div class="export-formats__summary">
      <div class="export-formats__stat">
        <span class="export-formats__stat-number">{{ assetsStore.selectedCount }}</span>
        <span class="export-formats__stat-label">Assets</span>
      </div>
      <div class="export-formats__stat">
        <span class="export-formats__stat-number">{{ assetsStore.selectionsByPlatform.size }}</span>
        <span class="export-formats__stat-label">Platforms</span>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="export-formats__toolbar">
      <button class="btn btn--sm btn--secondary" @click="assetsStore.selectAll()">
        Select All
      </button>
      <button class="btn btn--sm btn--ghost" @click="assetsStore.deselectAll()">
        Deselect All
      </button>
      <span class="export-formats__count">
        {{ assetsStore.selectedCount }} selected
      </span>
    </div>

    <!-- Platform Groups -->
    <div class="export-formats__platforms">
      <PlatformGroup
        v-for="platform in platforms"
        :key="platform"
        :platform="platform"
        :label="platformLabels[platform]"
        :templates="templatesByPlatform[platform]"
      />
    </div>

    <!-- Progress -->
    <ExportProgress
      v-if="assetsStore.exporting"
      :progress="assetsStore.exportProgress"
      :total="assetsStore.selectedCount"
    />

    <!-- Actions -->
    <div class="export-formats__actions">
      <button class="btn btn--ghost" @click="goBack" :disabled="assetsStore.exporting">
        Back
      </button>
      <button
        class="btn btn--gradient btn--lg"
        @click="handleExport"
        :disabled="assetsStore.exporting || assetsStore.selectedCount === 0"
      >
        {{ assetsStore.exporting ? 'Generating...' : 'Generate & Download ZIP' }}
      </button>
    </div>

    <!-- Success State -->
    <div v-if="assetsStore.exportProgress === assetsStore.selectedCount && !assetsStore.exporting && assetsStore.exportProgress > 0" class="export-formats__done">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" class="export-formats__done-icon">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
        <path d="M8 12l3 3 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <h2>Assets Ready</h2>
      <p>Your assets have been downloaded.</p>
      <button class="btn btn--secondary" @click="startOver">
        Create More Assets
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens' as *;

.export-formats {
  &__summary {
    display: flex;
    gap: 2rem;
    margin: 2rem 0;
  }

  &__stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1.5rem 3rem;
    background: $surface-2;
    border-radius: $radius-lg;
    border: 1px solid $border-subtle;
    border-top: 2px solid $brand-primary;

    &-number {
      font-family: $font-heading;
      font-size: 2.75rem;
      font-weight: 700;
      background: linear-gradient(135deg, $brand-primary, $brand-secondary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    &-label {
      font-size: 0.875rem;
      color: $text-secondary;
      margin-top: 0.25rem;
    }
  }

  &__toolbar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  &__count {
    margin-left: auto;
    font-size: 0.875rem;
    font-weight: 600;
    color: $brand-primary-hover;
  }

  &__platforms {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  &__actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 2rem;
    margin-top: 2rem;
    border-top: 1px solid $border-subtle;
  }

  &__done {
    text-align: center;
    padding: 2.5rem;
    margin-top: 2rem;
    background: rgba($success, 0.06);
    border: 1px solid rgba($success, 0.15);
    border-radius: $radius-lg;

    &-icon {
      color: $success;
      margin-bottom: 0.75rem;
    }

    h2 {
      font-size: 1.375rem;
      color: $text-primary;
      margin-bottom: 0.5rem;
    }

    p {
      font-size: 0.9375rem;
      color: $text-secondary;
      margin-bottom: 1.25rem;
    }
  }
}
</style>
