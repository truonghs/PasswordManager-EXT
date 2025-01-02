import { icons } from '@/utils/icons'
import { PATH } from './path'

export const BOTTOM_TAB_LIST = [
  {
    title: 'Home',
    icon: icons.home,
    to: PATH.HOME
  },
  {
    title: 'Generator',
    icon: icons.shieldLock,
    to: PATH.GENERATOR
  },
  {
    title: 'Alert',
    icon: icons.notifications,
    to: PATH.NOTIFICATION
  },
  {
    title: 'Account',
    icon: icons.user,
    to: PATH.ACCOUNT
  }
]
