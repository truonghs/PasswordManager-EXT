import { contactInfoApi } from '@/apis'
import { defineQuery } from '@/utils/helpers'

export const contactInfoKeys = {
  all: ['contact-info'] as const,
  lists: () => [...contactInfoKeys.all, 'list'] as const,
  list: () => defineQuery([...contactInfoKeys.lists()], contactInfoApi.getContactInfoes),
  details: () => [...contactInfoKeys.lists(), 'detail'] as const,
  detail: (contactInfoId: string) =>
    defineQuery([...contactInfoKeys.details(), contactInfoId], () => contactInfoApi.getContactInfoById(contactInfoId))
}
