import * as yup from 'yup'
import { useEffect } from 'react'
import { AxiosError } from 'axios'
import { Form, message, Spin } from 'antd'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQuery } from '@tanstack/react-query'

import { icons } from '@/utils/icons'
import { contactInfoApi } from '@/apis'
import { contactInfoKeys } from '@/keys'
import { CustomBtn, CustomInput } from '@/components'
import { CONTACTINFO_FIELDS } from '@/utils/constants'
import { IContactInfoDataResponse, IErrorResponse, IUpdateContactInfoData } from '@/interfaces'

export function EditContactInfo() {
  const editContactInfoSchema = yup.object().shape({
    title: yup.string().required('Please enter name of contact info!'),
    firstName: yup.string(),
    midName: yup.string(),
    lastName: yup.string(),
    street: yup.string(),
    city: yup.string(),
    country: yup.string(),
    email: yup.string().email('Please enter a valid email!'),
    phoneNumber: yup.string()
  })

  const { contactInfoId } = useParams<string>()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm({
    resolver: yupResolver(editContactInfoSchema)
  })

  const { data: contactInfoData, isFetching } = useQuery<IContactInfoDataResponse, AxiosError<IErrorResponse>>({
    ...contactInfoKeys.detail(contactInfoId as string),
    enabled: !!contactInfoId
  })

  const { mutate: mutateUpdateContactInfo, isPending } = useMutation({
    mutationFn: contactInfoApi.update,
    onSuccess: () => {
      reset()
      message.success('Update contact info successfully!')
      window.close()
    },
    onError: (error: AxiosError) => {
      const errorMessage = (error.response?.data as IErrorResponse)?.message
      message.error(errorMessage)
    }
  })

  const handleUpdateContactInfo = (data: IUpdateContactInfoData) => {
    mutateUpdateContactInfo({ contactInfoId, ...data })
  }

  const handleCloseForm = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id
      if (tabId) {
        chrome.tabs.remove(tabId)
      }
    })
  }

  useEffect(() => {
    if (contactInfoData) reset(contactInfoData)
  }, [contactInfoData])

  return (
    <section className='flex h-screen'>
      <div className='relative flex flex-col box-border  border border-[#d5d9de] m-auto rounded-[4px] shadow-[0_3px_9px_rgba(0,0,0,0.3)]  w-2/5 bg-[#f7f9fc] p-6'>
        <div className='flex justify-between items-center'>
          <h2 className='text-xl text-primary-800 font-semibold mb-4'>Edit contact info</h2>
          <button
            className='hover:bg-gray-300 cursor-pointer '
            id='create-account-form-close'
            onClick={handleCloseForm}
          >
            <span className='text-3xl text-gray-600 font-semibold'>{icons.close}</span>
          </button>
        </div>
        {isFetching ? (
          <Spin className='mt-8' />
        ) : (
          <Form
            className='bg-white border border-gray-200 p-6'
            onFinish={handleSubmit(handleUpdateContactInfo)}
            layout='horizontal'
            labelCol={{ span: 6 }}
          >
            {CONTACTINFO_FIELDS.map((field) => (
              <CustomInput
                key={field.name}
                name={field.name}
                size='large'
                type={field.type}
                label={field.label}
                control={control}
                errors={errors}
              />
            ))}

            <CustomBtn title='Update' type='primary' htmlType='submit' disabled={isPending || !isDirty} loading={isPending} />
          </Form>
        )}
      </div>
    </section>
  )
}
