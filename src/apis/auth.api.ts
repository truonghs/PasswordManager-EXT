import { instance as axiosClient } from '@/config'
import { ILoginData, ILoginResponse, IVerifyTokenTwoFa } from '@/interfaces'

export const authApi = {
  login: async (userData: ILoginData) => {
    const { data } = await axiosClient.post<ILoginResponse>('/auth/login', userData)
    return data
  },

  logout: async () => {
    const { data } = await axiosClient.post('/auth/logout')
    return data
  },

  getQrCodeValue: async (userId: string) => {
    const { data } = await axiosClient.get<{ qrCodeUrl: string }>(`/auth/generate-qr/${userId}`)
    return data
  },

  verifyTokenTwoFa: async (verifyTokenTwoFaData: IVerifyTokenTwoFa) => {
    const { data } = await axiosClient.post<ILoginResponse>('/auth/verify-token-2fa', verifyTokenTwoFaData)
    return data
  }
}
