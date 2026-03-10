import type { Palette } from '@/types'

// ── Helpers ────────────────────────────────────────────────

export function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function darken(hex: string, amount: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `rgb(${Math.round(r * (1 - amount))}, ${Math.round(g * (1 - amount))}, ${Math.round(b * (1 - amount))})`
}

// ── Background: Artwork Blur ────────────────────────────────

export function drawArtworkBlur(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  palette: Palette,
  accent: string,
  artwork: HTMLImageElement,
) {
  // 1. Draw artwork scaled to cover with overshoot for blur bleed
  const scale = Math.max(w / artwork.width, h / artwork.height) * 1.2
  const sw = artwork.width * scale
  const sh = artwork.height * scale
  ctx.drawImage(artwork, (w - sw) / 2, (h - sh) / 2, sw, sh)

  // 2. Multi-pass blur for much stronger effect
  const blurAmount = Math.round(w * 0.04)
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = w
  tempCanvas.height = h
  const tempCtx = tempCanvas.getContext('2d')!
  for (let pass = 0; pass < 3; pass++) {
    tempCtx.filter = `blur(${blurAmount}px)`
    tempCtx.drawImage(ctx.canvas, 0, 0)
    ctx.drawImage(tempCanvas, 0, 0)
  }

  // 3. Darken overlay with dominant colour
  ctx.fillStyle = hexToRgba(palette.dominant, 0.55)
  ctx.fillRect(0, 0, w, h)

  // 4. Radial glow of accent at centre for depth
  const radial = ctx.createRadialGradient(w / 2, h * 0.45, 0, w / 2, h * 0.45, w * 0.6)
  radial.addColorStop(0, hexToRgba(accent, 0.22))
  radial.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = radial
  ctx.fillRect(0, 0, w, h)
}

// ── Background: Gradient Sweep ──────────────────────────────

export function drawGradientSweep(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  palette: Palette,
  accent: string,
) {
  const grad = ctx.createLinearGradient(0, 0, w, h)
  grad.addColorStop(0, darken(palette.dominant, 0.3))
  grad.addColorStop(0.4, palette.dominant)
  grad.addColorStop(0.7, accent)
  grad.addColorStop(1, darken(accent, 0.5))
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)
}

// ── Background: Gradient Radial ─────────────────────────────

export function drawGradientRadial(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  palette: Palette,
  accent: string,
) {
  // Dark base
  ctx.fillStyle = darken(palette.dominant, 0.85)
  ctx.fillRect(0, 0, w, h)

  // Central radial glow
  const radial = ctx.createRadialGradient(
    w * 0.5, h * 0.42, 0,
    w * 0.5, h * 0.42, Math.max(w, h) * 0.7,
  )
  radial.addColorStop(0, accent)
  radial.addColorStop(0.35, hexToRgba(palette.dominant, 0.7))
  radial.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = radial
  ctx.fillRect(0, 0, w, h)
}

// ── Background: Mesh Glow ───────────────────────────────────

export function drawMeshGlow(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  palette: Palette,
  accent: string,
) {
  // Very dark base
  ctx.fillStyle = darken(palette.dominant, 0.88)
  ctx.fillRect(0, 0, w, h)

  // Three overlapping radial blobs
  const blobs = [
    { cx: w * 0.2, cy: h * 0.25, color: palette.dominant, radius: w * 0.6 },
    { cx: w * 0.8, cy: h * 0.15, color: accent, radius: w * 0.55 },
    { cx: w * 0.45, cy: h * 0.8, color: palette.neutral, radius: w * 0.5 },
  ]

  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  for (const blob of blobs) {
    const grad = ctx.createRadialGradient(blob.cx, blob.cy, 0, blob.cx, blob.cy, blob.radius)
    grad.addColorStop(0, hexToRgba(blob.color, 0.55))
    grad.addColorStop(0.45, hexToRgba(blob.color, 0.15))
    grad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)
  }
  ctx.globalCompositeOperation = 'source-over'
  ctx.restore()

  // Blur to soften the mesh
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = w
  tempCanvas.height = h
  const tempCtx = tempCanvas.getContext('2d')!
  tempCtx.filter = `blur(${Math.round(w * 0.03)}px)`
  tempCtx.drawImage(ctx.canvas, 0, 0)
  ctx.drawImage(tempCanvas, 0, 0)
}

// ── Background: Split Tone ──────────────────────────────────

export function drawSplitTone(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  palette: Palette,
  accent: string,
) {
  // Left triangle: dominant
  ctx.fillStyle = darken(palette.dominant, 0.3)
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(w * 0.65, 0)
  ctx.lineTo(0, h)
  ctx.closePath()
  ctx.fill()

  // Right triangle: accent
  ctx.fillStyle = darken(accent, 0.2)
  ctx.beginPath()
  ctx.moveTo(w * 0.65, 0)
  ctx.lineTo(w, 0)
  ctx.lineTo(w, h)
  ctx.lineTo(0, h)
  ctx.closePath()
  ctx.fill()

  // Soft blend along the diagonal
  const blendGrad = ctx.createLinearGradient(0, 0, w, h)
  blendGrad.addColorStop(0, 'rgba(0,0,0,0)')
  blendGrad.addColorStop(0.4, 'rgba(0,0,0,0)')
  blendGrad.addColorStop(0.5, 'rgba(0,0,0,0.12)')
  blendGrad.addColorStop(0.6, 'rgba(0,0,0,0)')
  blendGrad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = blendGrad
  ctx.fillRect(0, 0, w, h)
}
