import type { Palette } from '@/types'
import { rgbToHex, getTextColour } from './utils'

interface ColorBucket {
  r: number
  g: number
  b: number
  count: number
}

/**
 * Extract a colour palette from an image URL using canvas pixel sampling.
 * Returns dominant, accent, neutral, text, and gradient colours.
 */
export async function extractPaletteFromImage(imageUrl: string): Promise<Palette> {
  const img = await loadImage(imageUrl)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  // Sample at reduced resolution for performance
  const sampleSize = 64
  canvas.width = sampleSize
  canvas.height = sampleSize
  ctx.drawImage(img, 0, 0, sampleSize, sampleSize)

  const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize)
  const pixels = imageData.data

  // Collect pixel colours, skipping near-black and near-white
  const rawColours: ColorBucket[] = []
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i]!
    const g = pixels[i + 1]!
    const b = pixels[i + 2]!
    const a = pixels[i + 3]!

    if (a < 128) continue

    const brightness = (r + g + b) / 3
    if (brightness < 5 || brightness > 250) continue

    rawColours.push({ r, g, b, count: 1 })
  }

  // Deduplicate by quantizing to 4-bit per channel before clustering
  const bucketMap = new Map<string, ColorBucket>()
  for (const c of rawColours) {
    const qr = Math.round(c.r / 16) * 16
    const qg = Math.round(c.g / 16) * 16
    const qb = Math.round(c.b / 16) * 16
    const key = `${qr},${qg},${qb}`
    const existing = bucketMap.get(key)
    if (existing) {
      existing.count++
      existing.r += (c.r - existing.r) / existing.count
      existing.g += (c.g - existing.g) / existing.count
      existing.b += (c.b - existing.b) / existing.count
    } else {
      bucketMap.set(key, { r: c.r, g: c.g, b: c.b, count: 1 })
    }
  }
  const colours = [...bucketMap.values()]

  // K-means clustering into 5 buckets
  const clusters = kMeansCluster(colours, 5)

  // Sort by count (most pixels first)
  clusters.sort((a, b) => b.count - a.count)

  // Ensure we have enough clusters
  while (clusters.length < 5) {
    clusters.push({ r: 128, g: 128, b: 128, count: 0 })
  }

  // Find most saturated for accent
  const bySaturation = [...clusters].sort((a, b) => saturation(b) - saturation(a))

  const c0 = clusters[0]!
  const s0 = bySaturation[0]!
  const sLast = bySaturation[bySaturation.length - 1]!

  const dominant = rgbToHex(Math.round(c0.r), Math.round(c0.g), Math.round(c0.b))
  const accent = rgbToHex(Math.round(s0.r), Math.round(s0.g), Math.round(s0.b))
  const neutral = rgbToHex(Math.round(sLast.r), Math.round(sLast.g), Math.round(sLast.b))
  const text = getTextColour(dominant)
  const gradient: [string, string] = [dominant, accent]

  return { dominant, accent, neutral, text, gradient }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
    img.src = url
  })
}

function saturation(c: ColorBucket): number {
  const r = c.r / 255
  const g = c.g / 255
  const b = c.b / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  if (max === min) return 0
  const l = (max + min) / 2
  return l > 0.5
    ? (max - min) / (2 - max - min)
    : (max - min) / (max + min)
}

function colorDistance(a: ColorBucket, b: ColorBucket): number {
  return Math.sqrt(
    (a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2,
  )
}

function kMeansCluster(pixels: ColorBucket[], k: number): ColorBucket[] {
  if (pixels.length === 0) {
    return Array.from({ length: k }, () => ({ r: 128, g: 128, b: 128, count: 0 }))
  }

  // If fewer unique colours than k, return what we have padded with grey
  if (pixels.length <= k) {
    const result = pixels.map((px) => ({ ...px }))
    while (result.length < k) {
      result.push({ r: 128, g: 128, b: 128, count: 0 })
    }
    return result
  }

  // K-means++ initialization: farthest-point selection for spread
  const centroids: ColorBucket[] = [{ ...pixels[0]!, count: 0 }]

  for (let c = 1; c < k; c++) {
    let maxDist = -1
    let bestIdx = 0
    for (let i = 0; i < pixels.length; i++) {
      let minD = Infinity
      for (const cent of centroids) {
        const d = colorDistance(pixels[i]!, cent)
        if (d < minD) minD = d
      }
      if (minD > maxDist) {
        maxDist = minD
        bestIdx = i
      }
    }
    centroids.push({ ...pixels[bestIdx]!, count: 0 })
  }

  // Iterate k-means
  let currentCentroids = centroids
  for (let iter = 0; iter < 10; iter++) {
    const assignments: ColorBucket[][] = Array.from({ length: k }, () => [])

    for (const px of pixels) {
      let minDist = Infinity
      let nearest = 0
      for (let c = 0; c < currentCentroids.length; c++) {
        const d = colorDistance(px, currentCentroids[c]!)
        if (d < minDist) {
          minDist = d
          nearest = c
        }
      }
      assignments[nearest]!.push(px)
    }

    currentCentroids = assignments.map((group, i): ColorBucket => {
      if (group.length === 0) return currentCentroids[i]!
      const totalCount = group.reduce((sum, p) => sum + p.count, 0)
      const avg = group.reduce(
        (acc, p) => ({
          r: acc.r + p.r * p.count,
          g: acc.g + p.g * p.count,
          b: acc.b + p.b * p.count,
          count: 0,
        }),
        { r: 0, g: 0, b: 0, count: 0 },
      )
      return {
        r: avg.r / totalCount,
        g: avg.g / totalCount,
        b: avg.b / totalCount,
        count: totalCount,
      }
    })
  }

  return currentCentroids
}
