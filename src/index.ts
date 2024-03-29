import VuePdf from './vue-pdf-kit'
import { type App } from 'vue-demi'

VuePdf.install = (Vue: App) => {
  Vue.component(VuePdf.name, VuePdf)
}

export const VuePdfKit = VuePdf
export default VuePdfKit
