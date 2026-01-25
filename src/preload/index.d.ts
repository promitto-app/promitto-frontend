import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      ping: () => Promise<string>
      windowMinimize: () => Promise<void>
      windowMaximize: () => Promise<void>
      windowClose: () => Promise<void>
      windowIsMaximized: () => Promise<boolean>
      openFolder: (folderPath: string) => Promise<{ success: boolean; error?: string }>
      downloadFiles?: (files: { url: string; name: string }[]) => Promise<{
        success: boolean
        message?: string
        folderPath?: string
      }>

      checkForUpdates?: () => Promise<{
        available: boolean
        info?: UpdateInfo
        message?: string
        error?: string
      }>
      installUpdate?: () => void

      onUpdateAvailable?: (callback: (info: UpdateInfo) => void) => void
      onDownloadProgress?: (callback: (progress: DownloadProgress) => void) => void
      onUpdateDownloaded?: (callback: (info: UpdateInfo) => void) => void
      onUpdateError?: (callback: (error: { message: string }) => void) => void
      onUpdateError?: (callback: (error: { message: string }) => void) => void
      onDebugLog?: (callback: (log: DebugLog) => void) => void
    }
  }
}

export {}
