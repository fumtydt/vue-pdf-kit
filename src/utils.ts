import type { Plugin } from 'vue-demi'
export const TextLayerMode = {
  DISABLE: 0,
  ENABLE: 1,
  ENABLE_PERMISSIONS: 2
}

export const AnnotationMode = {
  DISABLE: 0,
  ENABLE: 1,
  ENABLE_FORMS: 2,
  ENABLE_STORAGE: 3
}

export type SFCWithInstall<T> = T & Plugin
export const withInstall = <T, E extends Record<string, any>>(main: T, extra?: E) => {
  ;(main as SFCWithInstall<T>).install = (app): void => {
    for (const comp of [main, ...Object.values(extra ?? {})]) {
      app.component(comp.name, comp)
    }
  }

  if (extra) {
    for (const [key, comp] of Object.entries(extra)) {
      ;(main as any)[key] = comp
    }
  }
  return main as SFCWithInstall<T> & E
}
