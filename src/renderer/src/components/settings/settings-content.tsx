import { SettingsSection } from './settings'
import { PermissionsSection } from './sections/permissions-section'
import { HelpSection } from './sections/help-section'
import { AccountSection } from './sections/account-section'
import { PremiumSection } from './sections/premium-section'

interface SettingsContentProps {
  section: SettingsSection
}

export function SettingsContent({ section }: SettingsContentProps) {
  function renderSection() {
    switch (section) {
      case 'permissions':
        return <PermissionsSection />
      case 'account':
        return <AccountSection />
      case 'premium':
        return <PremiumSection />
      case 'help':
        return <HelpSection />
      default:
        return <PermissionsSection />
    }
  }

  return (
    <div className="p-6">
      {renderSection()}
    </div>
  )
}
