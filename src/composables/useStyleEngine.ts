import type { StylePreset, StyleDirection, BackgroundTheme, FilterDefinition } from '@/types'
import {
  getPresetForGenre as _getPresetForGenre,
  styleDirections as _styleDirections,
  backgroundThemes as _backgroundThemes,
  filterDefinitions as _filterDefinitions,
} from '@/lib/styleEngine'
import { loadFontsForStyle } from '@/lib/fonts'
import { storeBadgeDefinitions } from '@/lib/storeBadges'
import { imageBackgrounds } from '@/lib/imageBackgrounds'

export function useStyleEngine() {
  function getPresetForGenre(genreId: number | null): StylePreset {
    const preset = _getPresetForGenre(genreId)
    loadFontsForStyle(preset.id)
    return preset
  }

  const styleDirections: StyleDirection[] = _styleDirections
  const backgroundThemes: BackgroundTheme[] = _backgroundThemes
  const filterDefinitions: FilterDefinition[] = _filterDefinitions

  return {
    getPresetForGenre,
    styleDirections,
    backgroundThemes,
    filterDefinitions,
    storeBadgeDefinitions,
    imageBackgrounds,
  }
}
