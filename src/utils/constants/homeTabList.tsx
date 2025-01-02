import type { TabsProps } from 'antd'

import { ListAccounts } from '@/pages/client/ListAccounts'
import { ListContactInfos } from '@/pages/client/ListContactInfos'
import { ListWorkspaces } from '@/pages/client/ListWorkspaces'

export const HOME_TAB_KEY = {
  ACCOUNT: 'ACCOUNT',
  CONTACT: 'CONTACT',
  WORKSPACE: 'WORKSPACE'
} as const

export const HOME_TAB_LIST: TabsProps['items'] = [
  {
    key: HOME_TAB_KEY.ACCOUNT,
    label: 'Accounts',
    children: <ListAccounts />
  },
  {
    key: HOME_TAB_KEY.CONTACT,
    label: 'Contacts',
    children: <ListContactInfos />
  },
  {
    key: HOME_TAB_KEY.WORKSPACE,
    label: 'Workspaces',
    children: <ListWorkspaces />
  }
]

export type HomeTabKey = keyof typeof HOME_TAB_KEY
