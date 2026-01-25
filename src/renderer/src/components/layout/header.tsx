import { Settings, Power } from 'lucide-react'
import { useAuth } from '../../contexts/auth-context'

export function Header() {
  const { logout } = useAuth()

  function handleFreeClick() {
    console.log('Botão GRÁTIS clicado')
  }

  function handleSettingsClick() {
    window.dispatchEvent(new CustomEvent('navigate', { detail: 'settings' }))
  }

  function handlePowerClick() {
    logout()
  }

  return (
    <header 
      className="fixed top-0 left-0 right-0 h-12 bg-background border-b border-border z-[1000] select-none flex items-center"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => e.preventDefault()}
    >
      <div className="flex items-center justify-end w-full h-full px-3 gap-2">
        <div className="flex items-center gap-2 min-w-fit">
          <button
            className="flex items-center justify-center border-none bg-muted text-white cursor-pointer transition-all rounded-md text-xs font-semibold px-3 py-1.5 min-w-[60px] hover:bg-muted/80 hover:-translate-y-px active:translate-y-0"
            onClick={handleFreeClick}
          >
            GRÁTIS
          </button>
          <button
            className="flex items-center justify-center gap-2 border-none bg-muted text-white cursor-pointer transition-all rounded-md text-xs font-medium px-3 py-1.5 hover:bg-muted/80 hover:-translate-y-px active:translate-y-0"
            onClick={handleSettingsClick}
          >
            <Settings className="w-4 h-4 text-white" />
            <span>Configurações</span>
          </button>
          <button
            className="flex items-center justify-center gap-2 border-none bg-muted text-white cursor-pointer transition-all rounded-md text-xs font-medium px-3 py-1.5 hover:bg-muted/80 hover:-translate-y-px active:translate-y-0"
            onClick={handlePowerClick}
          >
            <Power className="w-4 h-4 text-white" />
            <span>Deslogar</span>
          </button>
        </div>
      </div>
    </header>
  )
}
