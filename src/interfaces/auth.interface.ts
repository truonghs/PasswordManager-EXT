import { RoleAccess, Status2FA, StatusEnable2FA } from '@/utils/constants'

export interface ILoginData {
  email: string
  password: string
}
export interface ICurrentUser {
  id: string
  name: string
  role: string
  email: string
  avatar?: string
  phoneNumber?: string
  status?: Status2FA
  highLevelPasswords: {
    type: string
    status: string
  }[]
  isSkippedTwoFa?: boolean
  roleAccess?: RoleAccess
}
export interface IVerifyTokenTwoFa {
  userId: string
  token: string
}
export interface ILoginResultWith2FA {
  userId: string
  statusTwoFa: StatusEnable2FA
}

export interface ILoginResultWithTokens {
  accessToken: string
  refreshToken: string
  currentUser: ICurrentUser
}

export type ILoginResponse = ILoginResultWith2FA | ILoginResultWithTokens
export interface IVerifyTOTPData {
  userId: string
  token: string
}
