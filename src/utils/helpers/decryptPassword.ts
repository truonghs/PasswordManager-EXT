import * as CryptoJS from 'crypto-js'
import { ENVIRONMENT_KEYS } from '@/utils/constants'

export const decryptPassword = (encryptedPassword: string): string => {
  const decrypted = CryptoJS.AES.decrypt(
    encryptedPassword,
    CryptoJS.enc.Utf8.parse(ENVIRONMENT_KEYS.VITE_ENCRYPTION_KEY),
    {
      iv: CryptoJS.enc.Utf8.parse(ENVIRONMENT_KEYS.VITE_ENCRYPTION_IV),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }
  )
  return decrypted.toString(CryptoJS.enc.Utf8)
}
