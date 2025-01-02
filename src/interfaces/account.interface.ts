import { RoleAccess } from '@/utils/constants'
export interface ICreateAccountData {
  username: string
  password: string
  domain: string
}
export interface IAccountInputData {
  id: string
  username: string
  password: string
  domain: string
  user?: {
    id: string
  }
}

export interface IUpdateAccountData extends ICreateAccountData {
  accountId: string
}
export interface IAccountSharingMemberInfo {
  id?: string
  name?: string
  email: string
  avatar?: string
  roleAccess: RoleAccess
}
export interface IAccountDataResponse extends IAccountInputData {
  owner: IAccountSharingMemberInfo
  members: IAccountSharingMemberInfo[]
}

export interface IAccountSharingInvitationData {
  accountId: string
  ownerId: string
  sharingMembers: {
    id?: string
    email: string
    roleAccess: string
  }[]
}

export interface IAccountDataResponsePaginate {
  accounts: IAccountDataResponse[]
  itemsPerPage: number
  totalPages: number
}
