import * as yup from 'yup'
import { AxiosError } from 'axios'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button, Dropdown, Form, MenuProps, Modal } from 'antd'

import { icons } from '@/utils/icons'
import { highLevelPasswordApi } from '@/apis'
import { useAuth, useBoolean } from '@/hooks'
import { checkRoleAccess } from '@/utils/helpers'
import { ENVIRONMENT_KEYS, STATUS_2FA } from '@/utils/constants'
import { IDataResponse, IErrorResponse, IVerifyHighLevelPassword, IWorkspaceDataResponse } from '@/interfaces'

import { CustomInput } from './CustomInput'
import { CustomBtn } from './CustomBtn'

type WorkspaceItemProps = {
  workspace: IWorkspaceDataResponse
  setDeleteWorkspaceId: React.Dispatch<React.SetStateAction<string>>
  setOpen: () => void
}

const passwordSchema = yup.object().shape({
  password: yup
    .string()
    .max(10, 'Password needs to be max 10 characters.')
    .min(4, 'Password needs to be min 4 characters.')
    .required('Please input your the password!')
})

export const WorkspaceItem: React.FC<WorkspaceItemProps> = ({ workspace, setDeleteWorkspaceId, setOpen }) => {
  const navigate = useNavigate()

  const { currentUser } = useAuth()

  const { showAction, showShare, showEdit, showDelete } = checkRoleAccess(currentUser?.id as string, workspace)

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

  const onActionWorkspaceClick = (key: string) => {
    if (currentUser && currentUser?.highLevelPasswords?.some((password) => password.status === STATUS_2FA.ENABLED)) {
      setActionKey(key)
      toggleOpenVerifyHighPassword()
    } else {
      handleActionWorkspaceByKey(key)
    }
  }

  const createActionWorkspace = (): MenuProps['items'] => {
    const items = [
      showShare && {
        key: 'share',
        label: (
          <span className='flex items-center text-slate-700 text-lg font-normal'>
            <span className='mr-2'>{icons.share}</span>
            Share
          </span>
        ),
        onClick: () => onActionWorkspaceClick('share')
      },
      showEdit && {
        key: 'edit',
        label: (
          <span className='flex items-center text-slate-700 text-lg font-normal'>
            <span className='mr-2'>{icons.edit}</span>
            Edit
          </span>
        ),
        onClick: () => onActionWorkspaceClick('edit')
      },
      showDelete && {
        key: 'delete',
        label: (
          <span className='flex items-center text-red-500 text-lg font-normal'>
            <span className='mr-2'>{icons.trash}</span>
            Delete
          </span>
        ),
        onClick: () => onActionWorkspaceClick('delete')
      }
    ]
    return items.filter(Boolean) as MenuProps['items']
  }

  const handleActionWorkspaceByKey = (key: string) => {
    switch (key) {
      case 'edit': {
        navigate('/edit-workspace', {
          state: { workspace }
        })
        break
      }
      case 'delete': {
        setOpen()
        setDeleteWorkspaceId(workspace.id)
        break
      }
      case 'share': {
        chrome.tabs.create({
          url: `index.html#/share-workspace/${workspace.id}`
        })
      }
    }
  }
  const handleVerify = (data: IVerifyHighLevelPassword) => {
    mutateVerify(data)
  }

  const handleModalCancel = () => {
    reset()
    setActionKey('')
    toggleOpenVerifyHighPassword()
    resetMutate()
  }

  const handleAccessWorkspace = (workspaceId: string) => () => {
    const targetUrl = `${ENVIRONMENT_KEYS.VITE_CLIENT_URL}/vault/workspaces/${workspaceId}`
    chrome.runtime.sendMessage({ action: 'syncLoginToWeb', userId: currentUser?.id, targetUrl })
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
      handleActionWorkspaceByKey(actionKey)
      toggleOpenVerifyHighPassword()
    }
  })

  return (
    <li
      key={workspace.id}
      className='flex justify-between items-center p-2 hover:cursor-pointer hover:bg-slate-100 group'
    >
      <div className='flex items-center flex-1' onClick={handleAccessWorkspace(workspace.id)}>
        <span className='text-3xl mr-1 text-[#ffd100e8]'>
          {workspace?.members?.length > 0 ? icons.folderShared : icons.folder}
        </span>
        <span className='text-left text-slate-700 text-lg font-medium group-hover:text-primary-500 group-hover:underline'>
          {workspace.name} ({workspace?.accounts?.length})
        </span>
      </div>
      {showAction && (
        <Dropdown menu={{ items: createActionWorkspace() }} placement='bottomRight' arrow trigger={['click']}>
          <Button className='bg-transparent outline-none border-none cursor-pointer shadow-none'>
            <span className='text-primary-500 text-lg'>{icons.moreAlt}</span>
          </Button>
        </Dropdown>
      )}
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
