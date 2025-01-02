import { instance as axiosClient } from '@/config'
import { IDataResponse, IVerifyHighLevelPassword } from '@/interfaces'

export const highLevelPasswordApi = {
  verify: async (verifyHighLevelPasswordData: IVerifyHighLevelPassword) => {
    const { data } = await axiosClient.post<IDataResponse>('high-level-passwords/verify', verifyHighLevelPasswordData)
    return data
  }
}
