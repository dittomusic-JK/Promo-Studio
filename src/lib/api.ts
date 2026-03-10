import type { ReleasesResponse, ReleaseDetail } from '@/types'

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'
const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

export async function getReleases(): Promise<ReleasesResponse> {
  if (USE_MOCKS) {
    const mod = await import('@/mocks/releases.json')
    return mod.default as ReleasesResponse
  }
  const res = await fetch(`${API_BASE}/releases`)
  return res.json()
}

export async function getRelease(id: number): Promise<ReleaseDetail> {
  if (USE_MOCKS) {
    const { getMockReleaseDetail } = await import('@/mocks/release-details')
    return getMockReleaseDetail(id)
  }
  const res = await fetch(`${API_BASE}/releases/${id}`)
  return res.json()
}
