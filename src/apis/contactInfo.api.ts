import { instance as axiosClient } from '@/config'
import { ICreateContactInfo, IDataResponse, IContactInfoDataResponse, IUpdateContactInfoData } from '@/interfaces'

export const contactInfoApi = {
  create: async (createContactInfoData: ICreateContactInfo) => {
    const { data } = await axiosClient.post<IDataResponse>('/contact-info/store', createContactInfoData)
    return data
  },

  getContactInfoes: async () => {
    const { data } = await axiosClient.get<IContactInfoDataResponse[]>('/contact-info')
    return data
  },

  getContactInfoById: async (contactInfoId: string) => {
    const { data } = await axiosClient.get<IContactInfoDataResponse>(`/contact-info/${contactInfoId}`)
    return data
  },

  update: async ({ contactInfoId, ...updateContactInfoPayload }: IUpdateContactInfoData) => {
    const { data } = await axiosClient.put<IDataResponse>(
      `/contact-info/update/${contactInfoId}`,
      updateContactInfoPayload
    )
    return data
  },

  delete: async (contactInfoId: string) => {
    return await axiosClient.delete(`/contact-info/soft-delete/${contactInfoId}`)
  }
}
