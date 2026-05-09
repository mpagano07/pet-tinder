import { headers } from 'next/headers'
import { en } from './dictionaries/en'
import { es } from './dictionaries/es'

const dictionaries = {
  en,
  es,
}

export function getDictionary() {
  const headersList = headers()
  const acceptLanguage = headersList.get('accept-language')
  
  if (acceptLanguage && acceptLanguage.includes('es')) {
    return dictionaries.es
  }
  
  return dictionaries.en
}
