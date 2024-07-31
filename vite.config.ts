import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type Plugin } from 'vite'

function rejectPlugin(): Plugin {
  return {
    name: 'reject-plugin',
    async transform(code, id) {
      if (id.endsWith('.js') || id.endsWith('m.js')) {
        return `if (!String.prototype.replaceAll) {
          Object.defineProperty(String.prototype, 'replaceAll', {
            value: function(search, replacement) {
              return this.replace(new RegExp(search, 'g'), replacement);
            },
            writable: true,
            enumerable: false, 
            configurable: true
          });
        }
        \n${code}`
      }
      return code
    }
  }
}
export default defineConfig({
  plugins: [rejectPlugin()],
  optimizeDeps: {
    exclude: ['vue-demi']
  },
  build: {
    target: 'es2017',
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
