export interface INotificationDataResponse {
  id: string
  receipient: string
  activityType: string
  isRead: boolean
  createdAt: string
  sender: {
    name: string
    avatar: string
  }
  notificationDetail: {
    accountSharingInvitation?: {
      id: string
      status: string
      account: {
        username: string
      }
    }
    workspaceSharingInvitation?: {
      id: string
      status: string
      workspace: {
        name: string
      }
    }
    memberActivityLog?: {
      account: {
        id: string
        username: string
        domain: string
      }
      workspace?: {
        name: string
      }
    }
  }
}
