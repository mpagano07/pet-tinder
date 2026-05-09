'use client'

import React, { createContext, useContext } from 'react'
import type { Dictionary } from './dictionaries/en'

const LanguageContext = createContext<Dictionary | null>(null)

export function LanguageProvider({ children, dictionary }: { children: React.ReactNode, dictionary: Dictionary }) {
  return (
    <LanguageContext.Provider value={dictionary}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider')
  }
  return context
}
