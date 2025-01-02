import React from 'react'
import { Dropdown, MenuProps } from 'antd'

import { useAuth } from '@/hooks'
import { icons } from '@/utils/icons'
import { IAccountSharingMemberInfo } from '@/interfaces'
import anonAvartar from '@/assets/images/anonAvatar.png'
import { ROLE_ACCESS, ROLE_ACCESS_TYPE, RoleAccess } from '@/utils/constants'

type CardSharingMemberProps = {
  member: IAccountSharingMemberInfo
  type: 'owner' | 'member'
  roleAccess?: RoleAccess
  disableChangeRoleAccess?: boolean
  handleChangeMemberRoleAccess?: (member: IAccountSharingMemberInfo) => void
  handleRemoveMember?: (member: IAccountSharingMemberInfo) => void
}

export const CardSharingMember: React.FC<CardSharingMemberProps> = ({
  member,
  roleAccess,
  type,
  disableChangeRoleAccess = false,
  handleRemoveMember,
  handleChangeMemberRoleAccess
}) => {
  const { currentUser } = useAuth()
  const itemsRoleAccess: MenuProps['items'] = [
    {
      key: ROLE_ACCESS.READ,
      label: (
        <div className='flex py-1.5 text-base font-normal'>
          <span className='inline-block text-green-500 text-2xl min-w-6'>
            {roleAccess === ROLE_ACCESS.READ && icons.check}
          </span>
          <span className='pl-3 text-slate-950 capitalize'>Viewer</span>
        </div>
      ),
      onClick: () =>
        handleChangeMemberRoleAccess && handleChangeMemberRoleAccess({ ...member, roleAccess: ROLE_ACCESS.READ })
    },
    {
      key: ROLE_ACCESS.UPDATE,
      label: (
        <div className='flex py-1.5 pr-8 text-base font-normal'>
          <span className='inline-block text-green-500 text-2xl min-w-6'>
            {roleAccess === ROLE_ACCESS.UPDATE && icons.check}
          </span>
          <span className='pl-3 text-slate-950 capitalize'>Editor</span>
        </div>
      ),
      onClick: () =>
        handleChangeMemberRoleAccess && handleChangeMemberRoleAccess({ ...member, roleAccess: ROLE_ACCESS.UPDATE })
    },
    {
      key: ROLE_ACCESS.MANAGE,
      label: (
        <div className='flex py-1.5 pr-8 text-base font-normal'>
          <span className='inline-block text-green-500 text-2xl min-w-6'>
            {roleAccess === ROLE_ACCESS.MANAGE && icons.check}
          </span>
          <span className='pl-3 text-slate-950 capitalize'>Colab</span>
        </div>
      ),
      onClick: () =>
        handleChangeMemberRoleAccess && handleChangeMemberRoleAccess({ ...member, roleAccess: ROLE_ACCESS.MANAGE })
    },
    {
      key: 'REMOVE_ACCESS',
      label: (
        <div className='flex py-1.5 pr-8 text-base font-normal'>
          <span className='inline-block text-green-500 text-2xl min-w-6'></span>
          <span className='pl-3 text-slate-950 capitalize'>Remove</span>
        </div>
      ),
      onClick: () => handleRemoveMember && handleRemoveMember(member)
    }
  ]

  const renderActionByType = () => {
    return type === 'owner' ? (
      <span className='text-sm text-slate-500'>Owner</span>
    ) : (
      type === 'member' && (
        <Dropdown
          menu={{ items: itemsRoleAccess }}
          trigger={['click']}
          disabled={disableChangeRoleAccess}
          className='block w-[90px] text-left text-lg text-slate-800 p-3 rounded-md cursor-pointer hover:bg-gray-200 self-center '
        >
          <div className='flex items-center'>
            <span className='capitalize text-sm min-w-12'>
              {ROLE_ACCESS_TYPE[roleAccess as keyof typeof ROLE_ACCESS_TYPE].toLowerCase()}
            </span>
            <span className='ml-2'>{icons.arrowDropdown}</span>
          </div>
        </Dropdown>
      )
    )
  }

  return (
    <li className='flex items-center hover:bg-gray-100 px-6 py-3'>
      <div className='w-9 h-9 mr-4'>
        <img src={member?.avatar || anonAvartar} alt='avatar' className='rounded-full' />
      </div>
      <div className='flex-1'>
        <div className='text-[14px] font-semibold'>
          {member?.name || member.email}
          {(currentUser?.email === member.email) && ' (you)'}
        </div>
        <div className='text-[12px] text-slate-700'>{member.email}</div>
      </div>
      {renderActionByType()}
    </li>
  )
}
