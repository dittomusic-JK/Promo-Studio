import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type {
  Palette,
  StylePreset,
  StyleDirectionId,
  BackgroundThemeId,
  FilterId,
  ResolvedStyle,
  StoreBadgeId,
  FontOverride,
  FontPairing,
} from '@/types'
import { loadFontByFamily } from '@/lib/fonts'
import { imageBackgrounds } from '@/lib/imageBackgrounds'

function isLightColor(hex: string): boolean {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5
}

export const useStyleStore = defineStore('style', () => {
  const palette = ref<Palette | null>(null)
  const preset = ref<StylePreset | null>(null)
  const selectedDirection = ref<StyleDirectionId>('dark')
  const accentOverride = ref<string | null>(null)

  // Customisation state
  const backgroundTheme = ref<BackgroundThemeId>('dark')
  const selectedFilter = ref<FilterId | null>(null)
  const fontOverride = ref<FontOverride | null>(null)
  const fontSizeScale = ref<number>(1.0)
  const grainEnabled = ref<boolean>(true)
  const storeBadges = ref<StoreBadgeId[]>([])
  const imageBackgroundId = ref<string | null>(null)
  const solidBackgroundColor = ref<string | null>(null)
  const textAlign = ref<'left' | 'center' | 'right' | null>(null)

  const resolvedStyle = computed<ResolvedStyle | null>(() => {
    if (!palette.value || !preset.value) return null
    return {
      preset: preset.value,
      direction: selectedDirection.value,
      backgroundTheme: backgroundTheme.value,
      palette: palette.value,
      accentOverride: accentOverride.value,
      filter: selectedFilter.value,
      fontOverride: fontOverride.value,
      fontSizeScale: fontSizeScale.value,
      grain: grainEnabled.value,
      storeBadges: storeBadges.value,
      imageBackgroundId: imageBackgroundId.value,
      solidBackgroundColor: solidBackgroundColor.value,
      textAlign: textAlign.value ?? undefined,
    }
  })

  const effectiveAccent = computed(() =>
    accentOverride.value ?? palette.value?.accent ?? '#5f1fff',
  )

  function setPalette(p: Palette) {
    palette.value = p
  }

  function setPreset(p: StylePreset) {
    preset.value = p
  }

  function setDirection(d: StyleDirectionId) {
    selectedDirection.value = d
  }

  function setAccentOverride(color: string | null) {
    accentOverride.value = color
  }

  function setBackgroundTheme(t: BackgroundThemeId) {
    backgroundTheme.value = t
    if (t !== 'custom-image') {
      imageBackgroundId.value = null
    }
    if (t !== 'solid-color') {
      solidBackgroundColor.value = null
    }
    // Keep direction in sync for text colour logic
    if (t === 'dark' || t === 'light' || t === 'full-bleed' || t === 'duotone') {
      selectedDirection.value = t
    } else if (t === 'solid-color' && solidBackgroundColor.value) {
      selectedDirection.value = isLightColor(solidBackgroundColor.value) ? 'light' : 'dark'
    } else {
      selectedDirection.value = 'dark'
    }
  }

  function setImageBackground(id: string | null) {
    if (id) {
      backgroundTheme.value = 'custom-image'
      imageBackgroundId.value = id
      const bg = imageBackgrounds.find(b => b.id === id)
      selectedDirection.value = bg?.isLight ? 'light' : 'dark'
    } else {
      imageBackgroundId.value = null
    }
  }

  function setSolidBackgroundColor(color: string | null) {
    if (color) {
      backgroundTheme.value = 'solid-color'
      solidBackgroundColor.value = color
      // Detect if the solid color is light or dark for text colour
      selectedDirection.value = isLightColor(color) ? 'light' : 'dark'
    } else {
      solidBackgroundColor.value = null
    }
  }

  function setFilter(f: FilterId | null) {
    selectedFilter.value = f
  }

  function setFontOverride(fo: FontOverride | null) {
    fontOverride.value = fo
  }

  async function setFontPairing(pairing: FontPairing | null) {
    if (!pairing) {
      fontOverride.value = null
      return
    }
    await Promise.all([
      loadFontByFamily(pairing.headingFont, pairing.headingFontUrl),
      loadFontByFamily(pairing.bodyFont, pairing.bodyFontUrl),
    ])
    fontOverride.value = {
      headingFont: pairing.headingFont,
      bodyFont: pairing.bodyFont,
      fontWeight: pairing.fontWeight,
      textTransform: pairing.textTransform,
      titleOverride: undefined,
      artistOverride: undefined,
    }
  }

  // ── Per-element text overrides ────────────────────────────

  function ensureFontOverride() {
    if (fontOverride.value) return
    if (!preset.value) return
    fontOverride.value = {
      headingFont: preset.value.headingFont,
      bodyFont: preset.value.bodyFont,
      fontWeight: preset.value.fontWeight,
      textTransform: preset.value.textTransform,
    }
  }

  function setTitleBold(bold: boolean) {
    ensureFontOverride()
    const current = fontOverride.value!.titleOverride ?? {}
    fontOverride.value = {
      ...fontOverride.value!,
      titleOverride: { ...current, fontWeight: bold ? 'bold' : 'regular' },
    }
  }

  function setTitleCaps(caps: boolean) {
    ensureFontOverride()
    const current = fontOverride.value!.titleOverride ?? {}
    fontOverride.value = {
      ...fontOverride.value!,
      titleOverride: { ...current, textTransform: caps ? 'uppercase' : 'none' },
    }
  }

  function setArtistBold(bold: boolean) {
    ensureFontOverride()
    const current = fontOverride.value!.artistOverride ?? {}
    fontOverride.value = {
      ...fontOverride.value!,
      artistOverride: { ...current, fontWeight: bold ? 'bold' : 'regular' },
    }
  }

  function setArtistCaps(caps: boolean) {
    ensureFontOverride()
    const current = fontOverride.value!.artistOverride ?? {}
    fontOverride.value = {
      ...fontOverride.value!,
      artistOverride: { ...current, textTransform: caps ? 'uppercase' : 'none' },
    }
  }

  async function setTitleFont(family: string, url: string) {
    await loadFontByFamily(family, url)
    ensureFontOverride()
    const current = fontOverride.value!.titleOverride ?? {}
    fontOverride.value = {
      ...fontOverride.value!,
      titleOverride: { ...current, font: family, fontUrl: url },
    }
  }

  async function setArtistFont(family: string, url: string) {
    await loadFontByFamily(family, url)
    ensureFontOverride()
    const current = fontOverride.value!.artistOverride ?? {}
    fontOverride.value = {
      ...fontOverride.value!,
      artistOverride: { ...current, font: family, fontUrl: url },
    }
  }

  function setTitleFontSize(scale: number) {
    ensureFontOverride()
    const current = fontOverride.value!.titleOverride ?? {}
    fontOverride.value = {
      ...fontOverride.value!,
      titleOverride: { ...current, fontSizeScale: scale },
    }
  }

  function setArtistFontSize(scale: number) {
    ensureFontOverride()
    const current = fontOverride.value!.artistOverride ?? {}
    fontOverride.value = {
      ...fontOverride.value!,
      artistOverride: { ...current, fontSizeScale: scale },
    }
  }

  function setTextAlign(align: 'left' | 'center' | 'right' | null) {
    textAlign.value = align
  }

  function setFontSizeScale(s: number) {
    fontSizeScale.value = s
  }

  function setGrainEnabled(g: boolean) {
    grainEnabled.value = g
  }

  function toggleStoreBadge(id: StoreBadgeId) {
    const idx = storeBadges.value.indexOf(id)
    if (idx >= 0) {
      storeBadges.value = storeBadges.value.filter(b => b !== id)
    } else {
      storeBadges.value = [...storeBadges.value, id]
    }
  }

  function reset() {
    palette.value = null
    preset.value = null
    selectedDirection.value = 'dark'
    accentOverride.value = null
    backgroundTheme.value = 'dark'
    selectedFilter.value = null
    fontOverride.value = null
    fontSizeScale.value = 1.0
    grainEnabled.value = true
    storeBadges.value = []
    imageBackgroundId.value = null
    solidBackgroundColor.value = null
    textAlign.value = null
  }

  return {
    palette,
    preset,
    selectedDirection,
    accentOverride,
    backgroundTheme,
    selectedFilter,
    fontOverride,
    fontSizeScale,
    grainEnabled,
    storeBadges,
    imageBackgroundId,
    solidBackgroundColor,
    resolvedStyle,
    effectiveAccent,
    setPalette,
    setPreset,
    setDirection,
    setAccentOverride,
    setBackgroundTheme,
    setImageBackground,
    setSolidBackgroundColor,
    setFilter,
    setFontOverride,
    setFontPairing,
    setTitleBold,
    setTitleCaps,
    setArtistBold,
    setArtistCaps,
    setTitleFont,
    setArtistFont,
    setTitleFontSize,
    setArtistFontSize,
    textAlign,
    setTextAlign,
    setFontSizeScale,
    setGrainEnabled,
    toggleStoreBadge,
    reset,
  }
})
