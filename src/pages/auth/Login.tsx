import * as yup from 'yup'
import { useState } from 'react'
import { AxiosError } from 'axios'
import { Form, message } from 'antd'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import { yupResolver } from '@hookform/resolvers/yup'

import { authApi } from '@/apis'
import { CustomBtn, CustomInput } from '@/components'
import { useBoolean, useChromeStorage } from '@/hooks'
import { AUTH_FIELDS, ENVIRONMENT_KEYS, LOCAL_STORAGE_KEYS, PATH } from '@/utils/constants'
import { IErrorResponse, ILoginData, ILoginResponse, ILoginResultWithTokens } from '@/interfaces'

import { VerifyTokenTwoFa } from './VerifyTokenTwoFa'

export function Login() {
  const { t } = useTranslation()
  const schema = yup.object().shape({
    email: yup.string().email(t('login.emailValid')).required(t('login.emailRequired')),
    password: yup.string().min(8, t('login.passwordMin')).required(t('login.passwordRequire'))
  })

  const navigate = useNavigate()

  const { setValue: setAccessToken } = useChromeStorage<string>(LOCAL_STORAGE_KEYS.accessToken)
  const { setValue: setRefreshToken } = useChromeStorage<string>(LOCAL_STORAGE_KEYS.refreshToken)
  const { setValue: setCurrentUser } = useChromeStorage<object>(LOCAL_STORAGE_KEYS.currentUser)

  const [userTwoFaId, setUserTwoFaId] = useState<string>('')

  const { value: visibleVerifyTokenTwoFaForm, setTrue: setVerifyTokenTwoFaForm } = useBoolean(false)

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  })
  const isLoginResultWithTokens = (response: ILoginResponse): response is ILoginResultWithTokens => {
    return (response as ILoginResultWithTokens).accessToken !== undefined
  }

  const handleLogin = (data: ILoginData) => {
    mutateLogin(data)
  }

  const { mutate: mutateLogin, isPending } = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      if (isLoginResultWithTokens(response)) {
        setAccessToken(response.accessToken)
        setCurrentUser(response.currentUser)
        setRefreshToken(response.refreshToken)
        message.success(t('login.loginSuccess'))
        navigate(PATH.HOME, { state: { fromLogin: true, accessToken: response.accessToken } })
      } else {
        setUserTwoFaId(response.userId)
        setVerifyTokenTwoFaForm()
      }
    },
    onError: (error: AxiosError) => {
      const errorMessage = (error.response?.data as IErrorResponse)?.message
      message.error(t('login.loginFailed') + errorMessage)
    }
  })

  const handleForgotPassword = () => {
    const forgotPasswordUrl = `${ENVIRONMENT_KEYS.VITE_CLIENT_URL}/forgot-password`
    window.open(forgotPasswordUrl)
  }

  const verifyTokenTwoFaSuccess = (response: ILoginResultWithTokens) => {
    navigate(PATH.HOME, { state: { fromLogin: true, accessToken: response.accessToken } })
    setAccessToken(response.accessToken)
    setCurrentUser(response.currentUser)
    setRefreshToken(response.refreshToken)
  }

  return (
    <section className='flex justify-center bg-white'>
      {visibleVerifyTokenTwoFaForm ? (
        <VerifyTokenTwoFa userTwoFaId={userTwoFaId} onVerifySuccess={verifyTokenTwoFaSuccess} />
      ) : (
        <div className='mb-auto bg-white round-md p-8 xl:w-[30%] lg:w-auto lg:mt-5 shadow-xl border border-gray-100 w-full'>
          <h1 className='text-3xl font-semibold mb-4'>{t('login.title')}</h1>
          <span className='text-lg'>{t('login.noAccount')}</span> <br />
          <span className='text-lg inline-block mr-2'>{t('login.youCan')}</span>
          <a
            href={`${ENVIRONMENT_KEYS.VITE_CLIENT_URL}/register`}
            target='_blank'
            className='text-lg text-blue-500 font-semibold hover:underline'
          >
            {t('login.register')}
          </a>
          <Form className='mt-4' onFinish={handleSubmit(handleLogin)} layout='vertical'>
            {AUTH_FIELDS.map((field) => {
              if (field.name === 'email' || field.name === 'password')
                return (
                  <CustomInput
                    key={field.name}
                    name={field.name}
                    size='large'
                    type={field.name === 'password' ? 'password' : 'text'}
                    label={field.label}
                    control={control}
                    errors={errors}
                    placeholder={field.name === 'email' ? t('login.emailPlaceholder') : t('login.passwordPlaceholder')}
                  />
                )
            })}
            <button
              className='w-full text-right text-base font-normal text-red-500 hover:underline'
              onClick={handleForgotPassword}
            >
              <span className='hover:text-red-500'>{t('login.forgotPassword')}</span>
            </button>
            <CustomBtn
              title={t('login.loginButton')}
              type='primary'
              htmlType='submit'
              disabled={isPending}
              loading={isPending}
            />
          </Form>
        </div>
      )}
    </section>
  )
}
