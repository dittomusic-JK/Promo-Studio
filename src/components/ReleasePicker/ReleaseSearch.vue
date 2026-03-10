<script setup lang="ts">
import { useReleaseStore } from '@/stores/release'

const store = useReleaseStore()
</script>

<template>
  <div class="release-search">
    <div class="release-search__input-wrap">
      <svg class="release-search__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="text"
        class="release-search__input"
        placeholder="Search releases..."
        :value="store.searchQuery"
        @input="store.searchQuery = ($event.target as HTMLInputElement).value"
      />
    </div>
    <div class="segmented">
      <button
        :class="['segmented__option', store.statusFilter === 'active' ? 'segmented__option--active' : '']"
        @click="store.statusFilter = 'active'"
      >
        Active
      </button>
      <button
        :class="['segmented__option', store.statusFilter === '' ? 'segmented__option--active' : '']"
        @click="store.statusFilter = ''"
      >
        All
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens' as *;

.release-search {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;

  &__input-wrap {
    position: relative;
    flex: 1;
    min-width: 200px;
  }

  &__icon {
    position: absolute;
    left: 0.875rem;
    top: 50%;
    transform: translateY(-50%);
    color: $text-muted;
    pointer-events: none;
  }

  &__input {
    width: 100%;
    padding: 0.625rem 0.875rem 0.625rem 2.5rem;
    border: 1px solid $border-subtle;
    border-radius: $radius-pill;
    font-size: 0.875rem;
    font-family: $font-body;
    color: $text-primary;
    background: $surface-2;
    outline: none;
    transition: all 0.25s ease;

    &::placeholder {
      color: $text-muted;
    }

    &:focus {
      border-color: $brand-primary;
      box-shadow: 0 0 0 2px rgba($brand-primary, 0.15);
    }
  }
}
</style>
