<template>
  <div id="pdf_viewer" ref="pdf_viewer">
    <div v-for="i in total" :key="i" ref="pdfRefs" style="position: relative"></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, defineProps, watch, nextTick, defineOptions } from 'vue-demi'
import { PixelsPerInch, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf'
import { PDFPageView, EventBus } from 'pdfjs-dist/web/pdf_viewer'
import pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker.min?url'
import 'pdfjs-dist/legacy/web/pdf_viewer.css'
import { useInitPdfDocumnet, type InitPdfOptions } from './hooks'
import { TextLayerMode, AnnotationMode } from './utils'

import type { PDFPageProxy } from 'pdfjs-dist'

defineOptions({
  name: 'VuePdfKit'
})

const total = ref(0)
const pdfRefs = ref<HTMLDivElement[]>([])
const pdf_viewer = ref<HTMLDivElement>()

GlobalWorkerOptions.workerSrc = pdfWorker

const props = defineProps<{
  source: string
  password?: string
  enableCMap?: boolean
  enableTextLayer?: boolean
  enableAnnotation?: boolean
  scale?: number
  onProgress?: InitPdfOptions['onProgress']
  onPassword?: InitPdfOptions['onPassword']
}>()

const { doc } = useInitPdfDocumnet({ ...props })

watch(doc, render)

async function render() {
  if (!doc.value) return

  total.value = doc.value.numPages
  await nextTick()

  let scale = props?.scale

  let wrapperWidth = 0
  if (pdf_viewer.value) {
    wrapperWidth = parseFloat(window.getComputedStyle(pdf_viewer.value).width)
  }

  for (let index = 1; index <= doc.value.numPages; index++) {
    const page = await doc.value.getPage(index)

    if (!scale) {
      scale =
        (wrapperWidth - 20) /
        (page.getViewport({ scale: 1 }).width * PixelsPerInch.PDF_TO_CSS_UNITS)
    }

    renderPage(index, page, pdfRefs.value[index - 1], scale)
  }
}

function renderPage(id: number, page: PDFPageProxy, container: HTMLDivElement, scale: number) {
  const eventbus = new EventBus()
  const pageViewPort = page.getViewport({ scale: 1 })

  const pdfPageViewer = new PDFPageView({
    container,
    id,
    scale,
    defaultViewport: pageViewPort,
    eventBus: eventbus,
    textLayerMode: props.enableTextLayer ? TextLayerMode.ENABLE : TextLayerMode.DISABLE,
    annotationMode: props.enableAnnotation ? AnnotationMode.ENABLE_FORMS : AnnotationMode.DISABLE
  })

  pdfPageViewer.setPdfPage(page)
  pdfPageViewer.draw()
}
</script>

<style lang="css" scoped>
#pdf_viewer {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
./utils
