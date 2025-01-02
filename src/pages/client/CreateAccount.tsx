import * as yup from 'yup'
import { Form, message } from 'antd'
import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { accountApi } from '@/apis'
import { accountKeys } from '@/keys'
import { icons } from '@/utils/icons'
import { decryptPassword } from '@/utils/helpers'
import { CustomBtn, CustomInput } from '@/components'
import { useAccount, useChromeStorage } from '@/hooks'
import { ACCOUNT_FIELDS, LOCAL_STORAGE_KEYS } from '@/utils/constants'
import { IAccountInputData, ICreateAccountData, IErrorResponse, IPaginationParams } from '@/interfaces'
import { AxiosError } from 'axios'

type RequestActionSavingAccount = {
  action: string
  credential: string
  password: string
  isReload: boolean
}

export function CreateAccount() {
  const { t } = useTranslation()

  const { storedValue: accessToken, getValue: getAccessToken } = useChromeStorage(LOCAL_STORAGE_KEYS.accessToken)

  const createAccountSchema = yup.object().shape({
    username: yup.string().required(t('createAccount.credentialRequire')),
    password: yup.string().required(t('createAccount.passwordRequire')),
    domain: yup.string().required(t('createAccount.domainRequire')).default('')
  })

  const queryClient = useQueryClient()

  const [queryParams, setQueryParams] = useState<IPaginationParams>({
    page: 1,
    limit: 50
  })

  const { data } = useAccount(queryParams)

  const [currentDomain, setCurrentDomain] = useState<string>('')

  const [accountId, setAccountId] = useState<string>('')

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(createAccountSchema)
  })

  const { mutate: mutateCreate, isPending: isPendingCreate } = useMutation({
    mutationFn: accountApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() })
      message.success(t('createAccount.saveAccountSuccess'))
      handleCloseForm()
    },
    onError: (e) => {
      message.error(e.message)
    }
  })

  const { mutate: mutateUpdate, isPending: isPendingUpdate } = useMutation({
    mutationFn: accountApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() })
      message.success(t('editAccount.updateSuccess'))
      handleCloseForm()
    },
    onError: (error: AxiosError) => {
      const errorMessage = (error.response?.data as IErrorResponse)?.message
      message.error(errorMessage)
    }
  })

  const handleSaveAccount = (data: ICreateAccountData) => {
    if (accountId) mutateUpdate({ accountId, ...data })
    else mutateCreate(data)
  }

  const handleCloseForm = () => {
    chrome.runtime.sendMessage({ action: 'closeForm' })
    chrome.storage.local.remove('authData')
    setValue('username', '')
    setValue('password', '')
  }

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const currentTabUrl = tabs[0]?.url
      if (currentTabUrl) {
        setCurrentDomain(new URL(currentTabUrl).hostname)
      }
    })
  }, [])

  useEffect(() => {
    setValue('domain', currentDomain)
    setQueryParams((prev) => ({ ...prev, keyword: currentDomain }))
  }, [currentDomain, setValue])

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleMessage = async (request: RequestActionSavingAccount, sender: any) => {
      if (request.action === 'formSubmit') {
        const senderOrigin = new URL(sender.url).hostname
        const { credential, password, isReload } = request
        const existingAccount = data?.accounts.find(
          (account: IAccountInputData) => account.domain === senderOrigin && account.username === credential
        )
        const isModeUpdate = existingAccount && decryptPassword(existingAccount.password) !== password

        if (isModeUpdate) {
          setAccountId(existingAccount.id)
        }

        if (credential && password && senderOrigin === currentDomain && accessToken) {
          if (!existingAccount || isModeUpdate) {
            setValue('username', credential)
            setValue('password', password)
            if (isReload) {
              chrome.runtime.sendMessage({ action: 'openForm' })
            } else {
              chrome.runtime.sendMessage({ action: 'checkCurrentSubmitFormInDom' })
            }
          }
        }

        chrome.storage.local.remove('authData')

        if (senderOrigin !== currentDomain) {
          setValue('username', '')
          setValue('password', '')
        }
      }
      return true
    }
    chrome.runtime.onMessage.addListener(handleMessage)
    getAccessToken()
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
    }
  }, [data, currentDomain])

  return (
    <section>
      <div className='relative flex flex-col box-border min-h-[188px] border border-[#d5d9de] rounded-[4px] shadow-[0_3px_9px_rgba(0,0,0,0.3)] my-[9px] mx-[6px] mb-[12px] w-[420px] bg-[#f7f9fc] p-4'>
        <div className='flex justify-between items-center'>
          <h2 className='text-xl text-primary-800 font-semibold'>
            {accountId ? 'Edit account' : t('createAccount.title')}
          </h2>
          <button
            className='hover:bg-gray-300 cursor-pointer '
            id='create-account-form-close'
            onClick={handleCloseForm}
          >
            <span className='text-3xl text-gray-600 font-semibold'>{icons.close}</span>
          </button>
        </div>
        <Form
          className='bg-white mt-3 px-3 border border-gray-200 pb-3'
          onFinish={handleSubmit(handleSaveAccount)}
          layout='vertical'
        >
          {ACCOUNT_FIELDS.map((field) => (
            <CustomInput
              key={field.name}
              name={field.name}
              size='large'
              type={field.type}
              label={t(`createAccount.${field.name}`)}
              control={control}
              errors={errors}
              placeholder={t(`createAccount.${field.placeholder}`)}
            />
          ))}

          <CustomBtn
            title={accountId ? 'Update' : t('createAccount.saveBtn')}
            type='primary'
            htmlType='submit'
            disabled={isPendingCreate || isPendingUpdate}
            loading={isPendingCreate || isPendingUpdate}
          />
        </Form>
      </div>
    </section>
  )
}
