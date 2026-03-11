import type { StoreBadgeId, StoreBadgeDefinition } from '@/types'

// ── SVG Logo Imports (dark = for light backgrounds, light = for dark backgrounds) ──

import spotifyDark from '@/assets/store-logos/spotify-dark.svg'
import spotifyLight from '@/assets/store-logos/spotify-light.svg'
import appleMusicDark from '@/assets/store-logos/apple-music-dark.svg'
import appleMusicLight from '@/assets/store-logos/apple-music-light.svg'
import amazonMusicDark from '@/assets/store-logos/amazon-music-dark.svg'
import amazonMusicLight from '@/assets/store-logos/amazon-music-light.svg'
import youtubeMusicDark from '@/assets/store-logos/youtube-music-dark.svg'
import youtubeMusicLight from '@/assets/store-logos/youtube-music-light.svg'
import deezerDark from '@/assets/store-logos/deezer-dark.svg'
import deezerLight from '@/assets/store-logos/deezer-light.svg'
import tidalDark from '@/assets/store-logos/tidal-dark.svg'
import tidalLight from '@/assets/store-logos/tidal-light.svg'
import instagramDark from '@/assets/store-logos/instagram-dark.svg'
import instagramLight from '@/assets/store-logos/instagram-light.svg'
import tiktokDark from '@/assets/store-logos/tiktok-dark.svg'
import tiktokLight from '@/assets/store-logos/tiktok-light.svg'
import vevoDark from '@/assets/store-logos/vevo-dark.svg'
import vevoLight from '@/assets/store-logos/vevo-light.svg'
import beatportDark from '@/assets/store-logos/beatport-dark.svg'
import beatportLight from '@/assets/store-logos/beatport-light.svg'

// ── Badge Definitions ──────────────────────────────────────

export const storeBadgeDefinitions: StoreBadgeDefinition[] = [
  { id: 'spotify', name: 'Spotify', color: '#1DB954', logoDark: spotifyDark, logoLight: spotifyLight },
  { id: 'apple-music', name: 'Apple Music', color: '#FC3C44', logoDark: appleMusicDark, logoLight: appleMusicLight },
  { id: 'amazon-music', name: 'Amazon Music', color: '#25D1DA', logoDark: amazonMusicDark, logoLight: amazonMusicLight },
  { id: 'youtube-music', name: 'YouTube Music', color: '#FF0000', logoDark: youtubeMusicDark, logoLight: youtubeMusicLight },
  { id: 'deezer', name: 'Deezer', color: '#A238FF', logoDark: deezerDark, logoLight: deezerLight },
  { id: 'tidal', name: 'Tidal', color: '#000000', logoDark: tidalDark, logoLight: tidalLight },
  { id: 'instagram', name: 'Instagram', color: '#E4405F', logoDark: instagramDark, logoLight: instagramLight },
  { id: 'tiktok', name: 'TikTok', color: '#000000', logoDark: tiktokDark, logoLight: tiktokLight },
  { id: 'vevo', name: 'Vevo', color: '#ED1C24', logoDark: vevoDark, logoLight: vevoLight },
  { id: 'beatport', name: 'Beatport', color: '#94D500', logoDark: beatportDark, logoLight: beatportLight },
]

// ── Logo Image Cache ───────────────────────────────────────

const logoCache = new Map<string, HTMLImageElement>()

function loadLogoImage(url: string): Promise<HTMLImageElement> {
  if (logoCache.has(url)) return Promise.resolve(logoCache.get(url)!)
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      logoCache.set(url, img)
      resolve(img)
    }
    img.onerror = reject
    img.src = url
  })
}

// ── Grid Layout ────────────────────────────────────────────

function getGridLayout(count: number): { cols: number; rows: number } {
  if (count <= 4) return { cols: count, rows: 1 }
  if (count <= 6) return { cols: Math.ceil(count / 2), rows: 2 }
  if (count <= 8) return { cols: 4, rows: 2 }
  return { cols: 5, rows: 2 }
}

// ── Badge Text Drawing ─────────────────────────────────────

function drawBadgeText(
  ctx: CanvasRenderingContext2D,
  text: string,
  xPos: number,
  y: number,
  fontSize: number,
  headingFont: string,
  lightTheme: boolean,
  needsShadow: boolean,
  align: 'center' | 'left' | 'right' = 'center',
) {
  const tracking = fontSize * 0.08

  ctx.save()
  ctx.font = `800 ${fontSize}px "${headingFont}", sans-serif`
  ctx.fillStyle = lightTheme ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.95)'
  ctx.textBaseline = 'top'

  if (needsShadow) {
    ctx.shadowColor = 'rgba(0,0,0,0.5)'
    ctx.shadowBlur = fontSize * 0.15
    ctx.shadowOffsetY = fontSize * 0.04
  }

  // Measure total width with tracking
  let totalWidth = 0
  for (let i = 0; i < text.length; i++) {
    totalWidth += ctx.measureText(text[i]!).width
    if (i < text.length - 1) totalWidth += tracking
  }

  // Draw character by character
  let textX: number
  if (align === 'left') textX = xPos
  else if (align === 'right') textX = xPos - totalWidth
  else textX = xPos - totalWidth / 2
  for (let i = 0; i < text.length; i++) {
    ctx.fillText(text[i]!, textX, y)
    textX += ctx.measureText(text[i]!).width + tracking
  }
  ctx.restore()
}

// ── Main Draw Function ─────────────────────────────────────

export async function drawStoreBadges(
  ctx: CanvasRenderingContext2D,
  badges: StoreBadgeId[],
  templateWidth: number,
  templateHeight: number,
  lightTheme: boolean,
  bodyFont: string,
  headingFont: string,
  badgeText: string | null,
  needsShadow?: boolean,
  globalTextAlign?: 'left' | 'center' | 'right' | null,
  region?: { x: number; y: number; width: number; height: number },
) {
  const hasBadgeText = badgeText != null && badgeText.trim() !== ''
  const hasStores = badges.length > 0

  // State D: nothing to draw
  if (!hasBadgeText && !hasStores) return

  // Contextual badge label based on store presence
  let displayBadgeText: string | null = null
  if (hasBadgeText) {
    if (badgeText === 'PRE-SAVE') {
      displayBadgeText = hasStores ? 'PRE-SAVE ON' : 'PRE-SAVE NOW'
    } else if (badgeText === 'OUT NOW') {
      displayBadgeText = hasStores ? 'LISTEN ON' : 'OUT NOW'
    } else {
      displayBadgeText = badgeText
    }
  }

  // Positioning: use explicit region if provided, else compute bottom strip from canvas
  let regionTop: number
  let contentLeft: number
  let contentRight: number
  let fontRef: number
  let bottomBound: number // y coordinate of usable area bottom

  if (region) {
    // Column layout: render within the specified region
    regionTop = region.y
    contentLeft = region.x
    contentRight = region.x + region.width
    // Use height as font reference — multipliers are calibrated for canvas height,
    // so scale up to compensate for the smaller region
    fontRef = region.height * 3.5
    bottomBound = region.y + region.height
  } else {
    // Default: bottom strip of canvas, sized by aspect ratio
    const aspect = templateWidth / templateHeight
    const isLandscape = aspect > 1.3
    let regionHeightPct: number
    let regionPadTopPct: number

    if (aspect > 2.2) {
      regionHeightPct = 0.22
      regionPadTopPct = 0.02
    } else if (isLandscape) {
      regionHeightPct = 0.25
      regionPadTopPct = 0.03
    } else if (aspect > 0.9) {
      regionHeightPct = 0.13
      regionPadTopPct = 0.015
    } else if (aspect < 0.65) {
      regionHeightPct = 0.18
      regionPadTopPct = 0.015
    } else {
      regionHeightPct = 0.16
      regionPadTopPct = 0.02
    }

    const regionHeight = Math.round(templateHeight * regionHeightPct)
    const regionPadTop = Math.round(templateHeight * regionPadTopPct)
    regionTop = templateHeight - regionHeight + regionPadTop
    const regionPadX = Math.round(templateWidth * 0.06)
    contentLeft = regionPadX
    contentRight = templateWidth - regionPadX
    fontRef = aspect > 2.2 ? Math.sqrt(templateWidth * templateHeight) : templateHeight
    bottomBound = templateHeight - Math.round(templateHeight * 0.015)
  }

  const availableWidth = contentRight - contentLeft
  const centerX = Math.round((contentLeft + contentRight) / 2)

  // Resolve alignment: global override > default center
  const resolvedAlign: 'center' | 'left' | 'right' = globalTextAlign ?? 'center'

  // Badge text position based on resolved alignment
  let textXPos: number
  if (resolvedAlign === 'left') textXPos = contentLeft
  else if (resolvedAlign === 'right') textXPos = contentRight
  else textXPos = centerX

  // State A: badge text only (no store badges)
  if (hasBadgeText && !hasStores) {
    const badgeFontSize = Math.round(fontRef * 0.045)
    const textY = regionTop + Math.round((bottomBound - regionTop - badgeFontSize) / 2)
    drawBadgeText(ctx, displayBadgeText!, textXPos, textY, badgeFontSize, headingFont, lightTheme, needsShadow ?? false, resolvedAlign)
    return
  }

  // Load store logo images
  const defs = storeBadgeDefinitions.filter(d => badges.includes(d.id))
  const logoImages = await Promise.all(
    defs.map(d => loadLogoImage(lightTheme ? d.logoDark : d.logoLight))
  )

  let logoAreaTop: number

  // State B: badge text + store badges (contextual label — smaller font)
  const regionGap = region ? Math.round(region.height * 0.04) : Math.round(templateHeight * 0.012)
  if (hasBadgeText) {
    const badgeFontSize = Math.round(fontRef * 0.025)
    drawBadgeText(ctx, displayBadgeText!, textXPos, regionTop, badgeFontSize, headingFont, lightTheme, needsShadow ?? false, resolvedAlign)
    logoAreaTop = regionTop + badgeFontSize + regionGap
  } else {
    // State C: store badges only (with "Listen On:" header)
    const headerFontSize = Math.round(fontRef * 0.016)
    ctx.save()
    ctx.font = `600 ${headerFontSize}px "${bodyFont}", sans-serif`
    ctx.fillStyle = lightTheme ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.35)'
    ctx.textAlign = resolvedAlign
    ctx.textBaseline = 'top'
    if (needsShadow) {
      ctx.shadowColor = 'rgba(0,0,0,0.4)'
      ctx.shadowBlur = headerFontSize * 0.15
    }
    ctx.fillText('Listen On:', textXPos, regionTop)
    ctx.restore()
    logoAreaTop = regionTop + headerFontSize + regionGap
  }

  const logoAreaHeight = bottomBound - logoAreaTop

  // Calculate grid layout
  const count = defs.length
  const { cols, rows } = getGridLayout(count)

  // Logo sizing — larger for single logo
  const scaleFactor = count === 1 ? 1.0 : count <= 2 ? 0.5 : count <= 4 ? 0.65 : 0.6
  const maxWidthCap = count === 1 ? 0.4 : 0.2
  const maxLogoWidth = Math.min(
    Math.round((availableWidth / cols) * scaleFactor),
    Math.round(availableWidth * maxWidthCap),
  )
  const maxLogoHeight = Math.round((logoAreaHeight / rows) * (count === 1 ? 0.9 : 0.75))

  const rawGapX = Math.round((availableWidth / cols) * (1 - scaleFactor))
  const gapX = Math.min(rawGapX, Math.round(maxLogoWidth * 0.6))
  const gapY = rows > 1 ? Math.round(logoAreaHeight * 0.05) : 0

  for (let i = 0; i < defs.length; i++) {
    const img = logoImages[i]!
    const row = Math.floor(i / cols)
    const col = i % cols
    const itemsInRow = Math.min(cols, count - row * cols)

    // Preserve aspect ratio
    const imgAspect = img.naturalWidth / img.naturalHeight
    let logoW = maxLogoWidth
    let logoH = logoW / imgAspect
    if (logoH > maxLogoHeight) {
      logoH = maxLogoHeight
      logoW = logoH * imgAspect
    }

    // Align the row within content bounds based on resolved alignment
    const rowWidth = itemsInRow * logoW + (itemsInRow - 1) * gapX
    let rowStartX: number
    if (resolvedAlign === 'left') rowStartX = contentLeft
    else if (resolvedAlign === 'right') rowStartX = contentRight - rowWidth
    else rowStartX = centerX - rowWidth / 2
    const rowCenterY = logoAreaTop + (row + 0.5) * (logoAreaHeight / rows)

    const x = rowStartX + col * (logoW + gapX)
    const y = rowCenterY - logoH / 2

    ctx.drawImage(img, x, y, logoW, logoH)
  }
}
