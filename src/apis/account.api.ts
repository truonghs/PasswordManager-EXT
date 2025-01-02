import { instance as axiosClient } from '@/config'
import { ICreateAccountData, IUpdateAccountData, IDataResponse, IAccountDataResponse, IPaginationParams, IAccountDataResponsePaginate } from '@/interfaces'

export const accountApi = {
  create: async (createAccountData: ICreateAccountData) => {
    const { data } = await axiosClient.post<IDataResponse>('/accounts/store', createAccountData)
    return data
  },
  getAccounts: async (query: IPaginationParams) => {
    const { data } = await axiosClient.get<IAccountDataResponsePaginate>('/accounts', { params: query })
    return data
  },
  getAccountById: async (accountId: string) => {
    const { data } = await axiosClient.get<IAccountDataResponse>(`/accounts/${accountId}`)
    return data
  },
  update: async ({ accountId, ...updateAccountPayload }: IUpdateAccountData) => {
    const { data } = await axiosClient.put<IDataResponse>(`/accounts/update/${accountId}`, updateAccountPayload)
    return data
  },
  delete: async (accountId: string) => {
    return await axiosClient.delete(`/accounts/delete/${accountId}`)
  }
}
