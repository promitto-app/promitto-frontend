import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/auth-context'
import { LoginScreen } from './components/auth/login-screen'
import { Header } from './components/layout/header'
import { LoadingScreen } from './components/shared/loading-screen'
import { Settings } from './components/settings/settings'
import { HomeScreen } from './components/home/home-screen'
import { UpdateNotification } from './components/shared/update-notification'
import './styles.css'

type AppView = 'main' | 'settings'

function AppContent() {
  const [currentView, setCurrentView] = useState<AppView>('main')
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    const handleNavigate = (event: CustomEvent) => {
      if (event.detail === 'settings') {
        setCurrentView('settings')
      } else if (event.detail === 'main') {
        setCurrentView('main')
      }
    }

    window.addEventListener('navigate', handleNavigate as EventListener)
    
    return () => {
      window.removeEventListener('navigate', handleNavigate as EventListener)
    }
  }, [])

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return (
      <LoginScreen />
    )
  }

  if (currentView === 'settings') {
    return (
      <>
        <Settings onBack={() => setCurrentView('main')} />
        <UpdateNotification />
      </>
    )
  }

  return (
    <div 
      id="app" 
      className="w-screen h-screen bg-background animate-in fade-in duration-500 flex flex-col"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => e.preventDefault()}
    >
      <Header />
      <main className="flex-1 overflow-y-auto pt-12">
        <HomeScreen />
      </main>
      <UpdateNotification />
    </div>
  )
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}