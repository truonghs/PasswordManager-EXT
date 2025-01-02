import { instance as axiosClient } from '@/config'
import { IDataResponse, ILoginHistoryData } from '@/interfaces'

export const loginHistoryApi = {
  store: async (loginHistoryData: ILoginHistoryData) => {
    const { data } = await axiosClient.post<IDataResponse>('/login-history/store', loginHistoryData)
    return data
  }
}
