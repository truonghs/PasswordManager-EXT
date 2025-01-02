import { LOCAL_STORAGE_KEYS } from '@/utils/constants'

export const loadLanguageFromStorage = async () => {
  const response = await chrome.storage.sync.get(LOCAL_STORAGE_KEYS.lang)
  return response?.language || 'en'
}
