export interface IAccountSharingInvitaionResponse {
  id: string
  email: string
  status: string
  roleAccess: string
  createdAt: string
  owner: { id: string; name: string; email: string; avatar?: string }
  account?: {
    username: string
  }
}
