// ── API Types ──────────────────────────────────────────────

export interface Artist {
  position: number
  artistId: number
  name: string
  isPlanArtist?: boolean
  isVarious?: boolean
  profileImage: string | null
  type: number
}

export interface ReleaseListItem {
  id: number
  artists: Artist[]
  status: string
  releaseDate: string
  title: string
  artwork: string
  musicType: 'single' | 'ep' | 'album'
}

export interface ReleasesResponse {
  meta: {
    currentPage: number
    perPage: number
    totalCount: number
    pagesCount: number
  }
  data: ReleaseListItem[]
}

export interface Genre {
  id: number
  name: string
}

export interface Label {
  id: number
  name: string
}

export interface ReleaseDetail {
  id: number
  title: string
  musicType: 'single' | 'ep' | 'album'
  releaseDate: string
  artwork: string
  smartLink: string
  primaryGenre: Genre | null
  secondaryGenre: Genre | null
  artists: Artist[]
  label: Label
  copyrightHolder: string
  copyrightYear: number
  language: {
    id: number
    name: string
    abbreviation: string
  }
}

// ── Style Engine Types ─────────────────────────────────────

export interface Palette {
  dominant: string
  accent: string
  neutral: string
  text: string
  gradient: [string, string]
}

export type StyleFamily =
  | 'urban-street'
  | 'electronic-dance'
  | 'soulful-smooth'
  | 'rock-punk-metal'
  | 'pop-mainstream'
  | 'acoustic-organic'
  | 'latin-world'
  | 'chill-ambient'

export type LayoutBias = 'bold-centered' | 'editorial' | 'minimal' | 'stacked'

export interface StylePreset {
  id: StyleFamily
  name: string
  headingFont: string
  headingFontUrl: string
  bodyFont: string
  bodyFontUrl: string
  fontWeight: 'light' | 'regular' | 'bold' | 'black'
  textTransform: 'uppercase' | 'none' | 'lowercase'
  layoutBias: LayoutBias
}

export type StyleDirectionId = 'dark' | 'light' | 'full-bleed' | 'duotone'

export type BackgroundThemeId =
  | StyleDirectionId
  | 'artwork-blur'
  | 'gradient-sweep'
  | 'gradient-radial'
  | 'mesh-glow'
  | 'split-tone'
  | 'custom-image'
  | 'solid-color'

export type FilterId =
  | 'greyscale' | 'high-contrast' | 'warm-vintage' | 'cool-tone' | 'glitch'
  | 'sepia' | 'noir' | 'vaporwave' | 'film-fade' | 'halftone' | 'chromatic' | 'posterize'

export interface FontOption {
  id: string
  name: string
  family: string
  url: string
  category: 'display' | 'sans' | 'serif' | 'mono' | 'handwriting' | 'novelty'
}

export interface FontPairing {
  id: string
  name: string
  headingFont: string
  headingFontUrl: string
  bodyFont: string
  bodyFontUrl: string
  fontWeight: 'light' | 'regular' | 'bold' | 'black'
  textTransform: 'uppercase' | 'none' | 'lowercase'
}

export interface BackgroundTheme {
  id: BackgroundThemeId
  name: string
  usesArtwork: boolean
}

export interface FilterDefinition {
  id: FilterId
  name: string
}

export interface StyleDirection {
  id: StyleDirectionId
  name: string
  description: string
}

export type StoreBadgeId =
  | 'spotify' | 'apple-music' | 'amazon-music' | 'youtube-music'
  | 'deezer' | 'tidal' | 'instagram' | 'tiktok' | 'vevo' | 'beatport'

export interface StoreBadgeDefinition {
  id: StoreBadgeId
  name: string
  color: string
  logoDark: string
  logoLight: string
}

export interface ImageBackground {
  id: string
  name: string
  url: string
  thumbnailUrl: string
  isLight: boolean
}

export interface TextElementOverride {
  font?: string
  fontUrl?: string
  fontSizeScale?: number
  fontWeight?: 'light' | 'regular' | 'bold' | 'black'
  textTransform?: 'uppercase' | 'none' | 'lowercase'
}

export interface FontOverride {
  headingFont: string
  bodyFont: string
  fontWeight?: 'light' | 'regular' | 'bold' | 'black'
  textTransform?: 'uppercase' | 'none' | 'lowercase'
  titleOverride?: TextElementOverride
  artistOverride?: TextElementOverride
}

export interface ResolvedStyle {
  preset: StylePreset
  direction: StyleDirectionId
  backgroundTheme: BackgroundThemeId
  palette: Palette
  accentOverride: string | null
  filter: FilterId | null
  fontOverride: FontOverride | null
  fontSizeScale: number
  grain: boolean
  storeBadges: StoreBadgeId[]
  imageBackgroundId: string | null
  solidBackgroundColor: string | null
  textAlign?: 'left' | 'center' | 'right'
}

// ── Template Types ─────────────────────────────────────────

export type Platform = 'instagram' | 'twitter' | 'facebook' | 'youtube' | 'general'

export interface TemplateElement {
  type: 'artwork' | 'text' | 'logo' | 'gradient' | 'shape'
  position: { x: number; y: number; anchor: string }
  size: { width: number; height: number }
  style: Record<string, string | number>
  content?: string
  toggleable?: boolean
  visible?: boolean
}

export interface LayoutVariant {
  id: string
  name: string
  defaultAlign?: 'left' | 'center' | 'right'
  elements: TemplateElement[]
}

export interface AssetTemplate {
  id: string
  name: string
  platform: Platform
  format: string
  width: number
  height: number
  variants: LayoutVariant[]
}

// ── Asset Selection Types ──────────────────────────────────

export interface AssetSelection {
  templateId: string
  variantId: string
  overrides: {
    hiddenElements: string[]
    customText: string | null
  }
}

// ── Badge Logic ────────────────────────────────────────────

export type BadgeType = 'PRE-SAVE' | 'OUT NOW' | 'STREAM NOW'
