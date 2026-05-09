'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { PageLoader } from '@/components/ui/PageLoader'

interface LoadingContextType {
  isLoading: boolean
  setLoading: (loading: boolean) => void
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  setLoading: () => {},
})

export const useLoading = () => useContext(LoadingContext)

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Hide loader whenever the route completes (pathname or searchParams changes)
  useEffect(() => {
    setIsLoading(false)
  }, [pathname, searchParams])

  const setLoading = useCallback((val: boolean) => {
    setIsLoading(val)
  }, [])

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading }}>
      {isLoading && <PageLoader />}
      {children}
    </LoadingContext.Provider>
  )
}
