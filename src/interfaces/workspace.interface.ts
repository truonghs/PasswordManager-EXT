import { IAccountDataResponse } from './account.interface'
import { RoleAccess } from '@/utils/constants'

export interface IWorkspaceInputData {
  name: string
  accounts: IAccountDataResponse[]
}

export interface IWorkspaceData extends IWorkspaceInputData {
  id: string
  owner: IWorkspaceSharingMemberInfo
}

export interface IWorkspaceUpdateData extends IWorkspaceInputData {
  id: string
}

export interface IWorkspaceShareData {
  workspaceId?: string | undefined
  emails?: (string | undefined)[] | undefined
}

export interface IWorkspaceDataResponse extends IWorkspaceInputData, IWorkspaceData {
  members: IWorkspaceSharingMemberInfo[]
}

export interface IWorkspaceSharingMemberInfo {
  id?: string
  name?: string
  email: string
  avatar?: string
  roleAccess: RoleAccess
}

export interface IWorkspaceSharingInvitationData {
  workspaceId: string
  ownerId: string
  sharingMembers: IWorkspaceSharingMemberInfo[]
}

export interface IWorkspaceDataResponsePaginate {
  workspaces: IWorkspaceDataResponse[]
  itemsPerPage: number
  totalPages: number
}
