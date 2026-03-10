import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { ReleaseListItem, ReleaseDetail } from '@/types'
import { getReleases, getRelease } from '@/lib/api'

export const useReleaseStore = defineStore('release', () => {
  const catalog = ref<ReleaseListItem[]>([])
  const selectedRelease = ref<ReleaseDetail | null>(null)
  const loading = ref(false)
  const searchQuery = ref('')
  const statusFilter = ref<string>('active')

  const filteredCatalog = computed(() => {
    let items = catalog.value

    if (statusFilter.value) {
      items = items.filter((r) => r.status === statusFilter.value)
    }

    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      items = items.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.artists.some((a) => a.name.toLowerCase().includes(q)),
      )
    }

    return items
  })

  async function fetchCatalog() {
    loading.value = true
    try {
      const response = await getReleases()
      catalog.value = response.data
    } finally {
      loading.value = false
    }
  }

  async function selectRelease(id: number) {
    loading.value = true
    try {
      selectedRelease.value = await getRelease(id)
    } finally {
      loading.value = false
    }
  }

  function clearSelection() {
    selectedRelease.value = null
  }

  return {
    catalog,
    selectedRelease,
    loading,
    searchQuery,
    statusFilter,
    filteredCatalog,
    fetchCatalog,
    selectRelease,
    clearSelection,
  }
})
