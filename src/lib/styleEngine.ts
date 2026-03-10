import type { StyleFamily, StylePreset, StyleDirection, BackgroundTheme, FilterDefinition } from '@/types'
import { getFontConfig } from './fonts'

// ── Genre → Style Family Mapping ───────────────────────────

const genreToFamily: Record<number, StyleFamily> = {
  // Urban/Street
  26: 'urban-street',   // Hip-Hop/Rap
  174: 'urban-street',  // Afro-Beat
  179: 'urban-street',  // Amapiano
  187: 'urban-street',  // Afrobeats

  // Electronic/Dance
  18: 'electronic-dance',  // Electronic
  20: 'electronic-dance',  // Experimental
  171: 'electronic-dance', // Afro House
  21: 'electronic-dance',  // Fitness

  // Soulful/Smooth
  43: 'soulful-smooth',  // R&B
  51: 'soulful-smooth',  // Soul
  31: 'soulful-smooth',  // Jazz
  172: 'soulful-smooth', // Afro Soul
  223: 'soulful-smooth', // Bossa Nova

  // Rock/Punk/Metal
  48: 'rock-punk-metal', // Rock
  2: 'rock-punk-metal',  // Alt Rock
  42: 'rock-punk-metal', // Punk
  37: 'rock-punk-metal', // Metal

  // Pop/Mainstream
  40: 'pop-mainstream', // Pop
  32: 'pop-mainstream', // K-Pop
  30: 'pop-mainstream', // J-Pop
  23: 'pop-mainstream', // French Pop
  25: 'pop-mainstream', // German Pop

  // Acoustic/Organic
  22: 'acoustic-organic', // Folk
  50: 'acoustic-organic', // Singer/Songwriter
  14: 'acoustic-organic', // Country

  // Latin/World
  13: 'latin-world',  // Contemporary Latin
  47: 'latin-world',  // Regional Mexicano
  218: 'latin-world', // Samba
  229: 'latin-world', // Punjabi

  // Chill/Ambient
  38: 'chill-ambient', // New Age
  16: 'chill-ambient', // Easy Listening
  29: 'chill-ambient', // Instrumental
}

// ── Style Presets ──────────────────────────────────────────

const presetConfigs: Record<StyleFamily, Omit<StylePreset, 'headingFontUrl' | 'bodyFontUrl'>> = {
  'urban-street': {
    id: 'urban-street',
    name: 'Urban / Street',
    headingFont: 'Oswald',
    bodyFont: 'DM Sans',
    fontWeight: 'black',
    textTransform: 'uppercase',
    layoutBias: 'bold-centered',
  },
  'electronic-dance': {
    id: 'electronic-dance',
    name: 'Electronic / Dance',
    headingFont: 'Chakra Petch',
    bodyFont: 'Space Mono',
    fontWeight: 'regular',
    textTransform: 'uppercase',
    layoutBias: 'minimal',
  },
  'soulful-smooth': {
    id: 'soulful-smooth',
    name: 'Soulful / Smooth',
    headingFont: 'Playfair Display',
    bodyFont: 'Nunito',
    fontWeight: 'light',
    textTransform: 'none',
    layoutBias: 'editorial',
  },
  'rock-punk-metal': {
    id: 'rock-punk-metal',
    name: 'Rock / Punk / Metal',
    headingFont: 'Anton',
    bodyFont: 'Work Sans',
    fontWeight: 'black',
    textTransform: 'uppercase',
    layoutBias: 'bold-centered',
  },
  'pop-mainstream': {
    id: 'pop-mainstream',
    name: 'Pop / Mainstream',
    headingFont: 'Poppins',
    bodyFont: 'Nunito',
    fontWeight: 'bold',
    textTransform: 'none',
    layoutBias: 'stacked',
  },
  'acoustic-organic': {
    id: 'acoustic-organic',
    name: 'Acoustic / Organic',
    headingFont: 'Crimson Text',
    bodyFont: 'Source Serif 4',
    fontWeight: 'regular',
    textTransform: 'none',
    layoutBias: 'editorial',
  },
  'latin-world': {
    id: 'latin-world',
    name: 'Latin / World',
    headingFont: 'Abril Fatface',
    bodyFont: 'Raleway',
    fontWeight: 'bold',
    textTransform: 'none',
    layoutBias: 'bold-centered',
  },
  'chill-ambient': {
    id: 'chill-ambient',
    name: 'Chill / Ambient',
    headingFont: 'Quicksand',
    bodyFont: 'Tenor Sans',
    fontWeight: 'light',
    textTransform: 'lowercase',
    layoutBias: 'minimal',
  },
}

/**
 * Get the style preset for a given genre ID.
 * Falls back to pop-mainstream if genre is null or unmapped.
 */
export function getPresetForGenre(genreId: number | null): StylePreset {
  const family = genreId !== null ? (genreToFamily[genreId] ?? 'pop-mainstream') : 'pop-mainstream'
  const config = presetConfigs[family]
  const fonts = getFontConfig(family)

  return {
    ...config,
    headingFontUrl: fonts.heading.url,
    bodyFontUrl: fonts.body.url,
  }
}

/**
 * The 4 style directions available for every release.
 */
export const styleDirections: StyleDirection[] = [
  {
    id: 'dark',
    name: 'Dark Mode',
    description: 'Dark dominant background with light text and accent highlights.',
  },
  {
    id: 'light',
    name: 'Light Mode',
    description: 'Clean white background with dark text and colour accents.',
  },
  {
    id: 'full-bleed',
    name: 'Full Bleed',
    description: 'Artwork fills the background with gradient overlay and text.',
  },
  {
    id: 'duotone',
    name: 'Duotone',
    description: 'Artwork in duotone using your dominant and accent colours.',
  },
]

/**
 * All 9 background themes.
 */
export const backgroundThemes: BackgroundTheme[] = [
  { id: 'dark', name: 'Dark', usesArtwork: false },
  { id: 'light', name: 'Light', usesArtwork: false },
  { id: 'full-bleed', name: 'Full Bleed', usesArtwork: true },
  { id: 'duotone', name: 'Duotone', usesArtwork: true },
  { id: 'artwork-blur', name: 'Artwork Blur', usesArtwork: true },
  { id: 'gradient-sweep', name: 'Gradient Sweep', usesArtwork: false },
  { id: 'gradient-radial', name: 'Radial Glow', usesArtwork: false },
  { id: 'mesh-glow', name: 'Mesh Glow', usesArtwork: false },
  { id: 'split-tone', name: 'Split Tone', usesArtwork: false },
  { id: 'solid-color', name: 'Solid Colour', usesArtwork: false },
]

/**
 * Available post-processing filters.
 */
export const filterDefinitions: FilterDefinition[] = [
  { id: 'greyscale', name: 'Greyscale' },
  { id: 'high-contrast', name: 'High Contrast' },
  { id: 'warm-vintage', name: 'Warm' },
  { id: 'cool-tone', name: 'Cool' },
  { id: 'glitch', name: 'Glitch' },
  { id: 'sepia', name: 'Sepia' },
  { id: 'noir', name: 'Noir' },
  { id: 'vaporwave', name: 'Vaporwave' },
  { id: 'film-fade', name: 'Film Fade' },
  { id: 'halftone', name: 'Halftone' },
  { id: 'chromatic', name: 'Chromatic' },
  { id: 'posterize', name: 'Posterize' },
]
