import * as yup from 'yup'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'
import { Button, Form, Select, Typography, message } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { workspaceApi } from '@/apis'
import { icons } from '@/utils/icons'
import { useAccount } from '@/hooks'
import { workspaceKeys } from '@/keys'
import { CustomBtn, CustomInput } from '@/components'
import { HOME_TAB_KEY, PATH } from '@/utils/constants'
import { IAccountInputData, IErrorResponse, IPaginationParams, IWorkspaceInputData } from '@/interfaces'
import { AxiosError } from 'axios'

const { Text } = Typography

type accountOption = {
  label: string
  value: string
}

export function CreateWorkspace() {
  const { t } = useTranslation()

  const createWorkspaceSchema = yup.object().shape({
    name: yup.string().required(t('createWorkspace.nameRequired')),
    accounts: yup.array().required(t('createWorkspace.selectAtleast'))
  })

  const queryClient = useQueryClient()

  const navigate = useNavigate()

  const [queryParams] = useState<IPaginationParams>({
    page: 1,
    limit: 20
  })

  const { data } = useAccount(queryParams)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<IWorkspaceInputData>({
    resolver: yupResolver(createWorkspaceSchema)
  })

  const { mutate, isPending } = useMutation({
    mutationFn: workspaceApi.create,
    onSuccess: () => {
      reset()
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() })
      message.success(t('createWorkspace.saveSuccess'))
    },
    onError: (error: AxiosError) => {
      const errorMessage = (error.response?.data as IErrorResponse)?.message
      message.error(errorMessage)
    }
  })

  const handleSaveWorkspace = (data: IWorkspaceInputData) => {
    mutate(data)
  }

  const accountOptions: accountOption[] = data?.accounts
    ? data.accounts.map((account: IAccountInputData) => ({
        label: `${account.domain} (${account.username})`,
        value: account.id
      }))
    : []

  const handleBack = () => {
    navigate(PATH.HOME, {
      state: {
        activeTab: HOME_TAB_KEY.WORKSPACE
      }
    })
  }

  return (
    <section className='w-full p-2'>
      <div className='flex items-center'>
        <Button className='p-3 mr-7 gap-0 text-primary-800 border border-primary-800' onClick={handleBack}>
          <span className='text-xl'>{icons.arrowBack}</span>
        </Button>
        <h2 className='text-xl text-primary-800 font-semibold'>{t('createWorkspace.title')}</h2>
      </div>
      <Form
        className='bg-white mt-3 p-3 border border-gray-200 text-gray-600'
        onFinish={handleSubmit(handleSaveWorkspace)}
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
                placeholder={t('createWorkspace.selectAccountsPlaceholder')}
                options={accountOptions}
                onChange={(value) => field.onChange(value)}
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              />
            )}
          />
          {errors.accounts && <Text type='danger'>{errors.accounts.message}</Text>}
        </div>
        <CustomBtn
          title={t('createWorkspace.createButton')}
          type='primary'
          htmlType='submit'
          disabled={isPending}
          loading={isPending}
        />
      </Form>
    </section>
  )
}
