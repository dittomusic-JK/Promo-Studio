<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { AssetTemplate, ReleaseDetail, ResolvedStyle, AssetSelection } from '@/types'
import { useRenderer } from '@/composables/useRenderer'

const props = defineProps<{
  template: AssetTemplate
  variantId: string
  release: ReleaseDetail
  styleConfig: ResolvedStyle
  overrides?: AssetSelection['overrides']
  maxWidth?: number
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const { renderPreview } = useRenderer()

const maxW = props.maxWidth ?? 400

async function render() {
  if (!canvasRef.value) return

  const dpr = window.devicePixelRatio || 1
  const scale = Math.min(maxW / props.template.width, 1)
  const displayW = Math.round(props.template.width * scale)
  const displayH = Math.round(props.template.height * scale)

  try {
    const rendered = await renderPreview(
      props.template,
      props.variantId,
      props.release,
      props.styleConfig,
      props.overrides,
      scale * dpr,
    )

    // Set canvas backing store to DPR-scaled resolution for sharp rendering
    canvasRef.value.width = Math.round(displayW * dpr)
    canvasRef.value.height = Math.round(displayH * dpr)
    // CSS size stays at logical pixels
    canvasRef.value.style.width = `${displayW}px`
    canvasRef.value.style.height = `${displayH}px`

    const ctx = canvasRef.value.getContext('2d')!
    ctx.drawImage(rendered, 0, 0, displayW * dpr, displayH * dpr)
  } catch (err) {
    console.error('Render error:', err)
  }
}

onMounted(render)
watch(() => [props.variantId, props.styleConfig, props.overrides], render, { deep: true })
</script>

<template>
  <canvas ref="canvasRef" class="preview-canvas" />
</template>

<style scoped lang="scss">
.preview-canvas {
  display: block;
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
}
</style>
