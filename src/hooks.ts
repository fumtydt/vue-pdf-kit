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
  source: string
  password?: string | undefined
  enableCMap?: boolean
  onProgress?: (parameter: OnProgressParameters) => void | undefined
  onPassword?: (func: (password: string) => void, passwordResponses: number) => void | undefined
}

export function useInitPdfDocumnet({
  source,
  password,
  enableCMap = false,
  onProgress,
  onPassword
}: InitPdfOptions) {
  const doc = shallowRef<PDFDocumentProxy | null>(null)
  const loadingTask = shallowRef<PDFDocumentLoadingTask>()

  watchEffect(async () => {
    const options: DocumentInitParameters = {}

    if (!source) return

    if (source.startsWith('http') || source.startsWith('https') || source.startsWith('/')) {
      options.url = source
    } else {
      options.data = source
    }

    if (enableCMap) {
      const url = new URL('../node_modules/pdfjs-dist/cmaps/', import.meta.url)
      options.cMapUrl = url.href
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
