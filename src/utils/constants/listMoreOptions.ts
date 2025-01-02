import { icons } from '@/utils/icons'
import { PATH } from './path'

export const LIST_MORE_OPTIONS = [
  {
    key: 'generate',
    url: '',
    text: 'Generate a password',
    iconLeft: icons.key,
    iconRight: icons.arrowForward
  },
  {
    key: 'open',
    url: PATH.VAULT,
    text: 'Open my vault',
    iconLeft: icons.vault,
    iconRight: icons.arrowUpRight
  },
  {
    key: 'setting',
    url: PATH.VAULT_SETTINGS,
    text: 'Settings',
    iconLeft: icons.settings,
    iconRight: icons.arrowUpRight
  }
]
