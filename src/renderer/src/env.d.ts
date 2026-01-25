/// <reference types="vite/client" />
/// <reference types="../../preload/index.d.ts" />

import 'react'

declare module 'react' {
  interface CSSProperties {
    [key: `--${string}`]: string | number
  }
}

interface ImportMetaEnv {
  readonly RENDERER_VITE_APP_TITLE: string
  
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare global {
  interface Window {
    api: {
      ping: () => Promise<string>
      windowMinimize: () => Promise<void>
      windowMaximize: () => Promise<void>
      windowClose: () => Promise<void>
      windowIsMaximized: () => Promise<boolean>
      openFolder: (folderPath: string) => Promise<{ success: boolean; error?: string }>
    }
  }
}
