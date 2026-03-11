import type {
  AssetTemplate,
  AssetSelection,
  ReleaseDetail,
  ResolvedStyle,
  TemplateElement,
  BackgroundThemeId,
  Palette,
  StoreBadgeId,
  TextElementOverride,
} from '@/types'
import { getBadgeType, getArtistName, formatReleaseDate } from './utils'
import {
  drawArtworkBlur,
  drawGradientSweep,
  drawGradientRadial,
  drawMeshGlow,
  drawSplitTone,
  hexToRgba,
} from './backgrounds'
import { applyFilter } from './filters'
import { drawStoreBadges } from './storeBadges'
import { imageBackgrounds } from './imageBackgrounds'
import dittoLogoBlackUrl from '@/assets/ditto-logo-black.svg'
import dittoLogoWhiteUrl from '@/assets/ditto-logo-white.svg'

// ── Logo Cache ─────────────────────────────────────────────

let logoBlack: HTMLImageElement | null = null
let logoWhite: HTMLImageElement | null = null

async function loadLogos(): Promise<void> {
  if (!logoBlack) logoBlack = await loadImage(dittoLogoBlackUrl)
  if (!logoWhite) logoWhite = await loadImage(dittoLogoWhiteUrl)
}

// ── Column Layout for Wide Formats ────────────────────────

interface ColumnLayoutInfo {
  artworkPosition: { x: number; y: number }
  textColumn: { x: number; y: number; width: number }
  badgeRegion: { x: number; y: number; width: number; height: number }
}

/**
 * For wide formats with inset artwork, compute a column-based layout:
 * - Left align:   [Artwork] [Text + Badges]
 * - Right align:  [Text + Badges] [Artwork]
 * - Center align: [Text] [Artwork] [Badges]  (3-column)
 */
function computeColumnLayout(
  canvasW: number,
  canvasH: number,
  artEl: TemplateElement,
  visibleTextEls: TemplateElement[],
  fontSizeScale: number,
  titleSizeScale: number | null | undefined,
  artistSizeScale: number | null | undefined,
  align: 'left' | 'center' | 'right',
): ColumnLayoutInfo {
  const artW = artEl.size.width
  const artH = artEl.size.height
  const pad = Math.round(canvasW * 0.05)
  const gap = Math.round(canvasW * 0.03)

  // Artwork position
  let artX: number
  if (align === 'left') artX = pad
  else if (align === 'right') artX = canvasW - pad - artW
  else artX = Math.round((canvasW - artW) / 2)
  const artY = Math.round((canvasH - artH) / 2)

  // Text column bounds
  let textColX: number
  let textColW: number
  if (align === 'left') {
    textColX = artX + artW + gap
    textColW = canvasW - textColX - pad
  } else if (align === 'right') {
    textColX = pad
    textColW = artX - gap - pad
  } else {
    // Center 3-column: text on left of artwork
    textColX = pad
    textColW = artX - gap - pad
  }

  // Calculate total text block height for vertical centering
  let totalTextH = 0
  for (const el of visibleTextEls) {
    const baseFontSize = (el.style.fontSize as number) ?? 24
    const isTitle = el.content?.includes('{{title}}')
    const isArtist = el.content?.includes('{{artistName}}')
    const effectiveScale = isTitle && titleSizeScale != null ? titleSizeScale
      : isArtist && artistSizeScale != null ? artistSizeScale
      : fontSizeScale
    const scaledSize = Math.round(baseFontSize * effectiveScale)
    totalTextH += Math.round(scaledSize * 1.35)
  }
  const textStartY = artY + Math.round((artH - totalTextH) / 2)

  // Badge region — compact and vertically centered within artwork extent
  let badgeRegion: ColumnLayoutInfo['badgeRegion']
  if (align === 'center') {
    // 3-column: badges go right of artwork, vertically centered
    const badgeX = artX + artW + gap
    const badgeW = canvasW - badgeX - pad
    const badgeH = Math.round(artH * 0.5)
    const badgeY = artY + Math.round((artH - badgeH) / 2)
    badgeRegion = { x: badgeX, y: badgeY, width: badgeW, height: badgeH }
  } else {
    // 2-column: badges below text in same column, compact
    const badgeY = textStartY + totalTextH + Math.round(canvasH * 0.02)
    const badgeH = Math.round(artH * 0.35)
    badgeRegion = { x: textColX, y: badgeY, width: textColW, height: badgeH }
  }

  return {
    artworkPosition: { x: artX, y: artY },
    textColumn: { x: textColX, y: textStartY, width: textColW },
    badgeRegion,
  }
}

/**
 * Create adjusted copies of template elements repositioned into column layout.
 * Artwork is moved to computed position, text elements are stacked in the text column,
 * and globalTextAlign is nullified (positions are pre-computed).
 */
function adjustElementsForColumns(
  elements: TemplateElement[],
  layout: ColumnLayoutInfo,
  tokens: Record<string, string>,
  hiddenElements: string[],
  fontSizeScale: number,
  titleSizeScale: number | null | undefined,
  artistSizeScale: number | null | undefined,
): TemplateElement[] {
  const adjusted: TemplateElement[] = []
  let currentY = layout.textColumn.y

  for (const el of elements) {
    const copy: TemplateElement = {
      ...el,
      position: { ...el.position },
      size: { ...el.size },
      style: { ...el.style },
    }

    if (el.type === 'artwork') {
      copy.position.x = layout.artworkPosition.x
      copy.position.y = layout.artworkPosition.y
      copy.position.anchor = 'top-left'
      adjusted.push(copy)
    } else if (el.type === 'gradient' || el.type === 'shape') {
      adjusted.push(copy)
    } else if (el.type === 'text') {
      // Skip hidden/empty elements
      if (hiddenElements.includes(el.content ?? '')) continue
      if (el.toggleable && el.visible === false) continue
      if (el.content) {
        const resolved = resolveTokens(el.content, tokens).trim()
        if (resolved === '') continue
      }

      // Reposition into text column — center-aligned within column
      copy.position.x = layout.textColumn.x + Math.round(layout.textColumn.width / 2)
      copy.position.y = currentY
      copy.position.anchor = 'top-center'
      copy.size.width = layout.textColumn.width

      const baseFontSize = (el.style.fontSize as number) ?? 24
      const isTitle = el.content?.includes('{{title}}')
      const isArtist = el.content?.includes('{{artistName}}')
      const effectiveScale = isTitle && titleSizeScale != null ? titleSizeScale
        : isArtist && artistSizeScale != null ? artistSizeScale
        : fontSizeScale
      const scaledSize = Math.round(baseFontSize * effectiveScale)
      currentY += Math.round(scaledSize * 1.35)

      adjusted.push(copy)
    }
  }

  return adjusted
}

/**
 * Render a single asset to a canvas.
 * Returns a PNG blob when scale is undefined, or the canvas for preview.
 */
export async function renderAsset(
  template: AssetTemplate,
  selection: AssetSelection,
  release: ReleaseDetail,
  style: ResolvedStyle,
  scale?: number,
): Promise<any> {
  const s = scale ?? 1
  const w = template.width * s
  const h = template.height * s

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.scale(s, s)

  const variant = template.variants.find((v) => v.id === selection.variantId)
    ?? template.variants[0]!

  const { palette, preset, accentOverride } = style
  const theme = style.backgroundTheme
  const accent = accentOverride ?? palette.accent
  const lightTheme = isLightTheme(theme, style.imageBackgroundId, style.direction)

  // Load assets
  const artworkImg = await loadImage(release.artwork)
  await loadLogos()

  // Load custom background image if needed
  let bgImg: HTMLImageElement | null = null
  if (theme === 'custom-image' && style.imageBackgroundId) {
    const bgDef = imageBackgrounds.find(b => b.id === style.imageBackgroundId)
    if (bgDef) {
      try {
        bgImg = await loadImage(bgDef.url)
      } catch {
        // Fallback to dark theme if image fails to load
      }
    }
  }

  // 1. Draw background
  drawBackground(ctx, template.width, template.height, theme, palette, accent, artworkImg, bgImg, style.solidBackgroundColor ?? null)

  // 2. Draw each element
  const tokens = buildTokens(release)
  const headingFont = style.fontOverride?.headingFont ?? preset.headingFont
  const bodyFont = style.fontOverride?.bodyFont ?? preset.bodyFont
  const fontSizeScale = style.fontSizeScale
  const textTransform = style.fontOverride?.textTransform ?? preset.textTransform
  const fontWeight = style.fontOverride?.fontWeight ?? preset.fontWeight
  const titleOverride = style.fontOverride?.titleOverride ?? null
  const artistOverride = style.fontOverride?.artistOverride ?? null
  const globalTextAlign = style.textAlign ?? null

  // Detect wide inset-artwork format for column layout
  const aspect = template.width / template.height
  const artworkEl = variant.elements.find(e => e.type === 'artwork')
  const artworkRadius = (artworkEl?.style.borderRadius as number) ?? 0
  // For wide formats, use variant's defaultAlign as fallback so column layout activates by default
  const columnAlign: 'left' | 'center' | 'right' | null =
    globalTextAlign ?? variant.defaultAlign ?? null
  const useColumnLayout = aspect > 1.5 && artworkEl && artworkRadius > 0 && columnAlign != null

  let effectiveElements: TemplateElement[]
  let effectiveAlign: 'left' | 'center' | 'right' | null = globalTextAlign
  let badgeRegion: { x: number; y: number; width: number; height: number } | undefined

  if (useColumnLayout && artworkEl) {
    // Column layout: compute positions, then skip normal alignment overrides
    const visibleTextEls = variant.elements.filter(e => {
      if (e.type !== 'text') return false
      if (selection.overrides.hiddenElements.includes(e.content ?? '')) return false
      if (e.toggleable && e.visible === false) return false
      if (e.content) {
        const resolved = resolveTokens(e.content, tokens).trim()
        if (resolved === '') return false
      }
      return true
    })

    const layout = computeColumnLayout(
      template.width, template.height,
      artworkEl, visibleTextEls, fontSizeScale,
      titleOverride?.fontSizeScale, artistOverride?.fontSizeScale,
      columnAlign!,
    )

    effectiveElements = adjustElementsForColumns(
      variant.elements, layout, tokens,
      selection.overrides.hiddenElements, fontSizeScale,
      titleOverride?.fontSizeScale, artistOverride?.fontSizeScale,
    )
    effectiveAlign = null // positions are pre-computed, don't apply alignment overrides
    badgeRegion = layout.badgeRegion
  } else {
    // Normal stacked layout: redistribute flow elements
    effectiveElements = redistributeElements(
      variant.elements,
      selection.overrides.hiddenElements,
      tokens,
      fontSizeScale,
      titleOverride?.fontSizeScale,
      artistOverride?.fontSizeScale,
    )
  }

  for (const element of effectiveElements) {
    if (selection.overrides.hiddenElements.includes(element.content ?? '')) continue
    if (element.toggleable && element.visible === false) continue
    // Skip elements whose resolved content is empty (e.g. releaseDate → '' for OUT NOW)
    if (element.type === 'text' && element.content) {
      const resolved = resolveTokens(element.content, tokens).trim()
      if (resolved === '') continue
    }

    switch (element.type) {
      case 'artwork':
        drawArtwork(ctx, element, artworkImg, theme, palette, template.width, effectiveAlign)
        break
      case 'gradient':
        drawGradient(ctx, element, palette, theme, lightTheme)
        break
      case 'text':
        drawText(ctx, element, tokens, headingFont, bodyFont, palette, theme, accent, textTransform, fontWeight, fontSizeScale, lightTheme, titleOverride, artistOverride, effectiveAlign)
        break
      case 'shape':
        drawShape(ctx, element, palette, accent)
        break
    }
  }

  // 2.5. Draw bottom area (badge text and/or store logos)
  const isBadgeHidden = selection.overrides.hiddenElements.includes('{{badge}}')
  const badgeText = isBadgeHidden ? null : tokens['{{badge}}'] || null
  if (badgeText || style.storeBadges?.length > 0) {
    await drawStoreBadges(
      ctx, style.storeBadges ?? [], template.width, template.height,
      lightTheme, bodyFont, headingFont, badgeText, needsTextShadow(theme),
      badgeRegion ? null : globalTextAlign,  // use region positioning instead of alignment
      badgeRegion,
    )
  }

  // 2.6. Ditto watermark (always on, top-right corner)
  drawDittoWatermark(ctx, template.width, template.height, lightTheme)

  // 3. Post-processing: grain (work in pixel space)
  if (style.grain) {
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    applyGrain(ctx, w, h)
    ctx.restore()
  }

  // 4. Post-processing: filter (work in pixel space)
  if (style.filter) {
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    applyFilter(ctx, w, h, style.filter)
    ctx.restore()
  }

  if (scale !== undefined) return canvas

  return new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png')
  })
}

// ── Background Rendering ───────────────────────────────────

function drawBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  theme: BackgroundThemeId,
  palette: Palette,
  accent: string,
  artwork: HTMLImageElement,
  bgImg: HTMLImageElement | null,
  solidColor: string | null,
) {
  switch (theme) {
    case 'dark': {
      ctx.fillStyle = darken(palette.dominant, 0.7)
      ctx.fillRect(0, 0, w, h)
      break
    }
    case 'light': {
      ctx.fillStyle = '#f8f8ff'
      ctx.fillRect(0, 0, w, h)
      break
    }
    case 'full-bleed': {
      const scale = Math.max(w / artwork.width, h / artwork.height)
      const sw = artwork.width * scale
      const sh = artwork.height * scale
      ctx.drawImage(artwork, (w - sw) / 2, (h - sh) / 2, sw, sh)
      const grad = ctx.createLinearGradient(0, 0, 0, h)
      grad.addColorStop(0, 'rgba(0,0,0,0.2)')
      grad.addColorStop(0.5, 'rgba(0,0,0,0.4)')
      grad.addColorStop(1, 'rgba(0,0,0,0.85)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)
      break
    }
    case 'duotone': {
      const scale2 = Math.max(w / artwork.width, h / artwork.height)
      const sw2 = artwork.width * scale2
      const sh2 = artwork.height * scale2
      ctx.drawImage(artwork, (w - sw2) / 2, (h - sh2) / 2, sw2, sh2)
      // getImageData/putImageData bypass canvas transforms — use actual pixel dimensions
      ctx.save()
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      const pw = ctx.canvas.width
      const ph = ctx.canvas.height
      const imageData = ctx.getImageData(0, 0, pw, ph)
      applyDuotone(imageData, palette.dominant, accent)
      ctx.putImageData(imageData, 0, 0)
      ctx.restore()
      break
    }
    case 'artwork-blur':
      drawArtworkBlur(ctx, w, h, palette, accent, artwork)
      break
    case 'gradient-sweep':
      drawGradientSweep(ctx, w, h, palette, accent)
      break
    case 'gradient-radial':
      drawGradientRadial(ctx, w, h, palette, accent)
      break
    case 'mesh-glow':
      drawMeshGlow(ctx, w, h, palette, accent)
      break
    case 'split-tone':
      drawSplitTone(ctx, w, h, palette, accent)
      break
    case 'solid-color': {
      ctx.fillStyle = solidColor ?? '#f5f5f5'
      ctx.fillRect(0, 0, w, h)
      break
    }
    case 'custom-image': {
      if (bgImg) {
        const scale3 = Math.max(w / bgImg.width, h / bgImg.height)
        const sw3 = bgImg.width * scale3
        const sh3 = bgImg.height * scale3
        ctx.drawImage(bgImg, (w - sw3) / 2, (h - sh3) / 2, sw3, sh3)
        // Subtle darken for text readability
        ctx.fillStyle = 'rgba(0,0,0,0.15)'
        ctx.fillRect(0, 0, w, h)
      } else {
        // Fallback: dark background
        ctx.fillStyle = darken(palette.dominant, 0.7)
        ctx.fillRect(0, 0, w, h)
      }
      break
    }
  }
}

// ── Logo Rendering ─────────────────────────────────────────

function drawDittoWatermark(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  lightTheme: boolean,
) {
  const logo = lightTheme ? logoBlack : logoWhite
  if (!logo) return

  const logoAspect = 1785 / 387
  const logoWidth = Math.round(w * 0.08)
  const logoHeight = Math.round(logoWidth / logoAspect)

  const margin = Math.round(w * 0.025)
  const x = w - logoWidth - margin
  const y = margin

  ctx.save()
  ctx.globalAlpha = 0.35
  ctx.drawImage(logo, x, y, logoWidth, logoHeight)
  ctx.restore()
}

// ── Element Rendering ──────────────────────────────────────

function drawArtwork(
  ctx: CanvasRenderingContext2D,
  element: TemplateElement,
  img: HTMLImageElement,
  theme: BackgroundThemeId,
  palette: Palette,
  canvasWidth: number,
  globalTextAlign: 'left' | 'center' | 'right' | null,
) {
  // Skip artwork frame for themes where artwork IS the background
  if (theme === 'full-bleed' || theme === 'duotone') return

  const { x, y } = element.position
  const { width, height } = element.size
  // Use template-specified border radius; edge-to-edge artwork omits it → 0
  const radius = (element.style.borderRadius as number) ?? 0

  // Align inset artwork horizontally when global alignment is set
  let drawX = x
  if (radius > 0 && globalTextAlign) {
    const pad = Math.round(canvasWidth * 0.055)
    switch (globalTextAlign) {
      case 'left':   drawX = pad; break
      case 'center': drawX = Math.round((canvasWidth - width) / 2); break
      case 'right':  drawX = canvasWidth - pad - width; break
    }
  }

  // Drop shadow (only for inset artwork with rounded corners)
  if (theme !== 'artwork-blur' && radius > 0) {
    ctx.save()
    ctx.shadowColor = hexToRgba(palette.dominant, 0.4)
    ctx.shadowBlur = width * 0.06
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = width * 0.02
    ctx.fillStyle = 'rgba(0,0,0,1)'
    roundedRect(ctx, drawX, y, width, height, radius)
    ctx.fill()
    ctx.restore()
  }

  // Artwork with clipping
  ctx.save()
  if (radius > 0) {
    roundedRect(ctx, drawX, y, width, height, radius)
    ctx.clip()
  }
  const scale = Math.max(width / img.width, height / img.height)
  const sw = img.width * scale
  const sh = img.height * scale
  ctx.drawImage(img, drawX + (width - sw) / 2, y + (height - sh) / 2, sw, sh)
  ctx.restore()

  // Subtle border for definition (only on inset artwork)
  if (radius > 0) {
    ctx.save()
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth = 1.5
    roundedRect(ctx, drawX, y, width, height, radius)
    ctx.stroke()
    ctx.restore()
  }
}

function drawGradient(
  ctx: CanvasRenderingContext2D,
  element: TemplateElement,
  palette: Palette,
  theme: BackgroundThemeId,
  lightTheme: boolean,
) {
  if (theme === 'full-bleed' || theme === 'solid-color') return

  const { x, y } = element.position
  const { width, height } = element.size

  const grad = ctx.createLinearGradient(x, y, x, y + height)
  if (lightTheme) {
    grad.addColorStop(0, 'rgba(255,255,255,0)')
    grad.addColorStop(1, 'rgba(255,255,255,0.9)')
  } else {
    grad.addColorStop(0, 'rgba(0,0,0,0)')
    grad.addColorStop(1, palette.dominant + 'cc')
  }
  ctx.fillStyle = grad
  ctx.fillRect(x, y, width, height)
}

/**
 * Auto-fit text size to the available width.
 * Short text scales up (to 130% of base), long text scales down (to 50% floor).
 */
function fitTextToWidth(
  ctx: CanvasRenderingContext2D,
  text: string,
  font: string,
  weight: string,
  baseFontSize: number,
  maxWidth: number,
): number {
  const ceiling = Math.round(baseFontSize * 1.3)
  const floor = Math.round(baseFontSize * 0.5)

  // Measure at ceiling size
  ctx.font = `${weight} ${ceiling}px "${font}", sans-serif`
  const measured = ctx.measureText(text).width

  if (measured <= maxWidth) return ceiling

  // Scale down proportionally
  const fitted = Math.floor(ceiling * (maxWidth / measured))
  return Math.max(fitted, floor)
}

function drawText(
  ctx: CanvasRenderingContext2D,
  element: TemplateElement,
  tokens: Record<string, string>,
  headingFont: string,
  bodyFont: string,
  palette: Palette,
  theme: BackgroundThemeId,
  accent: string,
  textTransform: string,
  fontWeight: string,
  fontSizeScale: number,
  lightTheme: boolean,
  titleOverride: TextElementOverride | null,
  artistOverride: TextElementOverride | null,
  globalTextAlign: 'left' | 'center' | 'right' | null,
) {
  const isTitle = element.content?.includes('{{title}}')
  const isArtist = element.content?.includes('{{artistName}}')

  // Per-element textTransform (override > global)
  let effectiveTransform = textTransform
  if (isTitle && titleOverride?.textTransform) effectiveTransform = titleOverride.textTransform
  else if (isArtist && artistOverride?.textTransform) effectiveTransform = artistOverride.textTransform

  let text = resolveTokens(element.content ?? '', tokens)
  if (effectiveTransform === 'uppercase') text = text.toUpperCase()
  if (effectiveTransform === 'lowercase') text = text.toLowerCase()

  const baseFontSize = element.style.fontSize as number ?? 24

  // Per-element fontSizeScale (override > global)
  let effectiveSizeScale = fontSizeScale
  if (isTitle && titleOverride?.fontSizeScale != null) effectiveSizeScale = titleOverride.fontSizeScale
  else if (isArtist && artistOverride?.fontSizeScale != null) effectiveSizeScale = artistOverride.fontSizeScale
  const scaledBase = Math.round(baseFontSize * effectiveSizeScale)

  // Per-element font (override > global heading/body)
  let font: string
  if (isTitle && titleOverride?.font) font = titleOverride.font
  else if (isArtist && artistOverride?.font) font = artistOverride.font
  else font = isTitle ? headingFont : bodyFont

  // Per-element fontWeight (override > global > default)
  let effectiveWeight: string
  if (isTitle && titleOverride?.fontWeight) effectiveWeight = mapWeight(titleOverride.fontWeight)
  else if (isArtist && artistOverride?.fontWeight) effectiveWeight = mapWeight(artistOverride.fontWeight)
  else if (isTitle) effectiveWeight = mapWeight(fontWeight)
  else effectiveWeight = '400'

  // Auto-fit title and artist name; other text (date, etc.) uses fixed size
  const fontSize = (isTitle || isArtist)
    ? fitTextToWidth(ctx, text, font, effectiveWeight, scaledBase, element.size.width)
    : scaledBase

  ctx.font = `${effectiveWeight} ${fontSize}px "${font}", sans-serif`
  // Global textAlign override > template anchor
  let effectiveAlign: CanvasTextAlign = mapAlign(element.position.anchor)
  if (globalTextAlign) effectiveAlign = globalTextAlign

  ctx.textAlign = effectiveAlign
  ctx.textBaseline = 'top'

  // Text colour
  if (element.content?.includes('{{badge}}')) {
    ctx.fillStyle = accent
  } else {
    ctx.fillStyle = lightTheme ? palette.dominant : '#ffffff'
  }

  // Element opacity
  const opacity = element.style.opacity as number | undefined
  if (opacity !== undefined && opacity < 1) {
    ctx.globalAlpha = opacity
  }

  // Compute bounding box edges from template anchor + position
  const templateAlign = mapAlign(element.position.anchor)
  let boxLeft: number
  if (templateAlign === 'center') boxLeft = element.position.x - element.size.width / 2
  else if (templateAlign === 'right') boxLeft = element.position.x - element.size.width
  else boxLeft = element.position.x

  // Map x to the correct edge based on effective alignment
  let x: number
  if (effectiveAlign === 'left') x = boxLeft
  else if (effectiveAlign === 'right') x = boxLeft + element.size.width
  else x = boxLeft + element.size.width / 2

  // Text shadow for readability on image-heavy backgrounds
  const needsShadow = needsTextShadow(theme)
  if (needsShadow) {
    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.5)'
    ctx.shadowBlur = fontSize * 0.15
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = fontSize * 0.04
  }

  ctx.fillText(text, x, element.position.y, element.size.width)

  if (needsShadow) {
    ctx.restore()
  }

  ctx.globalAlpha = 1.0
}


function drawShape(
  ctx: CanvasRenderingContext2D,
  element: TemplateElement,
  _palette: Palette,
  accent: string,
) {
  const { x, y } = element.position
  const { width, height } = element.size
  const opacity = (element.style.opacity as number) ?? 0.2
  const radius = (element.style.borderRadius as number) ?? 0

  ctx.save()
  ctx.globalAlpha = opacity
  ctx.fillStyle = accent
  if (radius > 0) {
    roundedRect(ctx, x, y, width, height, radius)
    ctx.fill()
  } else {
    ctx.fillRect(x, y, width, height)
  }
  ctx.restore()
}

// ── Film Grain ──────────────────────────────────────────────

let cachedNoisePattern: CanvasPattern | null = null

function getNoisePattern(ctx: CanvasRenderingContext2D): CanvasPattern {
  if (cachedNoisePattern) return cachedNoisePattern
  const tile = document.createElement('canvas')
  tile.width = 256
  tile.height = 256
  const tileCtx = tile.getContext('2d')!
  const imageData = tileCtx.createImageData(256, 256)
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    const v = Math.random() * 255
    data[i] = data[i + 1] = data[i + 2] = v
    data[i + 3] = 255
  }
  tileCtx.putImageData(imageData, 0, 0)
  cachedNoisePattern = ctx.createPattern(tile, 'repeat')!
  return cachedNoisePattern
}

function applyGrain(ctx: CanvasRenderingContext2D, w: number, h: number, intensity: number = 0.06) {
  ctx.save()
  ctx.globalAlpha = intensity
  ctx.globalCompositeOperation = 'overlay'
  ctx.fillStyle = getNoisePattern(ctx)
  ctx.fillRect(0, 0, w, h)
  ctx.restore()
}

// ── Token Resolution ───────────────────────────────────────

function buildTokens(release: ReleaseDetail): Record<string, string> {
  return {
    '{{title}}': release.title,
    '{{artistName}}': getArtistName(release),
    '{{releaseDate}}': formatReleaseDate(release.releaseDate),
    '{{badge}}': getBadgeType(release.releaseDate),
    '{{musicType}}': release.musicType.toUpperCase(),
    '{{label}}': release.label?.name ?? '',
    '{{copyright}}': `\u00A9 ${release.copyrightYear} ${release.copyrightHolder}`,
  }
}

function resolveTokens(template: string, tokens: Record<string, string>): string {
  let result = template
  for (const [key, value] of Object.entries(tokens)) {
    result = result.replace(key, value)
  }
  return result
}

// ── Responsive Redistribution ──────────────────────────────

/**
 * When flow elements (text, badge) are hidden or resolve to empty content,
 * shift remaining visible elements upward to close the vertical gaps.
 * Fixed elements (artwork, gradient, shape) are never moved.
 */
function redistributeElements(
  elements: TemplateElement[],
  hiddenElementContents: string[],
  tokens: Record<string, string>,
  fontSizeScale: number,
  titleSizeScale?: number | null,
  artistSizeScale?: number | null,
): TemplateElement[] {
  const fixedTypes = new Set(['artwork', 'gradient', 'shape'])

  // Deep-copy so we don't mutate template definitions
  const adjusted = elements.map(el => ({
    ...el,
    position: { ...el.position },
    size: { ...el.size },
  }))

  // Determine if a flow element is effectively hidden
  function isEffectivelyHidden(el: TemplateElement): boolean {
    if (hiddenElementContents.includes(el.content ?? '')) return true
    if (el.toggleable && el.visible === false) return true
    // Empty resolved content (e.g., releaseDate → '' for OUT NOW)
    if (el.content && el.type === 'text') {
      const resolved = resolveTokens(el.content, tokens).trim()
      if (resolved === '') return true
    }
    return false
  }

  // Collect indices of flow elements
  const flowIndices: number[] = []
  for (let i = 0; i < adjusted.length; i++) {
    if (!fixedTypes.has(adjusted[i]!.type)) {
      flowIndices.push(i)
    }
  }

  if (flowIndices.length < 2) return adjusted

  // Group by approximate column (anchor + x bucket)
  const groups = new Map<string, number[]>()
  for (const idx of flowIndices) {
    const el = adjusted[idx]!
    const xBucket = Math.round(el.position.x / 80) * 80
    const key = `${el.position.anchor}:${xBucket}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(idx)
  }

  // For each column group, sort by y and redistribute
  for (const indices of groups.values()) {
    indices.sort((a, b) => adjusted[a]!.position.y - adjusted[b]!.position.y)

    // Pass 1: close gaps left by hidden elements
    let cumulativeShift = 0

    for (let i = 0; i < indices.length; i++) {
      const el = adjusted[indices[i]!]!
      const hidden = isEffectivelyHidden(el)

      if (hidden) {
        // Accumulate the vertical slot this element occupied
        if (i + 1 < indices.length) {
          const nextEl = adjusted[indices[i + 1]!]!
          cumulativeShift += nextEl.position.y - el.position.y
        }
      } else {
        // Visible element: shift up by accumulated gap
        el.position.y -= cumulativeShift
      }
    }

    // Pass 2: push elements down when scaled text overflows its template height
    const visibleIndices = indices.filter(idx => !isEffectivelyHidden(adjusted[idx]!))
    for (let i = 0; i < visibleIndices.length - 1; i++) {
      const el = adjusted[visibleIndices[i]!]!
      const nextEl = adjusted[visibleIndices[i + 1]!]!
      const baseFontSize = (el.style.fontSize as number) ?? 24
      const isTitle = el.content?.includes('{{title}}')
      const isArtist = el.content?.includes('{{artistName}}')
      const effectiveScale = isTitle && titleSizeScale != null ? titleSizeScale
        : isArtist && artistSizeScale != null ? artistSizeScale
        : fontSizeScale
      const renderedHeight = Math.round(baseFontSize * effectiveScale * 1.15)
      const overflow = Math.max(0, (el.position.y + renderedHeight) - nextEl.position.y)
      if (overflow > 0) {
        // Push all subsequent visible elements down
        for (let j = i + 1; j < visibleIndices.length; j++) {
          adjusted[visibleIndices[j]!]!.position.y += overflow
        }
      }
    }
  }

  return adjusted
}

// ── Helpers ────────────────────────────────────────────────

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load: ${url}`))
    img.src = url
  })
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function darken(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgb(${Math.round(r * (1 - amount))}, ${Math.round(g * (1 - amount))}, ${Math.round(b * (1 - amount))})`
}

function applyDuotone(imageData: ImageData, color1: string, color2: string) {
  const c1 = hexToRgb(color1)
  const c2 = hexToRgb(color2)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    const grey = data[i]! * 0.299 + data[i + 1]! * 0.587 + data[i + 2]! * 0.114
    const t = grey / 255
    data[i] = c1.r + (c2.r - c1.r) * t
    data[i + 1] = c1.g + (c2.g - c1.g) * t
    data[i + 2] = c1.b + (c2.b - c1.b) * t
  }
}

function hexToRgb(hex: string) {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  }
}

function mapWeight(w: string): string {
  switch (w) {
    case 'light': return '300'
    case 'regular': return '400'
    case 'bold': return '700'
    case 'black': return '900'
    default: return '700'
  }
}

function mapAlign(anchor: string): CanvasTextAlign {
  if (anchor.includes('left')) return 'left'
  if (anchor.includes('right')) return 'right'
  return 'center'
}

function resolveX(x: number, _anchor: string, _ctx: CanvasRenderingContext2D): number {
  return x
}

function isLightTheme(theme: BackgroundThemeId, imageBackgroundId?: string | null, direction?: string): boolean {
  if (theme === 'light') return true
  if (theme === 'solid-color') return direction === 'light'
  // Image backgrounds always use dark overlay + light text
  return false
}

function needsTextShadow(theme: BackgroundThemeId): boolean {
  return ['artwork-blur', 'full-bleed', 'mesh-glow', 'duotone', 'custom-image'].includes(theme)
}
