import { userApi } from '@/apis'
import { defineQuery } from '@/utils/helpers'

export const userKeys = {
  all: ['users'] as const,
  profiles: () => [...userKeys.all, 'profile'] as const,
  profile: () => defineQuery([...userKeys.profiles()], userApi.getCurrentUser),
}
