import { useState } from 'react'

export const useChromeStorage = <T>(key: string) => {
  const [storedValue, setStoredValue] = useState<T>()

  const setValue = async (value: T) => {
    await chrome.storage.local.set({ [key]: value })
    setStoredValue(value)
  }

  const getValue = async () => {
    const result = await chrome.storage.local.get(key)
    setStoredValue(result[key])
  }
  return { storedValue, setValue, getValue }
}
