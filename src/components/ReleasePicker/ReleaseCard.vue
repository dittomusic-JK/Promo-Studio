<script setup lang="ts">
import type { ReleaseListItem } from '@/types'

const props = defineProps<{
  release: ReleaseListItem
}>()

const emit = defineEmits<{
  select: [id: number]
}>()

const artistName = props.release.artists[0]?.name ?? 'Unknown Artist'

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<template>
  <div class="release-card card card--interactive" @click="emit('select', release.id)">
    <div class="release-card__artwork">
      <img :src="release.artwork" :alt="release.title" loading="lazy" />
    </div>
    <div class="release-card__info">
      <h3 class="release-card__title">{{ release.title }}</h3>
      <p class="release-card__artist">{{ artistName }}</p>
      <div class="release-card__meta">
        <span :class="['badge', `badge--${release.musicType}`]">
          {{ release.musicType }}
        </span>
        <span class="release-card__date">{{ formatDate(release.releaseDate) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens' as *;

.release-card {
  &__artwork {
    aspect-ratio: 1;
    overflow: hidden;
    background: $surface-3;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }
  }

  &:hover .release-card__artwork img {
    transform: scale(1.06);
  }

  &__info {
    padding: 0.875rem;
  }

  &__title {
    font-family: $font-heading;
    font-size: 0.9375rem;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 0.2rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__artist {
    font-size: 0.8125rem;
    color: $text-secondary;
    margin-bottom: 0.5rem;
  }

  &__meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__date {
    font-size: 0.75rem;
    color: $text-muted;
  }
}
</style>
