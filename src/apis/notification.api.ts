import { instance as axiosClient } from '@/config'
import { IDataResponse, INotificationDataResponse } from '@/interfaces'

export const notificationApi = {
  getNotifications: async () => {
    const { data } = await axiosClient.get<INotificationDataResponse[]>('/notifications')
    return data
  },

  setReadNotification: async (notificationId: string) => {
    const { data } = await axiosClient.patch<IDataResponse>(`/notifications/${notificationId}`)
    return data
  }
}
