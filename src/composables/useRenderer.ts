import type { ReleaseDetail, ResolvedStyle, AssetSelection, AssetTemplate } from '@/types'
import { renderAsset } from '@/lib/renderer'
import { allTemplates } from '@/lib/templates'
import { generateSlug, getArtistName } from '@/lib/utils'
import JSZip from 'jszip'

export function useRenderer() {
  async function exportAll(
    release: ReleaseDetail,
    style: ResolvedStyle,
    selections: Map<string, AssetSelection>,
    onProgress: (completed: number) => void,
  ) {
    const zip = new JSZip()
    const slug = generateSlug(release.title, getArtistName(release))
    let completed = 0

    for (const [templateId, selection] of selections) {
      const template = allTemplates.find((t) => t.id === templateId)
      if (!template) continue

      const blob = await renderAsset(template, selection, release, style)

      const folder = zip.folder(template.platform)!
      folder.file(`${slug}-${template.format}.png`, blob)

      completed++
      onProgress(completed)
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' })
    downloadBlob(zipBlob, `${slug}-promo-assets.zip`)
  }

  async function renderPreview(
    template: AssetTemplate,
    variantId: string,
    release: ReleaseDetail,
    style: ResolvedStyle,
    overrides?: AssetSelection['overrides'],
    scale?: number,
  ): Promise<HTMLCanvasElement> {
    const selection: AssetSelection = {
      templateId: template.id,
      variantId,
      overrides: overrides ?? { hiddenElements: [], customText: null },
    }
    return renderAsset(template, selection, release, style, scale)
  }

  return { exportAll, renderPreview }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
