import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import topLevelAwait from 'vite-plugin-top-level-await'

export default defineConfig({
  plugins: [vue(), topLevelAwait()],
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: 'VuePdfKit',
      fileName: 'index'
    },
    rollupOptions: {
      external: ['pdfjs-dist', 'vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
})
