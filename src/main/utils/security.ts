
export const defaultSecurityOptions = {
  contextIsolation: true,
  nodeIntegration: false,
  sandbox: false, 
  webSecurity: true,
  allowRunningInsecureContent: false,
  experimentalFeatures: false
}

export function isSafeExternalUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    
    return ['http:', 'https:', 'mailto:'].includes(parsedUrl.protocol)
  } catch {
    return false
  }
}

export function sanitizeIpcData(data: unknown): unknown {
  
  return JSON.parse(JSON.stringify(data))
}
