import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, message, Modal, Spin, Typography } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { icons } from '@/utils/icons'
import { contactInfoApi } from '@/apis'
import { contactInfoKeys } from '@/keys'
import emptyData from '@/lotties/emtpyContact.json'
import { IContactInfoDataResponse } from '@/interfaces'
import { useAuth, useBoolean, useContactInfo } from '@/hooks'
import { ContactInfoItem, CustomBtn, CustomInput, CustomLottie } from '@/components'

export const ListContactInfos = () => {
  const { t } = useTranslation()

  const queryClient = useQueryClient()

  const { currentUser } = useAuth()

  const [deleteContactInfoId, setDeleteContactInfoId] = useState<string>('')

  const [listSuggestContactInfos, setListSuggestContactInfos] = useState<IContactInfoDataResponse[]>([])

  const { value: open, setTrue: setOpen, setFalse: setClose } = useBoolean(false)

  const { data: contactInfos, isLoading } = useContactInfo()

  const handleCancel = () => {
    setDeleteContactInfoId('')
    setClose()
  }

  const handleDelete = () => {
    if (deleteContactInfoId) mutateDeleteContactInfo(deleteContactInfoId)
  }

  const { mutate: mutateDeleteContactInfo, isPending: isPendingDeleteContactInfo } = useMutation({
    mutationFn: contactInfoApi.delete,
    onSuccess: () => {
      message.success('Delete contact info successfully!')
      setClose()
      queryClient.invalidateQueries({ queryKey: contactInfoKeys.all, refetchType: 'all' })
    },
    onError: (e) => {
      message.error(e.message)
    }
  })

  const handleSearchContactInfo = (searchValue: string) => {
    const trimedSearchValue = searchValue.trim().toLowerCase()
    if (contactInfos) {
      const newListSuggestContactInfo = contactInfos.filter(
        (contactInfo) =>
          !trimedSearchValue ||
          ['title', 'firstName', 'midName', 'lastName'].some((key) => {
            const value = contactInfo[key as keyof IContactInfoDataResponse]
            return typeof value === 'string' && value.toLowerCase().includes(trimedSearchValue)
          })
      )
      setListSuggestContactInfos(newListSuggestContactInfo)
    }
  }

  const handleOpenForm = () => {
    chrome.runtime.sendMessage({ action: 'openFormCreateContactInfo' }, () => {
      window.close()
    })
  }

  useEffect(() => {
    if (contactInfos) setListSuggestContactInfos(contactInfos)
  }, [contactInfos])

  if (isLoading || !currentUser || !contactInfos) {
    return (
      <div className='flex justify-center items-center mt-5'>
        <Spin size='large' />
      </div>
    )
  }

  return (
    <div>
      {contactInfos?.length > 0 ? (
        <>
          <Modal
            open={open}
            title={t('home.deleteConfirmTitle')}
            onCancel={handleCancel}
            cancelText={t('home.cancelButton')}
            footer={(_, { CancelBtn }) => (
              <>
                <CancelBtn />
                <Button danger type='primary' onClick={handleDelete} loading={isPendingDeleteContactInfo}>
                  {t('home.deleteConfirmTitle')}
                </Button>
              </>
            )}
          >
            <span>{t('home.deleteConfirmMessage')}</span>
          </Modal>
          <div className='flex items-center pb-3 border-b border-b-gray-300'>
            <CustomInput
              name='searchValue'
              size='large'
              placeholder='Search contact info'
              className='text-lg font-medium mx-2 border-1 border-gray-200 rounded-md hover:border-primary-800 focus-within:shadow-custom'
              onChange={(e: { target: { value: string } }) => handleSearchContactInfo(e.target.value)}
            />
            <CustomBtn
              type='primary'
              className='!mt-0 !w-fit !h-11 !gap-0 mr-2'
              children={<span className='text-2xl'>{icons.add}</span>}
              onClick={handleOpenForm}
            />
          </div>
          <ul>
            {listSuggestContactInfos.length > 0 ? (
              listSuggestContactInfos.map((contactInfo) => {
                return (
                  <ContactInfoItem
                    key={contactInfo.id}
                    contactInfo={contactInfo}
                    setDeleteContactInfoId={setDeleteContactInfoId}
                    setOpen={setOpen}
                    showAction={currentUser?.id === contactInfo?.owner?.id}
                  />
                )
              })
            ) : (
              <li className='text-slate-700 text-lg mt-5'>No contact info found!</li>
            )}
          </ul>
        </>
      ) : (
        <div className='flex flex-col justify-center items-center'>
          <CustomLottie animationData={emptyData} />
          <Typography.Text className='text-center text-lg text-slate-800'>
            There's no contact info for you to see yet
          </Typography.Text>
          <Typography.Text className='text-center text-lg text-slate-800'>
            If you want to create new contact info, just click
          </Typography.Text>
          <CustomBtn
            title='Create Contact'
            type='primary'
            className='mt-2 !w-fit !h-12 !gap-2'
            children={<span className='text-2xl'>{icons.add}</span>}
            onClick={handleOpenForm}
          />
        </div>
      )}
    </div>
  )
}
