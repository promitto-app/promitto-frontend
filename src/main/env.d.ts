/// <reference types="electron-vite/node" />

interface ImportMetaEnv {
  readonly MAIN_VITE_APP_TITLE: string
  
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
