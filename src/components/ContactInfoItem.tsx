import React from 'react'
import { Button, Dropdown, MenuProps } from 'antd'

import { icons } from '@/utils/icons'
import { IContactInfoDataResponse } from '@/interfaces'

type ContactInfoItemProps = {
  contactInfo: IContactInfoDataResponse
  showAction?: boolean
  setOpen?: () => void
  setDeleteContactInfoId?: React.Dispatch<React.SetStateAction<string>>
}
export const ContactInfoItem: React.FC<ContactInfoItemProps> = ({
  contactInfo,
  showAction = false,
  setOpen,
  setDeleteContactInfoId
}) => {
  const handleFillContactInfoToInputField = (contactInfo: IContactInfoDataResponse) => () => {
    contactInfo.fullName = `${contactInfo.firstName} ${contactInfo.midName} ${contactInfo.lastName}`
    contactInfo.address = `${contactInfo.street} ${contactInfo.city} ${contactInfo.country}`
    chrome.runtime.sendMessage({
      action: 'fillContactInfo',
      contactInfo
    })
  }
  const handleOpenTabEditContactInfo = (contactInfo: IContactInfoDataResponse) => () => {
    chrome.tabs.create({
      url: `index.html#/edit-contactinfo/${contactInfo.id}`
    })
  }

  const createActionContactInfo = (data: IContactInfoDataResponse): MenuProps['items'] => [
    {
      key: 'edit',
      label: (
        <span className='flex items-center text-slate-700 text-lg font-normal'>
          <span className='mr-2'>{icons.edit}</span>
          Edit
        </span>
      ),
      onClick: (e) => {
        e.domEvent.stopPropagation()
        onActionContactInfoClick('edit', data)
      }
    },
    {
      key: 'delete',
      label: (
        <span className='flex items-center text-red-500 text-lg font-normal'>
          <span className='mr-2'>{icons.trash}</span>
          Delete
        </span>
      ),
      onClick: (e) => {
        e.domEvent.stopPropagation()
        onActionContactInfoClick('delete', data)
      }
    }
  ]

  const onActionContactInfoClick = (key: string, contactInfo: IContactInfoDataResponse) => {
    if (key === 'edit') {
      chrome.tabs.create({
        url: `index.html#/edit-contactinfo/${contactInfo.id}`
      })
    } else if (key === 'delete') {
      if (setOpen && setDeleteContactInfoId) {
        setOpen()
        setDeleteContactInfoId(contactInfo.id)
      }
    }
  }

  return (
    <li
      id='header-modal'
      className='flex justify-between items-center border-b border-b-gray-300 transition hover:bg-blue-200 hover:cursor-pointer group'
    >
      <div className='flex flex-1 items-center p-2' onClick={handleFillContactInfoToInputField(contactInfo)}>
        <span className='mr-3 cursor-pointer p-1 rounded-sm'>
          <span className='text-primary-800 text-3xl align-middle'>{icons.contact}</span>
        </span>
        <div className='relative text-left flex-1'>
          <span className='transition-all duration-500 text-base text-slate-600 text-left text-ellipsis text-nowrap max-w-[200px] overflow-hidden opacity-100 group-hover:opacity-0 group-hover:transform group-hover:translate-y-2'>
            {contactInfo.title}
          </span>

          <span className='absolute top-0 left-0 transition-all duration-500 text-base font-bold opacity-0 transform -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-hover:text-primary-500'>
            Fill
          </span>
          <div className='text-left text-lg font-medium text-slate-700 overflow-hidden text-ellipsis whitespace-nowrap max-w-[165px]'>
            {`${contactInfo.firstName} ${contactInfo.midName} ${contactInfo.lastName}`}
          </div>
        </div>
      </div>
      {showAction ? (
        <Dropdown menu={{ items: createActionContactInfo(contactInfo) }} placement='bottomRight' arrow trigger={['click']}>
          <Button className='bg-transparent outline-none border-none cursor-pointer mr-2 shadow-none'>
            <span className='text-primary-500 text-lg'>{icons.moreAlt}</span>
          </Button>
        </Dropdown>
      ) : (
        <div
          className='p-2 hover:bg-blue-200 transition group-hover:bg-blue-300'
          onClick={handleOpenTabEditContactInfo(contactInfo)}
        >
          <span className='text-primary-800 text-2xl cursor-pointer'>{icons.pencil}</span>
        </div>
      )}
    </li>
  )
}
