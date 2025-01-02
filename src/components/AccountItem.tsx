import * as yup from 'yup'
import { AxiosError } from 'axios'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button, Dropdown, Form, MenuProps, message, Modal } from 'antd'

import { icons } from '@/utils/icons'
import { highLevelPasswordApi } from '@/apis'
import { useAuth, useBoolean } from '@/hooks'
import { STATUS_2FA } from '@/utils/constants'
import { checkRoleAccess, decryptPassword } from '@/utils/helpers'
import { IAccountDataResponse, IDataResponse, IErrorResponse, IVerifyHighLevelPassword } from '@/interfaces'

import { CustomInput } from './CustomInput'
import { CustomBtn } from './CustomBtn'

type AccountItemProps = {
  account: IAccountDataResponse
  setOpen?: () => void
  setDeleteAccountId?: React.Dispatch<React.SetStateAction<string>>
}

const passwordSchema = yup.object().shape({
  password: yup
    .string()
    .max(10, 'Password needs to be max 10 characters.')
    .min(4, 'Password needs to be min 4 characters.')
    .required('Please input your the password!')
})

export const AccountItem: React.FC<AccountItemProps> = ({ account, setOpen, setDeleteAccountId }) => {
  const { t } = useTranslation()

  const { currentUser } = useAuth()

  const { showAction, showShare, showEdit, showDelete } = checkRoleAccess(currentUser?.id as string, account)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(passwordSchema)
  })

  const [actionKey, setActionKey] = useState<string>('')

  const { value: isOpenVerifyHighPassword, toggle: toggleOpenVerifyHighPassword } = useBoolean(false)

  const onActionAccountClick = (key: string) => {
    if (currentUser && currentUser?.highLevelPasswords?.some((password) => password.status === STATUS_2FA.ENABLED)) {
      setActionKey(key)
      toggleOpenVerifyHighPassword()
    } else {
      handleActionAccountByKey(key)
    }
  }

  const createMenuItems: MenuProps['items'] = [
    {
      key: 'username',
      label: <span className='text-lg font-normal'>Copy username</span>,
      onClick: () => onActionAccountClick('username')
    },
    {
      key: 'password',
      label: <span className='text-lg font-normal'>Copy password</span>,
      onClick: () => onActionAccountClick('password')
    }
  ]

  const createActionAccount = (): MenuProps['items'] => {
    const items = [
      showShare && {
        key: 'share',
        label: (
          <span className='flex items-center text-slate-700 text-lg font-normal'>
            <span className='mr-2'>{icons.share}</span>
            Share
          </span>
        ),
        onClick: () => onActionAccountClick('share')
      },
      showEdit && {
        key: 'edit',
        label: (
          <span className='flex items-center text-slate-700 text-lg font-normal'>
            <span className='mr-2'>{icons.edit}</span>
            Edit
          </span>
        ),
        onClick: () => onActionAccountClick('edit')
      },
      showDelete && {
        key: 'delete',
        label: (
          <span className='flex items-center text-red-500 text-lg font-normal'>
            <span className='mr-2'>{icons.trash}</span>
            Delete
          </span>
        ),
        onClick: () => onActionAccountClick('delete')
      }
    ]

    return items.filter(Boolean) as MenuProps['items']
  }

  const handleActionAccountByKey = (key: string) => {
    switch (key) {
      case 'edit': {
        chrome.tabs.create({
          url: `index.html#/edit-account/${account.id}`
        })
        break
      }
      case 'delete': {
        if (setOpen && setDeleteAccountId) {
          setOpen()
          setDeleteAccountId(account.id)
        }
        break
      }
      case 'share': {
        chrome.tabs.create({
          url: `index.html#/share-account/${account.id}`
        })
        break
      }
      case 'username': {
        message.success('Copy username to clipboard')
        navigator.clipboard.writeText(account.username)
        break
      }
      case 'password': {
        message.success('Copy password to clipboard')
        navigator.clipboard.writeText(decryptPassword(account.password))
        break
      }
    }
  }

  const handleOpenSite = (siteUrl: string) => () => {
    window.open(`https://${siteUrl}`)
  }

  const handleModalCancel = () => {
    reset()
    setActionKey('')
    toggleOpenVerifyHighPassword()
    resetMutate()
  }

  const handleVerify = (data: IVerifyHighLevelPassword) => {
    mutateVerify(data)
  }

  const {
    mutate: mutateVerify,
    isPending: isPendingVerify,
    error,
    isError,
    reset: resetMutate
  } = useMutation<IDataResponse, AxiosError<IErrorResponse>, IVerifyHighLevelPassword>({
    mutationFn: highLevelPasswordApi.verify,
    onSuccess: () => {
      handleActionAccountByKey(actionKey)
      toggleOpenVerifyHighPassword()
    }
  })

  return (
    <li className='flex justify-between items-center border-b border-b-gray-300 transition group hover:bg-blue-50 hover:cursor-pointer'>
      <div className='flex flex-1 items-center p-2 max-w-14' onClick={handleOpenSite(account.domain)}>
        <span className='mr-3 cursor-pointer p-1 rounded-sm text-primary-800 text-3xl align-middle'>
          {account?.members?.length > 0 ? icons.lockShared : icons.lock}
        </span>
        <div className='relative text-left'>
          <span className='transition-all duration-500 text-slate-600 text-left text-base text-ellipsis text-nowrap w-[200px] overflow-hidden opacity-100 group-hover:opacity-0 group-hover:transform group-hover:translate-y-2'>
            {account.domain}
          </span>

          <span className='absolute top-0 left-0 transition-all duration-300 text-base font-bold opacity-0 transform -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-hover:text-primary-500'>
            {t('accountItem.launch')}
          </span>
          <div className='text-left text-lg font-medium text-slate-700 text-ellipsis text-nowrap w-[200px] overflow-hidden'>
            {account.username}
          </div>
        </div>
      </div>
      <div className='flex p-2 transition'>
        <Dropdown menu={{ items: createMenuItems }} placement='bottomRight' arrow trigger={['click']}>
          <Button className='bg-none outline-none border-none cursor-pointer mr-2 shadow-none bg-transparent'>
            <span className='text-primary-800 text-lg'>{icons.copy}</span>
          </Button>
        </Dropdown>
        {showAction && (
          <Dropdown menu={{ items: createActionAccount() }} placement='bottomRight' arrow trigger={['click']}>
            <Button className='bg-none outline-none border-none cursor-pointer shadow-none bg-transparent'>
              <span className='text-primary-800 text-lg'>{icons.moreAlt}</span>
            </Button>
          </Dropdown>
        )}
      </div>
      <Modal open={isOpenVerifyHighPassword} onCancel={handleModalCancel} footer={null}>
        {isError && <span className='text-red-500 text-base'>{error.response?.data.message}</span>}
        <Form layout='vertical' onFinish={handleSubmit(handleVerify)}>
          <CustomInput
            name='password'
            label='High level password'
            size='large'
            type='password'
            control={control}
            errors={errors}
            placeholder='Enter your high level password'
          />
          <CustomBtn
            title='Verify'
            type='primary'
            htmlType='submit'
            disabled={isPendingVerify || (isError && error.response?.data.status === 429)}
            loading={isPendingVerify}
          />
        </Form>
      </Modal>
    </li>
  )
}
