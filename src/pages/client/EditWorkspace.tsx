import * as yup from 'yup'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button, Form, Select, Typography, message } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { workspaceApi } from '@/apis'
import { icons } from '@/utils/icons'
import { useAccount } from '@/hooks'
import { workspaceKeys } from '@/keys'
import { CustomBtn, CustomInput } from '@/components'
import { HOME_TAB_KEY, PATH } from '@/utils/constants'
import { IAccountDataResponse, IAccountInputData, IPaginationParams, IWorkspaceInputData } from '@/interfaces'

const { Text } = Typography

type accountOption = {
  label: string
  value: string
}

export function EditWorkspace() {
  const { t } = useTranslation()

  const editWorkspaceSchema = yup.object().shape({
    name: yup.string().required(t('createWorkspace.nameRequired')),
    accounts: yup.array().required(t('createWorkspace.selectAtleast'))
  })

  const queryClient = useQueryClient()

  const location = useLocation()

  const { workspace } = location.state || null

  const navigate = useNavigate()

  const [queryParams] = useState<IPaginationParams>({
    page: 1,
    limit: 20
  })

  const { data } = useAccount(queryParams)

  const handleBack = () => {
    navigate(PATH.HOME, {
      state: {
        activeTab: HOME_TAB_KEY.WORKSPACE
      }
    })
  }

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<IWorkspaceInputData>({
    resolver: yupResolver(editWorkspaceSchema)
  })

  const { mutate, isPending } = useMutation({
    mutationFn: workspaceApi.update,
    onSuccess: () => {
      handleBack()
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() })
      message.success(t('editWorkspace.updateSuccess'))
    },
    onError: (e) => {
      message.error(e.message)
    }
  })

  const handleUpdateWorkspace = (data: IWorkspaceInputData) => {
    mutate({ ...workspace, ...data })
  }

  const accountOptions: accountOption[] = data?.accounts
    ? data.accounts.map((account: IAccountInputData) => ({
        label: `${account.domain} (${account.username})`,
        value: account.id
      }))
    : []

  useEffect(() => {
    setValue('name', workspace?.name)
    if (workspace?.accounts?.length > 0) {
      setValue(
        'accounts',
        workspace?.accounts?.map((account: { id: string }) => account.id)
      )
    }
  }, [setValue, workspace])

  return (
    <section className='w-full p-2'>
      <div className='flex items-center'>
        <Button className='p-3 mr-5 gap-0 text-primary-500' onClick={handleBack}>
          <span className='text-xl'>{icons.arrowBack}</span>
        </Button>
        <h2 className='text-xl text-primary-800 font-semibold'>{t('editWorkspace.title')}</h2>
      </div>
      <Form
        className='bg-white mt-3 p-3 border border-gray-200 text-gray-600'
        onFinish={handleSubmit(handleUpdateWorkspace)}
      >
        <CustomInput
          name='name'
          size='large'
          label={t('createWorkspace.nameLabel')}
          control={control}
          errors={errors}
          placeholder={t('createWorkspace.namePlaceholder')}
        />
        <div className='flex flex-col mt-3 mb-2 text-left'>
          <label className='text-lg font-normal text-slate-800'>{t('createWorkspace.selectAccountsLabel')}</label>
          <Controller
            name='accounts'
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                mode='multiple'
                style={{ width: '100%' }}
                placeholder={t('createWorkspace.selectAccountsPlaceholder')}
                className='text-lg '
                defaultValue={
                  workspace &&
                  workspace.accounts?.map((account: IAccountDataResponse) => ({
                    label: `${account.domain} (${account.username})`,
                    value: account.id
                  }))
                }
                options={accountOptions}
                onChange={(value) => field.onChange(value)}
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              />
            )}
          />
          {errors.accounts && <Text type='danger'>{errors.accounts.message}</Text>}
        </div>
        <CustomBtn
          title={t('editWorkspace.updateButton')}
          type='primary'
          htmlType='submit'
          disabled={isPending}
          loading={isPending}
        />
      </Form>
    </section>
  )
}
