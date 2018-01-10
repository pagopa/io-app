import I18n from 'react-native-i18n'

// Import all locales
import en from '../locales/en.json'
import it from '../locales/it.json'

// Should the app fallback to English if user locale doesn't exists
I18n.fallbacks = true

// Define the supported translations
I18n.translations = {
  en,
  it
}

// The method we'll use instead of a regular string
export function strings(name, params = {}) {
  return I18n.t(name, params)
}

export default I18n
