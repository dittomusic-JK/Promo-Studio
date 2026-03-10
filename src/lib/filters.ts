import type { FilterId } from '@/types'

export function applyFilter(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  filterId: FilterId,
) {
  switch (filterId) {
    case 'greyscale':
      applyGreyscale(ctx, w, h)
      break
    case 'high-contrast':
      applyHighContrast(ctx, w, h)
      break
    case 'warm-vintage':
      applyWarmVintage(ctx, w, h)
      break
    case 'cool-tone':
      applyCoolTone(ctx, w, h)
      break
    case 'glitch':
      applyGlitch(ctx, w, h)
      break
    case 'sepia':
      applySepia(ctx, w, h)
      break
    case 'noir':
      applyNoir(ctx, w, h)
      break
    case 'vaporwave':
      applyVaporwave(ctx, w, h)
      break
    case 'film-fade':
      applyFilmFade(ctx, w, h)
      break
    case 'halftone':
      applyHalftone(ctx, w, h)
      break
    case 'chromatic':
      applyChromatic(ctx, w, h)
      break
    case 'posterize':
      applyPosterize(ctx, w, h)
      break
  }
}

function applyCanvasFilter(ctx: CanvasRenderingContext2D, w: number, h: number, filter: string) {
  const temp = document.createElement('canvas')
  temp.width = w
  temp.height = h
  const tCtx = temp.getContext('2d')!
  tCtx.filter = filter
  tCtx.drawImage(ctx.canvas, 0, 0)
  ctx.clearRect(0, 0, w, h)
  ctx.drawImage(temp, 0, 0)
}

function applyGreyscale(ctx: CanvasRenderingContext2D, w: number, h: number) {
  applyCanvasFilter(ctx, w, h, 'grayscale(100%)')
}

function applyHighContrast(ctx: CanvasRenderingContext2D, w: number, h: number) {
  applyCanvasFilter(ctx, w, h, 'contrast(1.3) saturate(1.2) brightness(1.05)')
}

function applyWarmVintage(ctx: CanvasRenderingContext2D, w: number, h: number) {
  applyCanvasFilter(ctx, w, h, 'saturate(0.8) contrast(1.1)')

  ctx.save()
  ctx.globalCompositeOperation = 'multiply'
  ctx.fillStyle = 'rgba(255, 220, 180, 0.15)'
  ctx.fillRect(0, 0, w, h)
  ctx.restore()

  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  ctx.fillStyle = 'rgba(255, 160, 60, 0.06)'
  ctx.fillRect(0, 0, w, h)
  ctx.restore()
}

function applyCoolTone(ctx: CanvasRenderingContext2D, w: number, h: number) {
  applyCanvasFilter(ctx, w, h, 'saturate(0.85) contrast(1.05)')

  ctx.save()
  ctx.globalCompositeOperation = 'multiply'
  ctx.fillStyle = 'rgba(180, 200, 255, 0.12)'
  ctx.fillRect(0, 0, w, h)
  ctx.restore()
}

function applyGlitch(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const imageData = ctx.getImageData(0, 0, w, h)
  const data = imageData.data
  const original = new Uint8ClampedArray(data)

  const shiftPx = Math.max(3, Math.round(w * 0.004))

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const srcX = Math.min(x + shiftPx, w - 1)
      const dstIdx = (y * w + x) * 4
      const srcIdx = (y * w + srcX) * 4
      data[dstIdx] = original[srcIdx]!
    }
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const srcX = Math.max(x - shiftPx, 0)
      const dstIdx = (y * w + x) * 4 + 2
      const srcIdx = (y * w + srcX) * 4 + 2
      data[dstIdx] = original[srcIdx]!
    }
  }

  const seed = w * h
  for (let i = 0; i < 6; i++) {
    const lineY = Math.floor(((seed * (i + 1) * 7919) % 65521) / 65521 * h)
    const lineH = 1 + (i % 3)
    for (let y = lineY; y < Math.min(lineY + lineH, h); y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4
        data[idx + 3] = Math.round(data[idx + 3]! * 0.6)
      }
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

// ── New Filters ──────────────────────────────────────────────

function applySepia(ctx: CanvasRenderingContext2D, w: number, h: number) {
  applyCanvasFilter(ctx, w, h, 'sepia(80%) saturate(0.9) contrast(1.05)')
}

function applyNoir(ctx: CanvasRenderingContext2D, w: number, h: number) {
  applyCanvasFilter(ctx, w, h, 'grayscale(100%) contrast(1.5) brightness(1.1)')

  // Radial vignette
  ctx.save()
  ctx.globalCompositeOperation = 'multiply'
  const grad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.7)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(1, 'rgba(0,0,0,0.6)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)
  ctx.restore()
}

function applyVaporwave(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const imageData = ctx.getImageData(0, 0, w, h)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, data[i]! * 1.1 + 40)
    data[i + 1] = Math.min(255, data[i + 1]! * 0.7 + 20)
    data[i + 2] = Math.min(255, data[i + 2]! * 1.15 + 50)
  }
  ctx.putImageData(imageData, 0, 0)

  ctx.save()
  ctx.globalCompositeOperation = 'overlay'
  ctx.fillStyle = 'rgba(180, 60, 255, 0.12)'
  ctx.fillRect(0, 0, w, h)
  ctx.restore()
}

function applyFilmFade(ctx: CanvasRenderingContext2D, w: number, h: number) {
  applyCanvasFilter(ctx, w, h, 'contrast(0.85) saturate(0.7) brightness(1.1)')

  // Raised blacks
  ctx.save()
  ctx.globalCompositeOperation = 'lighten'
  ctx.fillStyle = 'rgba(35, 30, 25, 1)'
  ctx.fillRect(0, 0, w, h)
  ctx.restore()

  // Warm cast
  ctx.save()
  ctx.globalCompositeOperation = 'multiply'
  ctx.fillStyle = 'rgba(255, 240, 220, 0.08)'
  ctx.fillRect(0, 0, w, h)
  ctx.restore()
}

function applyHalftone(ctx: CanvasRenderingContext2D, w: number, h: number) {
  applyCanvasFilter(ctx, w, h, 'contrast(1.2)')

  const dotSize = Math.max(3, Math.round(w / 200))
  const spacing = dotSize * 2.5

  ctx.save()
  ctx.globalCompositeOperation = 'multiply'
  ctx.fillStyle = 'rgba(0,0,0,0.15)'
  for (let y = 0; y < h; y += spacing) {
    for (let x = 0; x < w; x += spacing) {
      ctx.beginPath()
      ctx.arc(x, y, dotSize * 0.6, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.restore()
}

function applyChromatic(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const imageData = ctx.getImageData(0, 0, w, h)
  const data = imageData.data
  const original = new Uint8ClampedArray(data)
  const shift = Math.max(4, Math.round(w * 0.005))

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dstIdx = (y * w + x) * 4
      const srcR = Math.min(x + shift, w - 1)
      data[dstIdx] = original[(y * w + srcR) * 4]!
      const srcB = Math.max(x - shift, 0)
      data[dstIdx + 2] = original[(y * w + srcB) * 4 + 2]!
    }
  }
  ctx.putImageData(imageData, 0, 0)
}

function applyPosterize(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const imageData = ctx.getImageData(0, 0, w, h)
  const data = imageData.data
  const levels = 5
  const step = 255 / (levels - 1)

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.round(Math.round(data[i]! / step) * step)
    data[i + 1] = Math.round(Math.round(data[i + 1]! / step) * step)
    data[i + 2] = Math.round(Math.round(data[i + 2]! / step) * step)
  }
  ctx.putImageData(imageData, 0, 0)

  applyCanvasFilter(ctx, w, h, 'contrast(1.15) saturate(1.2)')
}
