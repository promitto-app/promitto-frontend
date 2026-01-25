/// <reference types="../../preload/index.d.ts" />

declare global {
  interface Window {
    api: {
      ping: () => Promise<string>
      windowMinimize: () => Promise<void>
      windowMaximize: () => Promise<void>
      windowClose: () => Promise<void>
      windowIsMaximized: () => Promise<boolean>
    }
  }
}

export {}
