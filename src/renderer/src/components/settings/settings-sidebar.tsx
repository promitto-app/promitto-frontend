import {
  Shield,
  User,
  Star,
  HelpCircle
} from 'lucide-react'
import { SettingsSection } from './settings'

interface SettingsSidebarProps {
  currentSection: SettingsSection
  onSectionChange: (section: SettingsSection) => void
}

const menuItems = [
  { id: 'permissions', label: 'Permissões', icon: Shield },
  { id: 'account', label: 'Conta', icon: User },
  { id: 'premium', label: 'Premium', icon: Star },
  { id: 'help', label: 'Ajuda', icon: HelpCircle }
] as Array<{
  id: SettingsSection
  label: string
  icon: React.ComponentType<{ className?: string }>
}>

export function SettingsSidebar({
  currentSection,
  onSectionChange
}: SettingsSidebarProps) {
  return (
    <div className="w-64 bg-muted border-r border-border flex flex-col">
      <nav className="flex-1 p-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = currentSection === item.id

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-md mb-1
                transition-colors text-left
                ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }
              `}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
