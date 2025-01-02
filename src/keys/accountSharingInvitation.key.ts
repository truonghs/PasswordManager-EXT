import { accountSharingInvitationApi } from '@/apis'
import { defineQuery } from '@/utils/helpers'

export const accountSharingInvitationKeys = {
  all: ['account-sharing-invitations'] as const,
  lists: () => [...accountSharingInvitationKeys.all, 'list'] as const,
  list: () => defineQuery([...accountSharingInvitationKeys.lists()], accountSharingInvitationApi.getPendingInvitation)
}
