import {
  ref,
  watch,
  nextTick,
  defineComponent,
  type PropType,
  h,
  isVue2,
  isVue3,
  Vue2
} from 'vue-demi'
import { PixelsPerInch, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf'
import { PDFPageView, EventBus } from 'pdfjs-dist/web/pdf_viewer'
import pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker.min?url'
import 'pdfjs-dist/legacy/web/pdf_viewer.css'
import { useInitPdfDocument, type InitPdfOptions } from './hooks'
import { TextLayerMode, AnnotationMode } from './utils'

import type { PDFPageProxy } from 'pdfjs-dist'

GlobalWorkerOptions.workerSrc = pdfWorker

const PDF_PAGE_PREFIX = 'pdf_page_'

export default defineComponent({
  name: 'VuePdfKit',
  props: {
    source: {
      type: String,
      required: true
    },
    password: {
      type: String,
      default: ''
    },
    scale: Number,
    enableCMap: {
      type: Boolean,
      default: false
    },
    enableTextLayer: {
      type: Boolean,
      default: false
    },
    enableAnnotation: {
      type: Boolean,
      default: false
    },
    onProgress: {
      type: Function as PropType<InitPdfOptions['onProgress']>
    },
    onPassword: {
      type: Function as PropType<InitPdfOptions['onPassword']>
    }
  },
  setup(props) {
    const total = ref(0)

    const { doc } = useInitPdfDocument({ ...props })

    watch(() => doc.value, render)

    async function render() {
      if (!doc.value) return

      total.value = doc.value.numPages
      await nextTick()

      const wrapper = document.querySelector(`#pdf_viewer`) as HTMLDivElement
      let wrapperWidth = 0
      if (wrapper) {
        wrapperWidth = parseFloat(window.getComputedStyle(wrapper).width)
      }

      for (let index = 1; index <= doc.value.numPages; index++) {
        const page = await doc.value.getPage(index)

        let scale = props?.scale
        if (!scale) {
          scale =
            (wrapperWidth - 20) /
            (page.getViewport({ scale: 1 }).width * PixelsPerInch.PDF_TO_CSS_UNITS)
        }

        const container = document.querySelector(`#${PDF_PAGE_PREFIX}${index}`) as HTMLDivElement
        renderPage(index, page, container, scale)
      }
    }

    function renderPage(id: number, page: PDFPageProxy, container: HTMLDivElement, scale: number) {
      const eventBus = new EventBus()
      const pageViewPort = page.getViewport({ scale: 1 })

      const pdfPageViewer = new PDFPageView({
        container,
        id,
        scale,
        defaultViewport: pageViewPort,
        eventBus,
        textLayerMode: props.enableTextLayer ? TextLayerMode.ENABLE : TextLayerMode.DISABLE,
        annotationMode: props.enableAnnotation
          ? AnnotationMode.ENABLE_FORMS
          : AnnotationMode.DISABLE
      })

      pdfPageViewer.setPdfPage(page)
      pdfPageViewer.draw()
    }

    const generateId = (id: string) => {
      if (isVue2) {
        return {
          attrs: { id }
        }
      }
      return { id }
    }

    return () =>
      h(
        'div',
        generateId('pdf_viewer'),
        [...Array(total.value + 1).keys()].map((i) =>
          h(
            'div',
            Object.assign(
              {
                key: i,
                style: { position: 'relative' }
              },
              generateId(`${PDF_PAGE_PREFIX}${i}`)
            )
          )
        )
      )
  }
})
