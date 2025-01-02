import { accountApi } from '@/apis'
import { defineQuery } from '@/utils/helpers'
import { IPaginationParams } from '@/interfaces'

export const accountKeys = {
  all: ['accounts'] as const,
  lists: () => [...accountKeys.all, 'list'] as const,
  list: (query: IPaginationParams) => defineQuery([...accountKeys.lists(), query], () => accountApi.getAccounts(query)),
  details: () => [...accountKeys.lists(), 'detail'] as const,
  detail: (accountId: string) =>
    defineQuery([...accountKeys.details(), accountId], () => accountApi.getAccountById(accountId))
}
