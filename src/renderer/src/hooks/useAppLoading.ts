import { useState, useEffect, useRef } from 'react'

export const useAppLoading = (
  minLoadingTime: number = 1000,
  loadingTasks: Promise<unknown>[] = []
): boolean => {
  const [isLoading, setIsLoading] = useState(true)
  const tasksRef = useRef(loadingTasks)

  useEffect(() => {
    tasksRef.current = loadingTasks
  }, [loadingTasks])

  useEffect(() => {
    const loadApp = async () => {
      const startTime = Date.now()

      try {
        
        if (tasksRef.current.length > 0) {
          await Promise.all(tasksRef.current)
        }

        const elapsedTime = Date.now() - startTime
        const remainingTime = Math.max(0, minLoadingTime - elapsedTime)

        if (remainingTime > 0) {
          await new Promise(resolve => setTimeout(resolve, remainingTime))
        }
      } catch (error) {
        console.error('Erro durante o carregamento:', error)
        
        const elapsedTime = Date.now() - startTime
        const remainingTime = Math.max(0, minLoadingTime - elapsedTime)
        if (remainingTime > 0) {
          await new Promise(resolve => setTimeout(resolve, remainingTime))
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadApp()
    
  }, [minLoadingTime])

  return isLoading
}
