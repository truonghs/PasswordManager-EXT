import { ICurrentUser } from './auth.interface'

export interface ICreateContactInfo {
  title: string
  firstName?: string
  midName?: string
  lastName?: string
  fullName?: string
  street?: string
  city?: string
  country?: string
  email?: string
  phoneNumber?: string
  postalCode?: string
  address?: string
}

export interface IContactInfoDataResponse extends ICreateContactInfo {
  id: string
  owner?: ICurrentUser
}

export interface IUpdateContactInfoData extends ICreateContactInfo {
  contactInfoId?: string
}