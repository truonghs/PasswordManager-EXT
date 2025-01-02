import { instance as axiosClient } from '@/config'
import { IDataResponse, IAccountSharingInvitationData, IAccountSharingInvitaionResponse } from '@/interfaces'

export const accountSharingInvitationApi = {
  create: async (accountSharingInvitationData: IAccountSharingInvitationData) => {
    const { data } = await axiosClient.post<IDataResponse>(`accounts-sharing/create`, accountSharingInvitationData)
    return data
  },

  getPendingInvitation: async () => {
    const { data } = await axiosClient.get<IAccountSharingInvitaionResponse[]>(`accounts-sharing`)
    return data
  },

  decline: async (inviteId: string) => {
    const response = await axiosClient.patch<IDataResponse>(`accounts-sharing/decline-invitation/${inviteId}`)
    return response.data
  }
}
