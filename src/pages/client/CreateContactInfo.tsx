import * as yup from 'yup'
import { AxiosError } from 'axios'
import { Form, message } from 'antd'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { accountKeys } from '@/keys'
import { icons } from '@/utils/icons'
import { contactInfoApi } from '@/apis'
import { CustomBtn, CustomInput } from '@/components'
import { CONTACTINFO_FIELDS } from '@/utils/constants'
import { ICreateContactInfo, IErrorResponse } from '@/interfaces'

export function CreateContactInfo() {
  const createContactInfoSchema = yup.object().shape({
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

  const queryClient = useQueryClient()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(createContactInfoSchema)
  })

  const { mutate: mutateCreateContactInfo, isPending } = useMutation({
    mutationFn: contactInfoApi.create,
    onSuccess: () => {
      reset()
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() })
      message.success('Create contact info successfully!')
      chrome.runtime.sendMessage({ action: 'closeFormCreateContactInfo' })
    },
    onError: (error: AxiosError) => {
      const errorMessage = (error.response?.data as IErrorResponse)?.message
      message.error(errorMessage)
    }
  })

  const handleCreateContactInfo = (data: ICreateContactInfo) => {
    mutateCreateContactInfo(data)
  }

  const handleCloseForm = () => {
    chrome.runtime.sendMessage({ action: 'closeFormCreateContactInfo' })
  }

  return (
    <section>
      <div className='relative flex flex-col box-border min-h-[188px] border border-[#d5d9de] rounded-[4px] shadow-[0_3px_9px_rgba(0,0,0,0.3)]  w-[420px] bg-[#f7f9fc] p-4'>
        <div className='flex justify-between items-center'>
          <h2 className='text-xl text-primary-800 font-semibold'>Add to GoPass</h2>
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
          onFinish={handleSubmit(handleCreateContactInfo)}
          layout='vertical'
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

          <CustomBtn title='Save' type='primary' htmlType='submit' disabled={isPending} loading={isPending} />
        </Form>
      </div>
    </section>
  )
}
