import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { AssetSelection, Platform } from '@/types'
import { allTemplates } from '@/lib/templates'

export const useAssetsStore = defineStore('assets', () => {
  const selections = ref<Map<string, AssetSelection>>(new Map())
  const exportProgress = ref(0)
  const exporting = ref(false)

  const selectedTemplateIds = computed(() => [...selections.value.keys()])

  const selectedCount = computed(() => selections.value.size)

  const selectionsByPlatform = computed(() => {
    const grouped = new Map<Platform, string[]>()
    for (const [templateId] of selections.value) {
      const template = allTemplates.find((t) => t.id === templateId)
      if (!template) continue
      const existing = grouped.get(template.platform) ?? []
      existing.push(templateId)
      grouped.set(template.platform, existing)
    }
    return grouped
  })

  function toggleAsset(templateId: string) {
    if (selections.value.has(templateId)) {
      const next = new Map(selections.value)
      next.delete(templateId)
      selections.value = next
    } else {
      const template = allTemplates.find((t) => t.id === templateId)
      if (!template) return
      const next = new Map(selections.value)
      next.set(templateId, {
        templateId,
        variantId: template.variants[0]!.id,
        overrides: { hiddenElements: [], customText: null },
      })
      selections.value = next
    }
  }

  function selectAllForPlatform(platform: Platform) {
    const next = new Map(selections.value)
    for (const template of allTemplates.filter((t) => t.platform === platform)) {
      if (!next.has(template.id)) {
        next.set(template.id, {
          templateId: template.id,
          variantId: template.variants[0]!.id,
          overrides: { hiddenElements: [], customText: null },
        })
      }
    }
    selections.value = next
  }

  function deselectAllForPlatform(platform: Platform) {
    const next = new Map(selections.value)
    for (const template of allTemplates.filter((t) => t.platform === platform)) {
      next.delete(template.id)
    }
    selections.value = next
  }

  function selectAll() {
    const next = new Map<string, AssetSelection>()
    for (const template of allTemplates) {
      next.set(template.id, {
        templateId: template.id,
        variantId: template.variants[0]!.id,
        overrides: { hiddenElements: [], customText: null },
      })
    }
    selections.value = next
  }

  function deselectAll() {
    selections.value = new Map()
  }

  function updateSelection(templateId: string, update: Partial<AssetSelection>) {
    const existing = selections.value.get(templateId)
    if (!existing) return
    const next = new Map(selections.value)
    next.set(templateId, { ...existing, ...update })
    selections.value = next
  }

  function getSelection(templateId: string): AssetSelection | undefined {
    return selections.value.get(templateId)
  }

  function applyGlobalOverrides(variantId: string, hiddenElements: string[]) {
    const next = new Map(selections.value)
    for (const [templateId, selection] of next) {
      const template = allTemplates.find((t) => t.id === templateId)
      if (!template) continue
      const hasVariant = template.variants.some((v) => v.id === variantId)
      next.set(templateId, {
        ...selection,
        variantId: hasVariant ? variantId : selection.variantId,
        overrides: { ...selection.overrides, hiddenElements },
      })
    }
    selections.value = next
  }

  function reset() {
    selections.value = new Map()
    exportProgress.value = 0
    exporting.value = false
  }

  return {
    selections,
    exportProgress,
    exporting,
    selectedTemplateIds,
    selectedCount,
    selectionsByPlatform,
    toggleAsset,
    selectAllForPlatform,
    deselectAllForPlatform,
    selectAll,
    deselectAll,
    updateSelection,
    getSelection,
    applyGlobalOverrides,
    reset,
  }
})
