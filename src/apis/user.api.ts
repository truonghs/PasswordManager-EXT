import { ICurrentUser } from '@/interfaces'
import { instance as axiosClient } from '@/config'

export const userApi = {
  getCurrentUser: async () => {
    const { data } = await axiosClient.get<ICurrentUser>('/users/currentUser')
    return data
  },

  skipTwoFa: async () => {
    const { data } = await axiosClient.patch<string>('users/skip-twofa')
    return data
  }
}
