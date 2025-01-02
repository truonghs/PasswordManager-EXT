import * as yup from 'yup'
import { AxiosError } from 'axios'
import { Form, Spin } from 'antd'
import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import { yupResolver } from '@hookform/resolvers/yup'

import { Generator } from '@/pages'
import { icons } from '@/utils/icons'
import { highLevelPasswordApi } from '@/apis'
import { decryptPassword } from '@/utils/helpers'
import { useAccount, useAuth, useBoolean } from '@/hooks'
import { ENVIRONMENT_KEYS, LIST_MORE_OPTIONS, STATUS_2FA } from '@/utils/constants'
import {
  IAccountInputData,
  IDataResponse,
  IErrorResponse,
  IPaginationParams,
  IVerifyHighLevelPassword
} from '@/interfaces'

import { CustomBtn } from './CustomBtn'
import { CustomInput } from './CustomInput'
const passwordSchema = yup.object().shape({
  password: yup
    .string()
    .max(10, 'Password needs to be max 10 characters.')
    .min(4, 'Password needs to be min 4 characters.')
    .required('Please input your the password!')
})

export function IframeModal() {
  const { t } = useTranslation()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(passwordSchema)
  })

  const [queryParams, setQueryParams] = useState<IPaginationParams>({
    page: 1,
    limit: 20
  })

  const { currentUser } = useAuth()

  const { data } = useAccount(queryParams)

  const { value: showMoreOptions, toggle: toggleMoreOptions } = useBoolean(false)

  const { value: showModalGeneratePassword, setFalse, toggle: toggleModalGeneratePassword } = useBoolean(false)

  const { value: isOpenVerifyHighPassword, toggle: toggleOpenVerifyHighPassword } = useBoolean(false)

  const [currentUrl, setCurrentUrl] = useState<string>('')

  const [limitAccount, setLimitAccount] = useState<number>(3)

  const [accountFill, setAccountFill] = useState<IAccountInputData>()

  const [defaultIframeHeight, setDefaultIframeHeight] = useState<number>(10)

  const [listAccountOfDomain, setListAccountOfDomain] = useState<IAccountInputData[]>([])

  const [listSuggestAccounts, setListSuggestAccounts] = useState<IAccountInputData[]>([])

  const { value: loadingSolveCaptcha, setTrue: setLoadingSolveCaptcha, setFalse: setUnloadingSolveCaptcha } = useBoolean(false)

  const handleToggleOptions = () => {
    if (showModalGeneratePassword) {
      setFalse()
      chrome.runtime.sendMessage({ action: 'updateHeight', height: '193px' })
    } else {
      if (!showMoreOptions) {
        chrome.runtime.sendMessage({ action: 'updateHeight', height: '193px' })
      } else {
        if (listSuggestAccounts?.length < 4) {
          chrome.runtime.sendMessage({
            action: 'updateHeight',
            height: `${(listSuggestAccounts?.length || 1) * 68 + 66 + 66}px`
          })
        } else {
          chrome.runtime.sendMessage({
            action: 'updateHeight',
            height: `${(limitAccount === listSuggestAccounts?.length ? 2.2 : 3) * 68 + 66 + 66 + 44 + 61}px`
          })
        }
      }
      toggleMoreOptions()
    }
  }

  const handleToggleGeneratePassword = () => {
    toggleModalGeneratePassword()
    chrome.runtime.sendMessage({ action: 'updateHeight', height: '400px' })
  }

  const handleToggleShowFormCreateAccount = () => {
    chrome.runtime.sendMessage({ action: 'openForm' })
  }

  const handleFillAccountToInputField = (account: IAccountInputData) => {
    chrome.runtime.sendMessage({
      action: 'fillForm',
      username: account.username,
      password: decryptPassword(account.password)
    })
  }

  const handleActionAccountFill = (account: IAccountInputData) => () => {
    if (currentUser && currentUser?.highLevelPasswords?.some((password) => password.status === STATUS_2FA.ENABLED)) {
      setAccountFill(account)
      toggleOpenVerifyHighPassword()
      chrome.runtime.sendMessage({
        action: 'updateHeight',
        height: '253px'
      })
    } else {
      handleFillAccountToInputField(account)
    }
  }

  const handleLoadMore = () => {
    chrome.runtime.sendMessage({ action: 'updateHeight', height: '326px' })
    setLimitAccount(listSuggestAccounts.length)
  }

  const handleSearchAccount = (inputValue: string) => {
    const inputValueTrimmed = inputValue.trim()
    if (inputValueTrimmed) {
      const newSuggestAccounts = listSuggestAccounts.filter(
        (account) => account.domain.includes(inputValueTrimmed) || account.username.includes(inputValueTrimmed)
      )
      setListSuggestAccounts(newSuggestAccounts)
    } else {
      setListSuggestAccounts(listAccountOfDomain)
    }
  }

  const handleOpenTabEditAccount = (account: IAccountInputData) => () => {
    chrome.tabs.create({
      url: `index.html#/edit-account/${account.id}`
    })
  }

  const handleModalCancel = () => {
    chrome.runtime.sendMessage({
      action: 'updateHeight',
      height: `${defaultIframeHeight}px`
    })
    reset()
    setAccountFill(undefined)
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
      if (accountFill) handleFillAccountToInputField(accountFill)
      handleModalCancel()
    }
  })

  const handleOpenVault = (url: string) => {
    const targetUrl = `${ENVIRONMENT_KEYS.VITE_CLIENT_URL}${url}`
    chrome.runtime.sendMessage({
      action: 'syncLoginToWeb',
      userId: currentUser?.id,
      targetUrl
    })
  }

  const handleSolveCaptcha = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tabId = tabs[0]?.id
      if (tabId !== undefined) {
        chrome.tabs.sendMessage(tabId, { action: 'solveCaptcha' }, (response) => {
          setLoadingSolveCaptcha()
          if (chrome.runtime.lastError) {
            console.error('Lỗi khi gửi message:', chrome.runtime.lastError.message)
            setUnloadingSolveCaptcha()
          } else {
            console.log('Response từ solveCaptcha:', response)
          }
        })
      }
    })
  }

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const currentUrl = tabs[0].url
      if (currentUrl) {
        setCurrentUrl(new URL(currentUrl).hostname)
        setQueryParams({
          page: 1,
          limit: 20,
          keyword: new URL(currentUrl).hostname
        })
      }
    })
  }, [])

  useEffect(() => {
    const listSuggestAccounts = data?.accounts?.filter((account: IAccountInputData) =>
      account.domain.includes(currentUrl)
    )
    let iframeHeight = 0
    if (listSuggestAccounts && listSuggestAccounts?.length < 4) {
      iframeHeight = (listSuggestAccounts?.length || 1) * 68 + 66 + 66
      chrome.runtime.sendMessage({
        action: 'updateHeight',
        height: `${iframeHeight}px`
      })
    } else {
      iframeHeight = (limitAccount === listSuggestAccounts?.length ? 2.2 : 3) * 68 + 66 + 66 + 44 + 61
      chrome.runtime.sendMessage({
        action: 'updateHeight',
        height: `${iframeHeight}px`
      })
    }
    setDefaultIframeHeight(iframeHeight)
    if (listSuggestAccounts) {
      setListSuggestAccounts(listSuggestAccounts)
      setListAccountOfDomain(listSuggestAccounts)
    }
  }, [currentUrl, limitAccount, data])

  return (
    <section className='w-full'>
      {showMoreOptions ? (
        <>
          <div
            onClick={handleToggleOptions}
            className='flex items-center text-blue-500  text-xl font-bold p-4 border-b border-b-gray-300 transition hover:bg-blue-200 hover:cursor-pointer'
          >
            <span className='text-2xl'>{icons.arrowBack}</span>
            <span className='ml-2'>{t('iframeModal.back')}</span>
          </div>
          <div>
            {showModalGeneratePassword ? (
              <Generator isShowHeader={false} isShowCopy={false} />
            ) : (
              <>
                {LIST_MORE_OPTIONS.map((option) => (
                  <div
                    key={option.key}
                    className='flex justify-between items-center hover:bg-blue-200 transition cursor-pointer px-4 py-2'
                    onClick={
                      option.key === 'generate' ? handleToggleGeneratePassword : () => handleOpenVault(option.url)
                    }
                  >
                    <div className='flex items-center text-gray-700'>
                      <span className='text-xl'>{option.iconLeft}</span>
                      <span className='text-lg ml-2'>{t(`iframeModal.${option.key}`)}</span>
                    </div>
                    <span className='text-xl'>{option.iconRight}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </>
      ) : (
        <>
          {isOpenVerifyHighPassword ? (
            <Form layout='vertical' onFinish={handleSubmit(handleVerify)} className='p-3'>
              {isError && <span className='text-red-500 text-base'>{error.response?.data.message}</span>}
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
                className='!mt-0'
              />
              <CustomBtn
                title='Cancel'
                className='border !border-gray-500 !text-slate-800'
                onClick={handleModalCancel}
              />
            </Form>
          ) : (
            <div className='flex flex-col'>
              {listAccountOfDomain?.length > 3 && (
                <CustomInput
                  name='searchValue'
                  size='large'
                  placeholder='Search account'
                  className='w-full text-lg font-medium m-0 hover:border-primary-800'
                  onChange={(e: { target: { value: string } }) => handleSearchAccount(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace') return false
                  }}
                />
              )}
              {listSuggestAccounts?.length > 0 && (
                <ul
                  className={`max-h-[215px] overflow-x-hidden ${limitAccount > 3 && listSuggestAccounts?.length > 3 && 'overflow-y-scroll'}`}
                >
                  {listSuggestAccounts.slice(0, limitAccount).map((account) => (
                    <li
                      id='header-modal'
                      className='flex justify-between items-center border-t border-t-gray-300 transition hover:bg-blue-200 hover:cursor-pointer group'
                    >
                      <div
                        className='flex flex-1 items-center p-2 max-w-[100px]'
                        onClick={handleActionAccountFill(account)}
                      >
                        <span className='mr-3 cursor-pointer p-1 rounded-sm'>
                          <span className='text-primary-800 text-3xl align-middle'>{icons.lock}</span>
                        </span>
                        <div className='relative text-left max-w-[200px]'>
                          <span className='transition-all duration-500 text-base text-slate-600 text-left opacity-100 group-hover:opacity-0 group-hover:transform group-hover:translate-y-2'>
                            {account.domain}
                          </span>

                          <span className='absolute top-0 left-0 transition-all duration-500 text-sm font-bold opacity-0 transform -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-hover:text-primary-500'>
                            {t('iframeModal.fill')}
                          </span>
                          <div className='text-left text-lg font-medium text-slate-700 overflow-hidden text-ellipsis'>
                            {account.username}
                          </div>
                        </div>
                      </div>
                      <div
                        className='p-2 hover:bg-blue-200 transition group-hover:bg-blue-300'
                        onClick={handleOpenTabEditAccount(account)}
                      >
                        <span className='text-primary-800 text-2xl cursor-pointer'>{icons.pencil}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {limitAccount < listSuggestAccounts?.length && (
                <button
                  className='w-full text-lg text-left p-4 cursor-pointer transition hover:bg-blue-200 border-t border-gray-300'
                  onClick={handleLoadMore}
                >
                  {t('iframeModal.loadMore')}
                </button>
              )}

              {data?.accounts?.filter((account: IAccountInputData) => account.domain.includes(currentUrl))?.length ===
                0 && (
                <li
                  id='header-modal'
                  className='flex justify-between items-center border-b border-b-gray-300 transition hover:bg-blue-200 hover:cursor-pointer group'
                  onClick={handleToggleShowFormCreateAccount}
                >
                  <div className='flex flex-1 items-center p-2'>
                    <span className='mr-3 cursor-pointer p-1 rounded-sm text-primary-800 text-3xl align-middle'>
                      {icons.lock}
                    </span>
                    <div className='relative text-left'>
                      <span className='transition-all duration-500 text-base text-slate-600 text-left opacity-100 group-hover:opacity-0 group-hover:transform group-hover:translate-y-2'>
                        {currentUrl}
                      </span>

                      <span className='absolute top-0 left-0 transition-all duration-500 text-sm font-bold opacity-0 transform -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-hover:text-primary-500'>
                        {t('iframeModal.add')}
                      </span>
                      <div className='text-left text-lg font-medium text-slate-700'>{t('iframeModal.startTyping')}</div>
                    </div>
                  </div>
                  <div className='mr-2 p-2 hover:bg-blue-200 transition text-primary-800 text-2xl cursor-pointer'>
                    {icons.addCircle}
                  </div>
                </li>
              )}

              <button
                className={`flex items-center justify-between w-full text-lg text-left p-4 ${loadingSolveCaptcha ? 'cursor-not-allowed' : 'cursor-pointer'} transition hover:bg-blue-200 border-t border-gray-300`}
                onClick={handleSolveCaptcha}
                disabled={loadingSolveCaptcha}
              >
                Solve captcha
                {loadingSolveCaptcha && <Spin size='default' />}
              </button>
              <button
                className='w-full text-lg text-left p-4 cursor-pointer transition hover:bg-blue-200 border-t border-gray-300'
                onClick={handleToggleOptions}
              >
                {t('iframeModal.moreOptions')}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}
