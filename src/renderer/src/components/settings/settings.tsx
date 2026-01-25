import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { SettingsSidebar } from './settings-sidebar'
import { SettingsContent } from './settings-content'

export type SettingsSection =
  | 'premium'
  | 'help'
  | 'permissions'
  | 'account'

interface SettingsProps {
  onBack: () => void
}

export function Settings({ onBack }: SettingsProps) {
  const [currentSection, setCurrentSection] = useState<SettingsSection>('permissions')

  return (
    <div className="w-screen h-screen bg-background flex flex-col">
      <div className="h-12 border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button className="p-1.5 rounded hover:bg-white/5 transition-colors" onClick={onBack}>
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-white text-lg font-semibold">Promitto</h1>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <SettingsSidebar currentSection={currentSection} onSectionChange={setCurrentSection} />

        <div className="flex-1 overflow-y-auto bg-background">
          <SettingsContent section={currentSection} />
        </div>
      </div>
    </div>
  )
}
