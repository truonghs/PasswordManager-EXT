import { instance as axiosClient } from '@/config'
import {
  IWorkspaceInputData,
  IWorkspaceUpdateData,
  IDataResponse,
  IWorkspaceDataResponse,
  IPaginationParams,
  IWorkspaceDataResponsePaginate
} from '@/interfaces'

export const workspaceApi = {
  create: async (createWorkspaceData: IWorkspaceInputData) => {
    const { data } = await axiosClient.post<IDataResponse>('/workspaces/create', createWorkspaceData)
    return data
  },

  getWorkspaceById: async (workspaceId: string) => {
    const { data } = await axiosClient.get<IWorkspaceDataResponse>(`/workspaces/${workspaceId}`)
    return data
  },

  getWorkspaces: async (query: IPaginationParams) => {
    const { data } = await axiosClient.get<IWorkspaceDataResponsePaginate>('/workspaces', {
      params: query
    })
    return data
  },

  update: async ({ id, ...updateWorkspaceData }: IWorkspaceUpdateData) => {
    const { data } = await axiosClient.put<IDataResponse>(`/workspaces/update/${id}`, updateWorkspaceData)
    return data
  },

  softDelete: async (workspaceId: string) => {
    const { data } = await axiosClient.delete<IDataResponse>(`/workspaces/soft-delete/${workspaceId}`)
    return data
  }
}
