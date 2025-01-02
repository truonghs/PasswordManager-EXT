export const GENERAL_ACCESS = {
  restricted: {
    key: 'restricted',
    description: 'Only people with access can open with the link'
  },
  anyone: {
    key: 'anyone',
    description: 'Anyone on the internet with the link can view'
  }
}

export const ROLE_ACCESS = {
  READ: 'READ',
  UPDATE: 'UPDATE',
  MANAGE: 'MANAGE'
} as const
export type RoleAccess = keyof typeof ROLE_ACCESS

export const ROLE_ACCESS_TYPE = {
  READ: 'VIEWER',
  UPDATE: 'EDITOR',
  MANAGE: 'COLAB'
} as const
