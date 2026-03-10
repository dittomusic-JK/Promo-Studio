<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useReleaseStore } from '@/stores/release'
import { useStyleStore } from '@/stores/style'
import { useAssetsStore } from '@/stores/assets'
import { usePalette } from '@/composables/usePalette'
import { useStyleEngine } from '@/composables/useStyleEngine'
import PreviewCanvas from '@/components/PreviewCanvas.vue'
import PaletteDisplay from '@/components/StyleEngine/PaletteDisplay.vue'
import StyleOverrides from '@/components/StyleEngine/StyleOverrides.vue'
import VariantPicker from '@/components/AssetCustomiser/VariantPicker.vue'
import ElementToggle from '@/components/AssetCustomiser/ElementToggle.vue'
import FontSelect from '@/components/AssetCustomiser/FontSelect.vue'
import { igPortrait, igSquare, igStory, twitterPost, twitterBanner, fbCover, pressHeader, emailBanner } from '@/lib/templates'
import { fontPairings, curatedFonts, loadFontByFamily } from '@/lib/fonts'
import type { AssetTemplate, BackgroundThemeId, FilterId, ResolvedStyle, FontPairing, FontOption } from '@/types'

const router = useRouter()
const releaseStore = useReleaseStore()
const styleStore = useStyleStore()
const assetsStore = useAssetsStore()
const { extractPalette } = usePalette()
const { getPresetForGenre, backgroundThemes, filterDefinitions, storeBadgeDefinitions, imageBackgrounds } = useStyleEngine()

const heroTemplate = igPortrait
const heroVariantId = ref(heroTemplate.variants[0]!.id)
const heroHiddenElements = ref<string[]>([])
const loading = ref(true)
const bgTab = ref<'generated' | 'image' | 'solid'>('generated')
const previewMode = ref<'single' | 'multi'>('single')

// Multi-preview templates: representative sizes
const previewTemplates: { label: string; template: AssetTemplate }[] = [
  { label: 'Square', template: igSquare },
  { label: 'Portrait', template: igPortrait },
  { label: 'Landscape', template: twitterPost },
  { label: 'Story', template: igStory },
  { label: 'Twitter Banner', template: twitterBanner },
  { label: 'FB Cover', template: fbCover },
  { label: 'Press Header', template: pressHeader },
  { label: 'Email Banner', template: emailBanner },
]

// Resolve best matching variant for multi-preview (match by ID, then by name)
function resolveVariantId(template: AssetTemplate): string {
  const heroVariant = heroTemplate.variants.find(v => v.id === heroVariantId.value)
  if (!heroVariant) return template.variants[0]!.id

  // Exact ID match
  const byId = template.variants.find(v => v.id === heroVariant.id)
  if (byId) return byId.id

  // Match by name (case-insensitive)
  const byName = template.variants.find(
    v => v.name.toLowerCase() === heroVariant.name.toLowerCase()
  )
  if (byName) return byName.id

  // Fallback to first variant
  return template.variants[0]!.id
}

// Solid colour presets
const solidColorPresets = [
  '#000000', '#ffffff', '#1a1a2e', '#2d3436',
  '#d63031', '#e17055', '#fdcb6e', '#00b894',
  '#0984e3', '#6c5ce7', '#e84393', '#00cec9',
]
const customSolidColor = ref('#f8b4c8')

const heroOverrides = computed(() => ({
  hiddenElements: heroHiddenElements.value,
  customText: null,
}))

// Build a ResolvedStyle per theme for thumbnails
function styleForTheme(themeId: BackgroundThemeId): ResolvedStyle | null {
  if (!styleStore.palette || !styleStore.preset) return null
  return {
    preset: styleStore.preset,
    direction: themeId === 'light' ? 'light' : 'dark',
    backgroundTheme: themeId,
    palette: styleStore.palette,
    accentOverride: styleStore.accentOverride,
    filter: styleStore.selectedFilter,
    fontOverride: styleStore.fontOverride,
    fontSizeScale: styleStore.fontSizeScale,
    grain: styleStore.grainEnabled,
    storeBadges: styleStore.storeBadges,
    imageBackgroundId: null,
    solidBackgroundColor: null,
    textAlign: styleStore.textAlign ?? undefined,
  }
}

const fontSizeOptions = [
  { label: 'S', value: 0.8 },
  { label: 'M', value: 1.0 },
  { label: 'L', value: 1.2 },
  { label: 'XL', value: 1.5 },
]

// ── Font categories for grouped dropdown ────────────────
const fontCategories: { label: string; key: FontOption['category'] }[] = [
  { label: 'Display', key: 'display' },
  { label: 'Sans Serif', key: 'sans' },
  { label: 'Serif', key: 'serif' },
  { label: 'Mono', key: 'mono' },
  { label: 'Handwriting', key: 'handwriting' },
  { label: 'Novelty', key: 'novelty' },
]

// ── Per-element font resolution ─────────────────────────
const titleFont = computed(() =>
  styleStore.fontOverride?.titleOverride?.font
    ?? styleStore.fontOverride?.headingFont
    ?? styleStore.preset?.headingFont
    ?? ''
)

const artistFont = computed(() =>
  styleStore.fontOverride?.artistOverride?.font
    ?? styleStore.fontOverride?.bodyFont
    ?? styleStore.preset?.bodyFont
    ?? ''
)

const titleFontSize = computed(() =>
  styleStore.fontOverride?.titleOverride?.fontSizeScale
    ?? styleStore.fontSizeScale
)

const artistFontSize = computed(() =>
  styleStore.fontOverride?.artistOverride?.fontSizeScale
    ?? styleStore.fontSizeScale
)

function selectTitleFont(family: string) {
  const font = curatedFonts.find(f => f.family === family)
  if (font) styleStore.setTitleFont(font.family, font.url)
}

function selectArtistFont(family: string) {
  const font = curatedFonts.find(f => f.family === family)
  if (font) styleStore.setArtistFont(font.family, font.url)
}

onMounted(async () => {
  if (!releaseStore.selectedRelease) {
    router.push({ name: 'select-release' })
    return
  }

  const release = releaseStore.selectedRelease
  const palette = await extractPalette(release.artwork)
  styleStore.setPalette(palette)

  const preset = getPresetForGenre(release.primaryGenre?.id ?? null)
  styleStore.setPreset(preset)

  // Pre-load preset pairing fonts
  for (const p of fontPairings.slice(0, 4)) {
    loadFontByFamily(p.headingFont, p.headingFontUrl)
    loadFontByFamily(p.bodyFont, p.bodyFontUrl)
  }
  // Pre-load curated fonts for dropdown preview (fire-and-forget)
  for (const f of curatedFonts) {
    loadFontByFamily(f.family, f.url)
  }

  loading.value = false
})

function selectTheme(id: BackgroundThemeId) {
  styleStore.setBackgroundTheme(id)
}

function selectImageBg(id: string) {
  styleStore.setImageBackground(id)
}

function selectFilter(id: FilterId | null) {
  styleStore.setFilter(id)
}

function selectPairing(pairing: FontPairing | null) {
  styleStore.setFontPairing(pairing)
}

function isPairingActive(pairing: FontPairing): boolean {
  return styleStore.fontOverride?.headingFont === pairing.headingFont
    && styleStore.fontOverride?.bodyFont === pairing.bodyFont
}

// ── Text control toggle state ──────────────────────────────

const isTitleBold = computed(() => {
  const ov = styleStore.fontOverride?.titleOverride
  if (ov?.fontWeight) return ov.fontWeight === 'bold' || ov.fontWeight === 'black'
  const g = styleStore.fontOverride?.fontWeight ?? styleStore.preset?.fontWeight ?? 'regular'
  return g === 'bold' || g === 'black'
})

const isTitleCaps = computed(() => {
  const ov = styleStore.fontOverride?.titleOverride
  if (ov?.textTransform) return ov.textTransform === 'uppercase'
  const g = styleStore.fontOverride?.textTransform ?? styleStore.preset?.textTransform ?? 'none'
  return g === 'uppercase'
})

const isArtistBold = computed(() => {
  const ov = styleStore.fontOverride?.artistOverride
  if (ov?.fontWeight) return ov.fontWeight === 'bold' || ov.fontWeight === 'black'
  return false
})

const isArtistCaps = computed(() => {
  const ov = styleStore.fontOverride?.artistOverride
  if (ov?.textTransform) return ov.textTransform === 'uppercase'
  const g = styleStore.fontOverride?.textTransform ?? styleStore.preset?.textTransform ?? 'none'
  return g === 'uppercase'
})

// ── Global text alignment state ──────────────────────────────

const globalAlign = computed<'left' | 'center' | 'right'>(() =>
  styleStore.textAlign ?? 'center'
)

// ── Solid colour handlers ───────────────────────────────────

function selectSolidColor(color: string) {
  customSolidColor.value = color
  styleStore.setSolidBackgroundColor(color)
}

function proceed() {
  assetsStore.selectAll()
  assetsStore.applyGlobalOverrides(heroVariantId.value, heroHiddenElements.value)
  router.push({ name: 'export-formats' })
}

function goBack() {
  styleStore.reset()
  router.push({ name: 'select-release' })
}
</script>

<template>
  <div class="design-studio">
    <div class="section-header">
      <h1 class="section-header__title">Design Studio</h1>
      <p class="section-header__subtitle">
        Customise your promo style with a live preview.
      </p>
    </div>

    <div v-if="loading" class="design-studio__loading">
      <div class="shimmer" style="width: 100%; height: 400px;" />
    </div>

    <div v-else-if="styleStore.resolvedStyle && releaseStore.selectedRelease" class="design-studio__layout">
      <!-- Live Preview -->
      <div class="design-studio__preview">
        <div class="design-studio__preview-tabs">
          <button
            :class="['design-studio__pill design-studio__pill--sm', { 'design-studio__pill--active': previewMode === 'single' }]"
            @click="previewMode = 'single'"
          >
            Single
          </button>
          <button
            :class="['design-studio__pill design-studio__pill--sm', { 'design-studio__pill--active': previewMode === 'multi' }]"
            @click="previewMode = 'multi'"
          >
            All Sizes
          </button>
        </div>

        <!-- Single preview -->
        <PreviewCanvas
          v-if="previewMode === 'single'"
          :template="heroTemplate"
          :variant-id="heroVariantId"
          :release="releaseStore.selectedRelease"
          :style-config="styleStore.resolvedStyle"
          :overrides="heroOverrides"
          :max-width="600"
        />

        <!-- Multi-size preview grid -->
        <div v-else class="design-studio__multi-preview">
          <div
            v-for="p in previewTemplates"
            :key="p.template.id"
            class="design-studio__multi-item"
          >
            <PreviewCanvas
              :template="p.template"
              :variant-id="resolveVariantId(p.template)"
              :release="releaseStore.selectedRelease"
              :style-config="styleStore.resolvedStyle"
              :overrides="heroOverrides"
              :max-width="280"
            />
            <span class="design-studio__multi-label">{{ p.label }}</span>
          </div>
        </div>
      </div>

      <!-- Controls Panel -->
      <div class="design-studio__controls">
        <!-- Background Theme -->
        <div class="design-studio__section">
          <h3 class="design-studio__section-title">Background Theme</h3>
          <div class="design-studio__pills" style="margin-bottom: 0.5rem;">
            <button
              :class="['design-studio__pill', { 'design-studio__pill--active': bgTab === 'generated' }]"
              @click="bgTab = 'generated'"
            >
              Generated
            </button>
            <button
              :class="['design-studio__pill', { 'design-studio__pill--active': bgTab === 'image' }]"
              @click="bgTab = 'image'"
            >
              Image
            </button>
            <button
              :class="['design-studio__pill', { 'design-studio__pill--active': bgTab === 'solid' }]"
              @click="bgTab = 'solid'"
            >
              Solid
            </button>
          </div>

          <!-- Generated themes -->
          <div v-if="bgTab === 'generated'" class="design-studio__themes">
            <div
              v-for="theme in backgroundThemes.filter(t => t.id !== 'solid-color')"
              :key="theme.id"
              :class="['design-studio__theme-card', { 'design-studio__theme-card--selected': styleStore.backgroundTheme === theme.id }]"
              @click="selectTheme(theme.id)"
            >
              <div class="design-studio__theme-preview">
                <PreviewCanvas
                  v-if="styleForTheme(theme.id)"
                  :template="heroTemplate"
                  :variant-id="heroVariantId"
                  :release="releaseStore.selectedRelease!"
                  :style-config="styleForTheme(theme.id)!"
                  :overrides="heroOverrides"
                  :max-width="110"
                />
              </div>
              <span class="design-studio__theme-name">{{ theme.name }}</span>
            </div>
          </div>

          <!-- Image backgrounds -->
          <div v-if="bgTab === 'image'" class="design-studio__themes design-studio__themes--4col">
            <div
              v-for="bg in imageBackgrounds"
              :key="bg.id"
              :class="['design-studio__theme-card', { 'design-studio__theme-card--selected': styleStore.imageBackgroundId === bg.id }]"
              @click="selectImageBg(bg.id)"
            >
              <div class="design-studio__theme-preview design-studio__theme-preview--img">
                <img :src="bg.thumbnailUrl" :alt="bg.name" loading="lazy" />
              </div>
              <span class="design-studio__theme-name">{{ bg.name }}</span>
            </div>
          </div>

          <!-- Solid colour backgrounds -->
          <div v-if="bgTab === 'solid'" class="design-studio__solid-colors">
            <div class="design-studio__color-swatches">
              <button
                v-for="color in solidColorPresets"
                :key="color"
                :class="['design-studio__color-swatch', { 'design-studio__color-swatch--active': styleStore.solidBackgroundColor === color }]"
                :style="{ backgroundColor: color }"
                @click="selectSolidColor(color)"
              />
            </div>
            <div class="design-studio__color-custom">
              <label class="design-studio__color-label">Custom</label>
              <input
                type="color"
                :value="customSolidColor"
                class="design-studio__color-input"
                @input="selectSolidColor(($event.target as HTMLInputElement).value)"
              />
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="design-studio__section">
          <h3 class="design-studio__section-title">Filter</h3>
          <div class="design-studio__pills">
            <button
              :class="['design-studio__pill', { 'design-studio__pill--active': !styleStore.selectedFilter }]"
              @click="selectFilter(null)"
            >
              None
            </button>
            <button
              v-for="filter in filterDefinitions"
              :key="filter.id"
              :class="['design-studio__pill', { 'design-studio__pill--active': styleStore.selectedFilter === filter.id }]"
              @click="selectFilter(filter.id)"
            >
              {{ filter.name }}
            </button>
          </div>
        </div>

        <!-- Store Badges -->
        <div class="design-studio__section">
          <h3 class="design-studio__section-title">Store Badges</h3>
          <div class="design-studio__pills">
            <button
              v-for="badge in storeBadgeDefinitions"
              :key="badge.id"
              :class="['design-studio__pill', { 'design-studio__pill--active': styleStore.storeBadges.includes(badge.id) }]"
              @click="styleStore.toggleStoreBadge(badge.id)"
            >
              {{ badge.name }}
            </button>
          </div>
        </div>

        <!-- Palette -->
        <div v-if="styleStore.palette" class="design-studio__section">
          <PaletteDisplay :palette="styleStore.palette" />
        </div>

        <!-- Accent Override -->
        <div class="design-studio__section">
          <StyleOverrides />
        </div>

        <!-- Typography -->
        <div class="design-studio__section">
          <h3 class="design-studio__section-title">Typography</h3>

          <!-- Style Presets Carousel -->
          <div class="design-studio__preset-carousel">
            <button
              :class="['design-studio__preset-card', { 'design-studio__preset-card--active': !styleStore.fontOverride }]"
              @click="selectPairing(null)"
            >
              <span class="design-studio__preset-preview" :style="{ fontFamily: styleStore.preset?.headingFont }">Aa</span>
              <span class="design-studio__preset-name">Default</span>
            </button>
            <button
              v-for="p in fontPairings"
              :key="p.id"
              :class="['design-studio__preset-card', { 'design-studio__preset-card--active': isPairingActive(p) }]"
              @click="selectPairing(p)"
            >
              <span class="design-studio__preset-preview" :style="{ fontFamily: p.headingFont }">Aa</span>
              <span class="design-studio__preset-name">{{ p.name }}</span>
            </button>
          </div>

          <!-- Global Text Alignment -->
          <div class="design-studio__element-row" style="margin-bottom: 0.5rem;">
            <span class="design-studio__element-label">Alignment</span>
            <div class="design-studio__text-control-buttons">
              <button
                :class="['design-studio__text-toggle', { 'design-studio__text-toggle--active': globalAlign === 'left' }]"
                @click="styleStore.setTextAlign('left')"
                title="Align Left"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 2h12M1 5h8M1 8h10M1 11h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
              </button>
              <button
                :class="['design-studio__text-toggle', { 'design-studio__text-toggle--active': globalAlign === 'center' }]"
                @click="styleStore.setTextAlign('center')"
                title="Align Center"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 2h12M3 5h8M2 8h10M4 11h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
              </button>
              <button
                :class="['design-studio__text-toggle', { 'design-studio__text-toggle--active': globalAlign === 'right' }]"
                @click="styleStore.setTextAlign('right')"
                title="Align Right"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 2h12M5 5h8M3 8h10M7 11h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
              </button>
            </div>
          </div>

          <!-- Title Controls -->
          <div class="design-studio__element-controls">
            <span class="design-studio__element-label">Title</span>
            <FontSelect
              :model-value="titleFont"
              :fonts="curatedFonts"
              :categories="fontCategories"
              @update:model-value="selectTitleFont"
            />
            <div class="design-studio__element-row">
              <div class="design-studio__size-pills">
                <button
                  v-for="size in fontSizeOptions"
                  :key="size.value"
                  :class="['design-studio__pill design-studio__pill--sm', { 'design-studio__pill--active': titleFontSize === size.value }]"
                  @click="styleStore.setTitleFontSize(size.value)"
                >
                  {{ size.label }}
                </button>
              </div>
              <div class="design-studio__text-control-buttons">
                <button
                  :class="['design-studio__text-toggle', { 'design-studio__text-toggle--active': isTitleBold }]"
                  @click="styleStore.setTitleBold(!isTitleBold)"
                  title="Bold"
                >
                  <strong>B</strong>
                </button>
                <button
                  :class="['design-studio__text-toggle', { 'design-studio__text-toggle--active': isTitleCaps }]"
                  @click="styleStore.setTitleCaps(!isTitleCaps)"
                  title="All Caps"
                >
                  AA
                </button>
              </div>
            </div>
          </div>

          <!-- Artist Name Controls -->
          <div class="design-studio__element-controls">
            <span class="design-studio__element-label">Artist Name</span>
            <FontSelect
              :model-value="artistFont"
              :fonts="curatedFonts"
              :categories="fontCategories"
              @update:model-value="selectArtistFont"
            />
            <div class="design-studio__element-row">
              <div class="design-studio__size-pills">
                <button
                  v-for="size in fontSizeOptions"
                  :key="size.value"
                  :class="['design-studio__pill design-studio__pill--sm', { 'design-studio__pill--active': artistFontSize === size.value }]"
                  @click="styleStore.setArtistFontSize(size.value)"
                >
                  {{ size.label }}
                </button>
              </div>
              <div class="design-studio__text-control-buttons">
                <button
                  :class="['design-studio__text-toggle', { 'design-studio__text-toggle--active': isArtistBold }]"
                  @click="styleStore.setArtistBold(!isArtistBold)"
                  title="Bold"
                >
                  <strong>B</strong>
                </button>
                <button
                  :class="['design-studio__text-toggle', { 'design-studio__text-toggle--active': isArtistCaps }]"
                  @click="styleStore.setArtistCaps(!isArtistCaps)"
                  title="All Caps"
                >
                  AA
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Layout Variant -->
        <div class="design-studio__section">
          <VariantPicker
            :template="heroTemplate"
            :selected="heroVariantId"
            @select="(vid: string) => {
              heroVariantId = vid
              const v = heroTemplate.variants.find(v => v.id === vid)
              styleStore.setTextAlign(v?.defaultAlign ?? null)
            }"
          />
        </div>

        <!-- Toggle Elements -->
        <div class="design-studio__section">
          <ElementToggle
            :template="heroTemplate"
            :variant-id="heroVariantId"
            :hidden-elements="heroHiddenElements"
            @toggle="(els: string[]) => heroHiddenElements = els"
          />
        </div>

        <!-- Film Grain -->
        <div class="design-studio__section design-studio__section--row">
          <h3 class="design-studio__section-title" style="margin-bottom: 0;">Film Grain</h3>
          <label class="design-studio__toggle">
            <input
              type="checkbox"
              :checked="styleStore.grainEnabled"
              @change="styleStore.setGrainEnabled(($event.target as HTMLInputElement).checked)"
            />
            <span class="design-studio__toggle-track" />
          </label>
        </div>
      </div>
    </div>

    <div class="design-studio__actions">
      <button class="btn btn--ghost" @click="goBack">Back</button>
      <button class="btn btn--gradient btn--lg" @click="proceed" :disabled="loading">
        Continue to Export
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens' as *;

.design-studio {
  &__loading {
    margin-top: 1.5rem;
  }

  &__layout {
    display: grid;
    grid-template-columns: 1fr 420px;
    gap: 2rem;
    margin-top: 1.5rem;

    @media (max-width: $bp-md) {
      grid-template-columns: 1fr;
    }
  }

  &__preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: $surface-1;
    border-radius: $radius-lg;
    padding: 1.5rem;
    min-height: 400px;
    border: 1px solid $border-subtle;
    gap: 1rem;
  }

  &__preview-tabs {
    display: flex;
    gap: 0.25rem;
    align-self: flex-start;
  }

  &__multi-preview {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    width: 100%;
  }

  &__multi-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.375rem;

    :deep(.preview-canvas) {
      max-height: 280px;
      width: auto !important;
      height: auto !important;
    }
  }

  &__multi-label {
    font-size: 0.625rem;
    font-weight: 600;
    color: $text-muted;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  &__controls {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    background: $glass-bg;
    border: 1px solid $glass-border;
    border-radius: $radius-lg;
    padding: 1.25rem;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    max-height: calc(100vh - 180px);
    overflow-y: auto;
    position: sticky;
    top: 1rem;
  }

  &__section {
    padding: 0.75rem 0;

    &:not(:last-child) {
      border-bottom: 1px solid $border-subtle;
    }

    &-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: $text-primary;
      margin-bottom: 0.625rem;
    }

    &--row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }

  // ── Theme Grid ──────────────────────────────────────────

  &__themes {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;

    &--4col {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  &__theme-card {
    cursor: pointer;
    border: 2px solid $border-subtle;
    border-radius: $radius-md;
    overflow: hidden;
    transition: all 0.25s ease;
    background: $surface-2;

    &:hover {
      border-color: rgba($brand-primary, 0.4);
    }

    &--selected {
      border-color: $brand-primary;
      box-shadow: $glow-primary-sm;
    }
  }

  &__theme-preview {
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $surface-3;
    aspect-ratio: 4 / 5;

    :deep(.preview-canvas) {
      border-radius: 0;
      box-shadow: none;
    }

    &--img {
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
    }
  }

  &__theme-name {
    display: block;
    padding: 0.25rem 0.375rem;
    font-size: 0.625rem;
    font-weight: 600;
    color: $text-secondary;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  // ── Pills (filters, font size, badges) ──────────────────

  &__pills {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
  }

  &__pill {
    padding: 0.375rem 0.75rem;
    border-radius: $radius-pill;
    border: 1px solid $border-subtle;
    background: $surface-2;
    color: $text-secondary;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: rgba($brand-primary, 0.4);
      color: $text-primary;
    }

    &--active {
      background: $brand-primary;
      border-color: $brand-primary;
      color: #fff;
      box-shadow: $glow-primary-sm;
    }

    &--sm {
      padding: 0.25rem 0.5rem;
      font-size: 0.6875rem;
    }
  }

  // ── Preset Carousel ──────────────────────────────────────

  &__preset-carousel {
    display: flex;
    gap: 0.375rem;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    padding-bottom: 0.375rem;
    margin-bottom: 0.75rem;

    // Thin scrollbar
    &::-webkit-scrollbar {
      height: 4px;
    }
    &::-webkit-scrollbar-track {
      background: $surface-2;
      border-radius: 2px;
    }
    &::-webkit-scrollbar-thumb {
      background: $border-subtle;
      border-radius: 2px;
    }
  }

  &__preset-card {
    flex: 0 0 72px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem 0.25rem 0.375rem;
    border-radius: $radius-md;
    border: 1px solid $border-subtle;
    background: $surface-2;
    cursor: pointer;
    scroll-snap-align: start;
    transition: all 0.2s ease;

    &:hover {
      border-color: rgba($brand-primary, 0.4);
    }

    &--active {
      border-color: $brand-primary;
      box-shadow: $glow-primary-sm;
      background: rgba($brand-primary, 0.1);
    }
  }

  &__preset-preview {
    font-size: 1.25rem;
    font-weight: 700;
    color: $text-primary;
    line-height: 1;
  }

  &__preset-name {
    font-size: 0.5rem;
    color: $text-muted;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    line-height: 1.2;
  }

  // ── Per-Element Controls ────────────────────────────────

  &__element-controls {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    padding: 0.5rem 0;

    &:not(:last-child) {
      border-bottom: 1px solid rgba($border-subtle, 0.5);
    }
  }

  &__element-label {
    font-size: 0.6875rem;
    font-weight: 600;
    color: $text-secondary;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  &__element-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  &__font-select {
    width: 100%;
    padding: 0.375rem 0.5rem;
    border-radius: $radius-sm;
    border: 1px solid $border-subtle;
    background: $surface-2;
    color: $text-primary;
    font-size: 0.8125rem;
    cursor: pointer;
    transition: border-color 0.2s ease;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23888' d='M3 5l3 3 3-3z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.5rem center;
    padding-right: 1.5rem;

    &:hover,
    &:focus {
      border-color: rgba($brand-primary, 0.4);
      outline: none;
    }

    option {
      background: $surface-2;
      color: $text-primary;
    }

    optgroup {
      font-weight: 600;
      color: $text-secondary;
    }
  }

  &__size-pills {
    display: flex;
    gap: 0.25rem;
  }

  &__text-control-buttons {
    display: flex;
    gap: 0.25rem;
  }

  &__text-toggle {
    width: 32px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: $radius-sm;
    border: 1px solid $border-subtle;
    background: $surface-2;
    color: $text-secondary;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: rgba($brand-primary, 0.4);
      color: $text-primary;
    }

    &--active {
      background: $brand-primary;
      border-color: $brand-primary;
      color: #fff;
      box-shadow: $glow-primary-sm;
    }
  }

  &__separator {
    display: inline-block;
    width: 1px;
    height: 20px;
    background: $border-subtle;
    margin: 0 0.125rem;
  }

  // ── Solid Colour Swatches ────────────────────────────────

  &__solid-colors {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__color-swatches {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
  }

  &__color-swatch {
    width: 32px;
    height: 32px;
    border-radius: $radius-sm;
    border: 2px solid $border-subtle;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: rgba($brand-primary, 0.4);
      transform: scale(1.1);
    }

    &--active {
      border-color: $brand-primary;
      box-shadow: $glow-primary-sm;
      transform: scale(1.1);
    }
  }

  &__color-custom {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__color-label {
    font-size: 0.6875rem;
    font-weight: 600;
    color: $text-secondary;
  }

  &__color-input {
    width: 40px;
    height: 28px;
    border: 1px solid $border-subtle;
    border-radius: $radius-sm;
    background: transparent;
    cursor: pointer;
    padding: 0;

    &::-webkit-color-swatch-wrapper {
      padding: 2px;
    }
    &::-webkit-color-swatch {
      border: none;
      border-radius: 3px;
    }
  }

  // ── Grain Toggle ────────────────────────────────────────

  &__toggle {
    position: relative;
    display: inline-block;
    cursor: pointer;

    input {
      opacity: 0;
      width: 0;
      height: 0;
      position: absolute;
    }

    input:checked + .design-studio__toggle-track {
      background: $brand-primary;
    }

    input:checked + .design-studio__toggle-track::after {
      transform: translateX(18px);
    }
  }

  &__toggle-track {
    display: block;
    width: 42px;
    height: 24px;
    border-radius: 12px;
    background: $surface-3;
    transition: background 0.25s ease;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      top: 3px;
      left: 3px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #fff;
      transition: transform 0.25s ease;
    }
  }

  // ── Actions ─────────────────────────────────────────────

  &__actions {
    display: flex;
    justify-content: space-between;
    padding-top: 2rem;
    margin-top: 2rem;
    border-top: 1px solid $border-subtle;
  }
}
</style>
