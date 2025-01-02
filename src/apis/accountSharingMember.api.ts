import { instance as axiosClient } from '@/config'
import { IDataResponse, IAccountSharingInvitationData } from '@/interfaces'

export const accountSharingMemberApi = {
  updateRoleAccess: async (accountSharingMemberData: IAccountSharingInvitationData) => {
    const { data } = await axiosClient.patch<IDataResponse>(
      `accounts-members/${accountSharingMemberData.accountId}`,
      accountSharingMemberData
    )
    return data
  }
}
