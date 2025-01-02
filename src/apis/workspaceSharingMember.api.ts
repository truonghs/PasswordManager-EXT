import { instance as axiosClient } from '@/config'
import { IDataResponse, IWorkspaceSharingInvitationData } from '@/interfaces'

export const workspaceSharingMemberApi = {
  updateRoleAccess: async (workspaceSharingMemberData: IWorkspaceSharingInvitationData) => {
    const { data } = await axiosClient.patch<IDataResponse>(
      `workspaces-members/${workspaceSharingMemberData.workspaceId}`,
      workspaceSharingMemberData
    )
    return data
  }
}
