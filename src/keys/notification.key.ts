import { notificationApi } from '@/apis'
import { defineQuery } from '@/utils/helpers'

export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: () => defineQuery([...notificationKeys.lists()], notificationApi.getNotifications)
}
