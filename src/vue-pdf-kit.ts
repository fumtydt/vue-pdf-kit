import { ref, watch, nextTick, defineComponent, h, isVue2, onMounted } from 'vue-demi'
import { PixelsPerInch, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf'
import { PDFPageView, EventBus } from 'pdfjs-dist/web/pdf_viewer'
import pdfWorker from './pdf.worker?worker&inline'
// import pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker?url'
import 'pdfjs-dist/legacy/web/pdf_viewer.css'
import { useInitPdfDocument } from './hooks'
import { TextLayerMode, AnnotationMode } from './utils'

import type { PDFPageProxy, OnProgressParameters } from 'pdfjs-dist'

GlobalWorkerOptions.workerPort = new pdfWorker()

let PDF_VIEW_COUNT = 0
export default defineComponent({
  name: 'VuePdfKit',
  props: {
    source: {
      type: [ArrayBuffer, Array<number>, String],
      required: true
    },
    password: {
      type: String,
      default: ''
    },
    scale: Number,
    cMapUrl: String,
    enableTextLayer: {
      type: Boolean,
      default: false
    },
    enableAnnotation: {
      type: Boolean,
      default: false
    }
    // onProgress: {
    //   type: Function as PropType<InitPdfOptions['onProgress']>
    // },
    // onPassword: {
    //   type: Function as PropType<InitPdfOptions['onPassword']>
    // }
  },
  emits: ['progress', 'password'],
  setup(props, { emit }) {
    const total = ref(0)
    const pdf_viewer_id = 'pdf_viewer' + ++PDF_VIEW_COUNT
    const pdfView = ref()

    const { doc } = useInitPdfDocument({
      props,
      onProgress: (progressParameter: OnProgressParameters) => {
        emit('progress', progressParameter.loaded / progressParameter.total)
      },
      onPassword(callback) {
        emit('password', { callback })
      }
    })

    watch(() => doc.value, render)

    async function render() {
      if (!doc.value) return

      total.value = doc.value.numPages
      await nextTick()

      // const wrapper = document.querySelector(`#${pdf_viewer_id}`) as HTMLDivElement
      const wrapper = pdfView.value
      let wrapperWidth = 0
      if (wrapper) {
        wrapperWidth = parseFloat(window.getComputedStyle(wrapper).width)
      }

      let Fragment = null
      for (let index = 1; index <= doc.value.numPages; index++) {
        const page = await doc.value.getPage(index)

        let scale = props?.scale
        if (!scale) {
          scale =
            (wrapperWidth - 20) /
            (page.getViewport({ scale: 1 }).width * PixelsPerInch.PDF_TO_CSS_UNITS)
        }
        const container = document.createElement('div')
        renderPage(index, page, container, scale)
        
        if (!Fragment) {
          Fragment = document.createDocumentFragment()
        }

        if (Fragment) {
          Fragment.appendChild(container)
        }

        if ((index % 10 === 0 || index === doc.value.numPages) && Fragment) {
          wrapper.appendChild(Fragment)
          Fragment = null
        }
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
        // maxCanvasPixels: 4096 * 4096 * 2,
        annotationMode: props.enableAnnotation
          ? AnnotationMode.ENABLE_FORMS
          : AnnotationMode.DISABLE
      })

      pdfPageViewer.setPdfPage(page)
      pdfPageViewer.draw()
    }

    // const generateId = (id: string) => {
    //   if (isVue2) {
    //     return {
    //       attrs: { id }
    //     }
    //   }
    //   return { id }
    // }

    return () =>
      h(
        'div',
        Object.assign(
          {
            ref: pdfView
          },
          // generateId(pdf_viewer_id)
        )
        // [...Array(total.value + 1).keys()].map((i) =>
        //   h(
        //     'div',
        //     Object.assign(
        //       {
        //         key: i,
        //         style: { position: 'relative' }
        //       },
        //       generateId(`${pdf_viewer_id}_${PDF_PAGE_PREFIX}${i}`)
        //     )
        //   )
        // )
      )
  }
})
