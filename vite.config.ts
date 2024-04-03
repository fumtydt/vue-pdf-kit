import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
// import vue from '@vitejs/plugin-vue'
import topLevelAwait from 'vite-plugin-top-level-await'

export default defineConfig({
  plugins: [topLevelAwait()],
  optimizeDeps: {
    exclude: ['vue-demi']
  },
  build: {
    target: 'es2015',
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: 'VuePdfKit',
      fileName: 'index'
    },
    rollupOptions: {
      external: ['vue', 'vue-demi'],
      output: {
        globals: {
          'vue-demi': 'vueDemi',
          vue: 'Vue'
        }
      }
    }
  }
})
