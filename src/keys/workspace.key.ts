import { workspaceApi } from '@/apis'
import { defineQuery } from '@/utils/helpers'
import { IPaginationParams } from '@/interfaces'

export const workspaceKeys = {
  all: ['workspaces'] as const,
  lists: () => [...workspaceKeys.all, 'list'] as const,
  list: (query: IPaginationParams) =>
    defineQuery([...workspaceKeys.lists(), query], () => workspaceApi.getWorkspaces(query)),
  details: () => [...workspaceKeys.lists(), 'detail'] as const,
  detail: (workspaceId: string) =>
    defineQuery([...workspaceKeys.details(), workspaceId], () => workspaceApi.getWorkspaceById(workspaceId))
}
