import type { Palette } from '@/types'
import { extractPaletteFromImage } from '@/lib/palette'

export function usePalette() {
  async function extractPalette(artworkUrl: string): Promise<Palette> {
    return extractPaletteFromImage(artworkUrl)
  }

  return { extractPalette }
}
