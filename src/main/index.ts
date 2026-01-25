import { app, shell, BrowserWindow, ipcMain, session, desktopCapturer, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { defaultSecurityOptions, isSafeExternalUrl } from './utils/security'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import fs from 'fs'
import https from 'https'

log.transports.file.level = 'debug'
log.transports.console.level = 'debug'
autoUpdater.logger = log

let mainWindow: BrowserWindow | null = null

function sendLogToRenderer(message: string, data?: any) {
  log.info(message, data || '')

  if (mainWindow && !mainWindow.isDestroyed()) {
    try {
      mainWindow.webContents.send('debug-log', {
        message,
        data,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      log.error('Erro ao enviar log para renderer:', error)
    }
  } else {
    log.warn('Tentou enviar log mas janela não está pronta:', message)
  }
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    frame: true,
    autoHideMenuBar: true,
    backgroundColor: '#1a1a1a',
    webPreferences: {
      preload: join(__dirname, '../preload/index.cjs'),
      ...defaultSecurityOptions
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()

    setTimeout(() => {
      sendLogToRenderer('🟢 Janela pronta e visível')
      sendLogToRenderer(`📦 App empacotado: ${app.isPackaged}`)
      sendLogToRenderer(`📍 Versão atual: ${app.getVersion()}`)

      setupAutoUpdater()
    }, 1000)
  })

  mainWindow.webContents.setWindowOpenHandler(details => {
    if (isSafeExternalUrl(details.url)) shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function setupScreenCapture() {
  try {
    const defaultSession = session.defaultSession as any
    defaultSession.setDisplayMediaRequestHandler(
      (_request: unknown, callback: (stream: { video?: unknown; audio?: string }) => void) => {
        desktopCapturer
          .getSources({ types: ['screen'] })
          .then(sources => callback({ video: sources[0], audio: 'loopback' }))
          .catch(error => {
            console.error('Erro ao obter fontes de captura:', error)
            callback({})
          })
      },
      { useSystemPicker: true }
    )
  } catch (error) {
    console.error('Erro ao configurar handler de compartilhamento de tela:', error)
  }
}

function setupAutoUpdater() {
  sendLogToRenderer('🚀 Configurando auto-updater...')

  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  sendLogToRenderer('⚙️ AutoDownload: ' + autoUpdater.autoDownload)
  sendLogToRenderer('⚙️ AutoInstall: ' + autoUpdater.autoInstallOnAppQuit)

  autoUpdater.on('checking-for-update', () => {
    sendLogToRenderer('🔍 VERIFICANDO ATUALIZAÇÕES...')
  })

  autoUpdater.on('update-available', info => {
    sendLogToRenderer('✅ ATUALIZAÇÃO DISPONÍVEL!', {
      version: info.version,
      releaseDate: info.releaseDate
    })
    mainWindow?.webContents.send('update-available', info)
  })

  autoUpdater.on('update-not-available', info => {
    sendLogToRenderer('❌ Nenhuma atualização disponível', {
      version: info.version
    })
  })

  autoUpdater.on('error', error => {
    sendLogToRenderer('🔥 ERRO!', {
      message: error.message,
      name: error.name
    })
    mainWindow?.webContents.send('update-error', error)
  })

  autoUpdater.on('download-progress', progressObj => {
    const percent = Math.round(progressObj.percent)
    sendLogToRenderer(`📥 Download: ${percent}%`, {
      percent: progressObj.percent,
      transferred: `${(progressObj.transferred / 1024 / 1024).toFixed(1)} MB`,
      total: `${(progressObj.total / 1024 / 1024).toFixed(1)} MB`,
      speed: `${(progressObj.bytesPerSecond / 1024 / 1024).toFixed(2)} MB/s`
    })
    mainWindow?.webContents.send('download-progress', progressObj)
  })

  autoUpdater.on('update-downloaded', info => {
    sendLogToRenderer('✅ DOWNLOAD COMPLETO!', {
      version: info.version
    })
    mainWindow?.webContents.send('update-downloaded', info)
  })

  if (app.isPackaged) {
    sendLogToRenderer('✅ App empacotado - iniciando verificação automática')

    setTimeout(() => {
      sendLogToRenderer('🎯 Iniciando primeira verificação...')
      autoUpdater
        .checkForUpdates()
        .then(result => {
          sendLogToRenderer('📊 Verificação completa', {
            currentVersion: app.getVersion(),
            updateInfo: result.updateInfo
          })
        })
        .catch(error => {
          sendLogToRenderer('❌ Erro na verificação', { message: error.message })
        })
    }, 3000)

    setInterval(() => {
      sendLogToRenderer('⏰ Verificação automática (30s)')
      autoUpdater.checkForUpdates()
    }, 30 * 1000)
  } else {
    sendLogToRenderer('⚠️ Modo DEV - auto-update DESABILITADO')
    sendLogToRenderer('ℹ️ Para testar updates, use: npm run dist:win')
  }
}

function setupIPC() {
  ipcMain.handle('ping', () => 'pong')

  ipcMain.handle('window-minimize', () => BrowserWindow.getFocusedWindow()?.minimize())

  ipcMain.handle('window-maximize', () => {
    const window = BrowserWindow.getFocusedWindow()
    if (window) window.isMaximized() ? window.unmaximize() : window.maximize()
  })

  ipcMain.handle('window-close', () => BrowserWindow.getFocusedWindow()?.close())

  ipcMain.handle(
    'window-is-maximized',
    () => BrowserWindow.getFocusedWindow()?.isMaximized() ?? false
  )

  ipcMain.handle('check-for-updates', async () => {
    sendLogToRenderer('🔍 Verificação MANUAL solicitada')

    if (!app.isPackaged) {
      sendLogToRenderer('⚠️ Não pode verificar em modo DEV')
      return { available: false, message: 'Atualizações só funcionam em versão empacotada' }
    }

    try {
      const result = await autoUpdater.checkForUpdates()
      sendLogToRenderer('📊 Resultado verificação manual', result)
      return { available: true, info: result?.updateInfo }
    } catch (error) {
      sendLogToRenderer('❌ Erro verificação manual', error)
      return {
        available: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  })

  ipcMain.handle('install-update', () => {
    sendLogToRenderer('🔄 INSTALANDO E REINICIANDO...')
    autoUpdater.quitAndInstall(false, true)
  })

  ipcMain.handle('get-log-path', () => {
    const logPath = log.transports.file.getFile().path
    sendLogToRenderer('📄 Log salvo em:', { path: logPath })
    return logPath
  })

  ipcMain.handle('open-folder', async (_event, folderPath: string) => {
    try {
      await shell.openPath(folderPath)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  })

  ipcMain.handle('download-files', async (_event, files: { url: string; name: string }[]) => {
    try {
      const { filePaths } = await dialog.showOpenDialog({
        title: 'Escolha a pasta para salvar os relatórios',
        properties: ['openDirectory']
      })

      if (!filePaths || filePaths.length === 0) {
        return { success: false, message: 'Download cancelado pelo usuário' }
      }

      const folderPath = filePaths[0]

      for (const file of files) {
        const fullPath = join(folderPath, file.name)
        await new Promise<void>((resolve, reject) => {
          const fileStream = fs.createWriteStream(fullPath)
          https
            .get(file.url, response => {
              response.pipe(fileStream)
              fileStream.on('finish', () => {
                fileStream.close()
                resolve()
              })
            })
            .on('error', err => {
              fs.unlink(fullPath, () => {})
              reject(err)
            })
        })
      }

      return { success: true, folderPath }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  })
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.promitto.app')

  log.info('='.repeat(50))
  log.info('APP INICIANDO')
  log.info('Versão:', app.getVersion())
  log.info('Empacotado:', app.isPackaged)
  log.info('='.repeat(50))

  setupScreenCapture()
  setupIPC()

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
