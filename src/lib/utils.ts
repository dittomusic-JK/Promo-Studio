import type { BadgeType, ReleaseDetail } from '@/types'

/**
 * Generate a URL-safe slug from title and artist name.
 * e.g. "Scary" + "Stormzy" → "scary-stormzy"
 */
export function generateSlug(title: string, artistName: string): string {
  return `${title}-${artistName}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Determine badge text based on release date vs current date.
 */
export function getBadgeType(releaseDate: string): BadgeType {
  const release = new Date(releaseDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  release.setHours(0, 0, 0, 0)

  if (release > today) return 'PRE-SAVE'
  return 'OUT NOW'
}

/**
 * Check WCAG AA contrast ratio between two hex colours.
 * Returns true if ratio >= 4.5 (AA for normal text).
 */
export function hasGoodContrast(fg: string, bg: string): boolean {
  const fgLum = relativeLuminance(hexToRgb(fg))
  const bgLum = relativeLuminance(hexToRgb(bg))
  const ratio = contrastRatio(fgLum, bgLum)
  return ratio >= 4.5
}

/**
 * Choose white or black text based on which has better contrast against bg.
 */
export function getTextColour(bgHex: string): string {
  const bgLum = relativeLuminance(hexToRgb(bgHex))
  const whiteLum = relativeLuminance({ r: 255, g: 255, b: 255 })
  const blackLum = relativeLuminance({ r: 0, g: 0, b: 0 })
  const whiteRatio = contrastRatio(whiteLum, bgLum)
  const blackRatio = contrastRatio(blackLum, bgLum)
  return whiteRatio >= blackRatio ? '#ffffff' : '#111111'
}

/**
 * Get primary artist name from a release.
 */
export function getArtistName(release: ReleaseDetail): string {
  return release.artists[0]?.name ?? 'Unknown Artist'
}

/**
 * Format a release date for display on promo cards.
 * Only returns a date string for PRE-SAVE releases.
 * Format: "Thu 3rd Jan, 2025"
 */
export function formatReleaseDate(dateStr: string): string {
  if (getBadgeType(dateStr) !== 'PRE-SAVE') return ''

  const d = new Date(dateStr)
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const dayOfWeek = dayNames[d.getDay()]
  const date = d.getDate()
  const month = monthNames[d.getMonth()]
  const year = d.getFullYear()

  return `${dayOfWeek} ${date}${getOrdinal(date)} ${month}, ${year}`
}

function getOrdinal(n: number): string {
  if (n >= 11 && n <= 13) return 'th'
  switch (n % 10) {
    case 1: return 'st'
    case 2: return 'nd'
    case 3: return 'rd'
    default: return 'th'
  }
}

// ── Internal helpers ───────────────────────────────────────

interface RGB {
  r: number
  g: number
  b: number
}

function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  }
}

export function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')
  )
}

function relativeLuminance({ r, g, b }: RGB): number {
  const vals = [r, g, b].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * vals[0]! + 0.7152 * vals[1]! + 0.0722 * vals[2]!
}

function contrastRatio(lum1: number, lum2: number): number {
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  return (lighter + 0.05) / (darker + 0.05)
}
