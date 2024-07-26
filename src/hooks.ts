import { watchEffect, shallowReadonly, shallowRef, onUnmounted } from 'vue-demi'
import {
  getDocument,
  InvalidPDFException,
  MissingPDFException,
  UnexpectedResponseException
} from 'pdfjs-dist/legacy/build/pdf'

import type { OnProgressParameters, PDFDocumentProxy } from 'pdfjs-dist'
import type {
  DocumentInitParameters,
  PDFDocumentLoadingTask
} from 'pdfjs-dist/types/src/display/api'

export type InitPdfOptions = {
  // source: Ref<string>
  // password?: string | undefined
  // cMapUrl?: string
  props: {
    source: ArrayBuffer | Array<number> | string
    password: string
    cMapUrl?: string
  }
  onProgress?: (parameter: OnProgressParameters) => void | undefined
  onPassword?: (func: (password: string) => void, passwordResponses: number) => void | undefined
}

export function useInitPdfDocument({
  // source,
  // password,
  // cMapUrl = '',
  props,
  onProgress,
  onPassword
}: InitPdfOptions) {
  const doc = shallowRef<PDFDocumentProxy | null>(null)
  const loadingTask = shallowRef<PDFDocumentLoadingTask>()

  watchEffect(async () => {
    const options: DocumentInitParameters = {}

    const { source, password, cMapUrl } = props

    if (!source) return

    if (typeof source == 'string') {
      if (source.startsWith('http') || source.startsWith('https') || source.startsWith('/')) {
        options.url = source
      } else if (source.includes('base64')) {
        options.data = window.atob(source.replace('data:application/pdf;base64,', ''))
      } else {
        options.data = window.atob(source)
      }
    } else {
      options.data = source
    }

    if (cMapUrl) {
      options.cMapUrl = cMapUrl
      options.cMapPacked = true
    }

    if (password) {
      options.password = password
    }

    loadingTask.value = getDocument(options)

    if (!loadingTask.value) return

    if (onProgress && typeof onProgress === 'function') {
      loadingTask.value.onProgress = onProgress
    }

    if (onPassword) {
      loadingTask.value.onPassword = onPassword
    }

    try {
      doc.value = await loadingTask.value.promise
    } catch (error) {
      doc.value = null

      if (error instanceof InvalidPDFException) {
        console.error('invalid file', error?.message)
      } else if (error instanceof MissingPDFException) {
        console.error('missing file', error?.message)
      } else if (error instanceof UnexpectedResponseException) {
        console.error('unexpected file', error?.message)
      } else {
        console.error(error)
      }
    }
  })

  onUnmounted(() => {
    doc.value?.destroy()
    loadingTask.value = undefined
  })

  return {
    doc: shallowReadonly(doc)
  }
}
