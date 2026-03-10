import type { StyleFamily, FontOption, FontPairing } from '@/types'

interface FontConfig {
  heading: { family: string; url: string }
  body: { family: string; url: string }
}

const GOOGLE_FONTS_BASE = 'https://fonts.googleapis.com/css2?family='

const fontMap: Record<StyleFamily, FontConfig> = {
  'urban-street': {
    heading: {
      family: 'Oswald',
      url: `${GOOGLE_FONTS_BASE}Oswald:wght@400;500;600;700&display=swap`,
    },
    body: {
      family: 'DM Sans',
      url: `${GOOGLE_FONTS_BASE}DM+Sans:wght@400;500;700&display=swap`,
    },
  },
  'electronic-dance': {
    heading: {
      family: 'Chakra Petch',
      url: `${GOOGLE_FONTS_BASE}Chakra+Petch:wght@400;500;600;700&display=swap`,
    },
    body: {
      family: 'Space Mono',
      url: `${GOOGLE_FONTS_BASE}Space+Mono:wght@400;700&display=swap`,
    },
  },
  'soulful-smooth': {
    heading: {
      family: 'Playfair Display',
      url: `${GOOGLE_FONTS_BASE}Playfair+Display:wght@400;500;600;700;800&display=swap`,
    },
    body: {
      family: 'Nunito',
      url: `${GOOGLE_FONTS_BASE}Nunito:wght@300;400;600;700&display=swap`,
    },
  },
  'rock-punk-metal': {
    heading: {
      family: 'Anton',
      url: `${GOOGLE_FONTS_BASE}Anton&display=swap`,
    },
    body: {
      family: 'Work Sans',
      url: `${GOOGLE_FONTS_BASE}Work+Sans:wght@400;500;600;700&display=swap`,
    },
  },
  'pop-mainstream': {
    heading: {
      family: 'Poppins',
      url: `${GOOGLE_FONTS_BASE}Poppins:wght@400;500;600;700;800;900&display=swap`,
    },
    body: {
      family: 'Nunito',
      url: `${GOOGLE_FONTS_BASE}Nunito:wght@300;400;600;700&display=swap`,
    },
  },
  'acoustic-organic': {
    heading: {
      family: 'Crimson Text',
      url: `${GOOGLE_FONTS_BASE}Crimson+Text:wght@400;600;700&display=swap`,
    },
    body: {
      family: 'Source Serif 4',
      url: `${GOOGLE_FONTS_BASE}Source+Serif+4:wght@300;400;600&display=swap`,
    },
  },
  'latin-world': {
    heading: {
      family: 'Abril Fatface',
      url: `${GOOGLE_FONTS_BASE}Abril+Fatface&display=swap`,
    },
    body: {
      family: 'Raleway',
      url: `${GOOGLE_FONTS_BASE}Raleway:wght@300;400;500;600;700&display=swap`,
    },
  },
  'chill-ambient': {
    heading: {
      family: 'Quicksand',
      url: `${GOOGLE_FONTS_BASE}Quicksand:wght@300;400;500;600;700&display=swap`,
    },
    body: {
      family: 'Tenor Sans',
      url: `${GOOGLE_FONTS_BASE}Tenor+Sans&display=swap`,
    },
  },
}

// ── Curated Font Library ─────────────────────────────────────

export const curatedFonts: FontOption[] = [
  // Display
  { id: 'oswald', name: 'Oswald', family: 'Oswald', url: `${GOOGLE_FONTS_BASE}Oswald:wght@300;400;500;600;700&display=swap`, category: 'display' },
  { id: 'anton', name: 'Anton', family: 'Anton', url: `${GOOGLE_FONTS_BASE}Anton&display=swap`, category: 'display' },
  { id: 'bebas-neue', name: 'Bebas Neue', family: 'Bebas Neue', url: `${GOOGLE_FONTS_BASE}Bebas+Neue&display=swap`, category: 'display' },
  { id: 'abril-fatface', name: 'Abril Fatface', family: 'Abril Fatface', url: `${GOOGLE_FONTS_BASE}Abril+Fatface&display=swap`, category: 'display' },
  { id: 'righteous', name: 'Righteous', family: 'Righteous', url: `${GOOGLE_FONTS_BASE}Righteous&display=swap`, category: 'display' },
  { id: 'bangers', name: 'Bangers', family: 'Bangers', url: `${GOOGLE_FONTS_BASE}Bangers&display=swap`, category: 'display' },
  { id: 'michroma', name: 'Michroma', family: 'Michroma', url: `${GOOGLE_FONTS_BASE}Michroma&display=swap`, category: 'display' },
  { id: 'zen-dots', name: 'Zen Dots', family: 'Zen Dots', url: `${GOOGLE_FONTS_BASE}Zen+Dots&display=swap`, category: 'display' },
  { id: 'anta', name: 'Anta', family: 'Anta', url: `${GOOGLE_FONTS_BASE}Anta&display=swap`, category: 'display' },
  { id: 'alfa-slab-one', name: 'Alfa Slab One', family: 'Alfa Slab One', url: `${GOOGLE_FONTS_BASE}Alfa+Slab+One&display=swap`, category: 'display' },
  { id: 'goblin-one', name: 'Goblin One', family: 'Goblin One', url: `${GOOGLE_FONTS_BASE}Goblin+One&display=swap`, category: 'display' },
  { id: 'italiana', name: 'Italiana', family: 'Italiana', url: `${GOOGLE_FONTS_BASE}Italiana&display=swap`, category: 'display' },
  { id: 'knewave', name: 'Knewave', family: 'Knewave', url: `${GOOGLE_FONTS_BASE}Knewave&display=swap`, category: 'display' },
  { id: 'black-ops-one', name: 'Black Ops One', family: 'Black Ops One', url: `${GOOGLE_FONTS_BASE}Black+Ops+One&display=swap`, category: 'display' },
  { id: 'iceland', name: 'Iceland', family: 'Iceland', url: `${GOOGLE_FONTS_BASE}Iceland&display=swap`, category: 'display' },

  // Sans
  { id: 'poppins', name: 'Poppins', family: 'Poppins', url: `${GOOGLE_FONTS_BASE}Poppins:wght@300;400;500;600;700;800;900&display=swap`, category: 'sans' },
  { id: 'dm-sans', name: 'DM Sans', family: 'DM Sans', url: `${GOOGLE_FONTS_BASE}DM+Sans:wght@400;500;700&display=swap`, category: 'sans' },
  { id: 'inter', name: 'Inter', family: 'Inter', url: `${GOOGLE_FONTS_BASE}Inter:wght@300;400;500;600;700;800&display=swap`, category: 'sans' },
  { id: 'montserrat', name: 'Montserrat', family: 'Montserrat', url: `${GOOGLE_FONTS_BASE}Montserrat:wght@300;400;500;600;700;800;900&display=swap`, category: 'sans' },
  { id: 'raleway', name: 'Raleway', family: 'Raleway', url: `${GOOGLE_FONTS_BASE}Raleway:wght@300;400;500;600;700&display=swap`, category: 'sans' },
  { id: 'quicksand', name: 'Quicksand', family: 'Quicksand', url: `${GOOGLE_FONTS_BASE}Quicksand:wght@300;400;500;600;700&display=swap`, category: 'sans' },

  // Serif
  { id: 'playfair', name: 'Playfair Display', family: 'Playfair Display', url: `${GOOGLE_FONTS_BASE}Playfair+Display:wght@400;500;600;700;800&display=swap`, category: 'serif' },
  { id: 'crimson', name: 'Crimson Text', family: 'Crimson Text', url: `${GOOGLE_FONTS_BASE}Crimson+Text:wght@400;600;700&display=swap`, category: 'serif' },
  { id: 'lora', name: 'Lora', family: 'Lora', url: `${GOOGLE_FONTS_BASE}Lora:wght@400;500;600;700&display=swap`, category: 'serif' },

  // Mono
  { id: 'space-mono', name: 'Space Mono', family: 'Space Mono', url: `${GOOGLE_FONTS_BASE}Space+Mono:wght@400;700&display=swap`, category: 'mono' },
  { id: 'jetbrains', name: 'JetBrains Mono', family: 'JetBrains Mono', url: `${GOOGLE_FONTS_BASE}JetBrains+Mono:wght@300;400;500;600;700&display=swap`, category: 'mono' },
  { id: 'nova-mono', name: 'Nova Mono', family: 'Nova Mono', url: `${GOOGLE_FONTS_BASE}Nova+Mono&display=swap`, category: 'mono' },
  { id: 'courier-prime', name: 'Courier Prime', family: 'Courier Prime', url: `${GOOGLE_FONTS_BASE}Courier+Prime:wght@400;700&display=swap`, category: 'mono' },

  // Handwriting
  { id: 'pacifico', name: 'Pacifico', family: 'Pacifico', url: `${GOOGLE_FONTS_BASE}Pacifico&display=swap`, category: 'handwriting' },
  { id: 'shadows-into-light', name: 'Shadows Into Light', family: 'Shadows Into Light', url: `${GOOGLE_FONTS_BASE}Shadows+Into+Light&display=swap`, category: 'handwriting' },
  { id: 'yellowtail', name: 'Yellowtail', family: 'Yellowtail', url: `${GOOGLE_FONTS_BASE}Yellowtail&display=swap`, category: 'handwriting' },
  { id: 'gloria-hallelujah', name: 'Gloria Hallelujah', family: 'Gloria Hallelujah', url: `${GOOGLE_FONTS_BASE}Gloria+Hallelujah&display=swap`, category: 'handwriting' },
  { id: 'rock-salt', name: 'Rock Salt', family: 'Rock Salt', url: `${GOOGLE_FONTS_BASE}Rock+Salt&display=swap`, category: 'handwriting' },
  { id: 'kolker-brush', name: 'Kolker Brush', family: 'Kolker Brush', url: `${GOOGLE_FONTS_BASE}Kolker+Brush&display=swap`, category: 'handwriting' },

  // Novelty
  { id: 'honk', name: 'Honk', family: 'Honk', url: `${GOOGLE_FONTS_BASE}Honk&display=swap`, category: 'novelty' },
  { id: 'cherry-bomb-one', name: 'Cherry Bomb One', family: 'Cherry Bomb One', url: `${GOOGLE_FONTS_BASE}Cherry+Bomb+One&display=swap`, category: 'novelty' },
  { id: 'climate-crisis', name: 'Climate Crisis', family: 'Climate Crisis', url: `${GOOGLE_FONTS_BASE}Climate+Crisis&display=swap`, category: 'novelty' },
]

// ── Curated Font Pairings ────────────────────────────────────

export const fontPairings: FontPairing[] = [
  {
    id: 'street-poster',
    name: 'Street Poster',
    headingFont: 'Anton',
    headingFontUrl: `${GOOGLE_FONTS_BASE}Anton&display=swap`,
    bodyFont: 'Inter',
    bodyFontUrl: `${GOOGLE_FONTS_BASE}Inter:wght@300;400;500;600;700;800&display=swap`,
    fontWeight: 'black',
    textTransform: 'uppercase',
  },
  {
    id: 'heavy-impact',
    name: 'Heavy Impact',
    headingFont: 'Alfa Slab One',
    headingFontUrl: `${GOOGLE_FONTS_BASE}Alfa+Slab+One&display=swap`,
    bodyFont: 'Inter',
    bodyFontUrl: `${GOOGLE_FONTS_BASE}Inter:wght@300;400;500;600;700;800&display=swap`,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  {
    id: 'neon-display',
    name: 'Neon Display',
    headingFont: 'Bebas Neue',
    headingFontUrl: `${GOOGLE_FONTS_BASE}Bebas+Neue&display=swap`,
    bodyFont: 'Space Mono',
    bodyFontUrl: `${GOOGLE_FONTS_BASE}Space+Mono:wght@400;700&display=swap`,
    fontWeight: 'regular',
    textTransform: 'uppercase',
  },
  {
    id: 'billboard',
    name: 'Billboard',
    headingFont: 'Righteous',
    headingFontUrl: `${GOOGLE_FONTS_BASE}Righteous&display=swap`,
    bodyFont: 'Poppins',
    bodyFontUrl: `${GOOGLE_FONTS_BASE}Poppins:wght@300;400;500;600;700;800;900&display=swap`,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  {
    id: 'grunge-ink',
    name: 'Grunge Ink',
    headingFont: 'Bangers',
    headingFontUrl: `${GOOGLE_FONTS_BASE}Bangers&display=swap`,
    bodyFont: 'Work Sans',
    bodyFontUrl: `${GOOGLE_FONTS_BASE}Work+Sans:wght@400;500;600;700&display=swap`,
    fontWeight: 'black',
    textTransform: 'uppercase',
  },
  {
    id: 'cyber-future',
    name: 'Cyber Future',
    headingFont: 'Michroma',
    headingFontUrl: `${GOOGLE_FONTS_BASE}Michroma&display=swap`,
    bodyFont: 'Space Mono',
    bodyFontUrl: `${GOOGLE_FONTS_BASE}Space+Mono:wght@400;700&display=swap`,
    fontWeight: 'regular',
    textTransform: 'uppercase',
  },
  {
    id: 'military-ops',
    name: 'Military Ops',
    headingFont: 'Black Ops One',
    headingFontUrl: `${GOOGLE_FONTS_BASE}Black+Ops+One&display=swap`,
    bodyFont: 'Work Sans',
    bodyFontUrl: `${GOOGLE_FONTS_BASE}Work+Sans:wght@400;500;600;700&display=swap`,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  {
    id: 'arcade-neon',
    name: 'Arcade Neon',
    headingFont: 'Zen Dots',
    headingFontUrl: `${GOOGLE_FONTS_BASE}Zen+Dots&display=swap`,
    bodyFont: 'DM Sans',
    bodyFontUrl: `${GOOGLE_FONTS_BASE}DM+Sans:wght@400;500;700&display=swap`,
    fontWeight: 'regular',
    textTransform: 'none',
  },
  {
    id: 'retro-bold',
    name: 'Retro Bold',
    headingFont: 'Oswald',
    headingFontUrl: `${GOOGLE_FONTS_BASE}Oswald:wght@300;400;500;600;700&display=swap`,
    bodyFont: 'Quicksand',
    bodyFontUrl: `${GOOGLE_FONTS_BASE}Quicksand:wght@300;400;500;600;700&display=swap`,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  {
    id: 'midnight-editorial',
    name: 'Midnight Editorial',
    headingFont: 'Playfair Display',
    headingFontUrl: `${GOOGLE_FONTS_BASE}Playfair+Display:wght@400;500;600;700;800&display=swap`,
    bodyFont: 'DM Sans',
    bodyFontUrl: `${GOOGLE_FONTS_BASE}DM+Sans:wght@400;500;700&display=swap`,
    fontWeight: 'bold',
    textTransform: 'none',
  },
  {
    id: 'elegant-script',
    name: 'Elegant Script',
    headingFont: 'Abril Fatface',
    headingFontUrl: `${GOOGLE_FONTS_BASE}Abril+Fatface&display=swap`,
    bodyFont: 'Raleway',
    bodyFontUrl: `${GOOGLE_FONTS_BASE}Raleway:wght@300;400;500;600;700&display=swap`,
    fontWeight: 'bold',
    textTransform: 'none',
  },
  {
    id: 'modern-clean',
    name: 'Modern Clean',
    headingFont: 'Montserrat',
    headingFontUrl: `${GOOGLE_FONTS_BASE}Montserrat:wght@300;400;500;600;700;800;900&display=swap`,
    bodyFont: 'Inter',
    bodyFontUrl: `${GOOGLE_FONTS_BASE}Inter:wght@300;400;500;600;700;800&display=swap`,
    fontWeight: 'bold',
    textTransform: 'none',
  },
]

// ── Font Loading ─────────────────────────────────────────────

const loadedFonts = new Set<string>()

/**
 * Load fonts for a style family using the FontFace API.
 */
export async function loadFontsForStyle(family: StyleFamily): Promise<void> {
  const config = fontMap[family]
  await Promise.all([
    loadFont(config.heading.family, config.heading.url),
    loadFont(config.body.family, config.body.url),
  ])
}

/**
 * Load a single font by family name and URL. Idempotent.
 */
export async function loadFontByFamily(family: string, url: string): Promise<void> {
  return loadFont(family, url)
}

async function loadFont(family: string, url: string): Promise<void> {
  if (loadedFonts.has(family)) return

  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = url
  document.head.appendChild(link)

  // Wait for the Google Fonts stylesheet to be fetched and parsed
  // so the @font-face declarations are available before we try to load the font
  await new Promise<void>((resolve) => {
    link.onload = () => resolve()
    link.onerror = () => resolve()
  })

  try {
    await document.fonts.load(`16px "${family}"`)
    loadedFonts.add(family)
  } catch {
    console.warn(`Failed to load font: ${family}`)
  }
}

export function getFontConfig(family: StyleFamily): FontConfig {
  return fontMap[family]
}
