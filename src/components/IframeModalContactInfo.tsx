import { useEffect, useState } from 'react'

import { useContactInfo } from '@/hooks'
import { IContactInfoDataResponse } from '@/interfaces'

import { CustomInput } from './CustomInput'
import { ContactInfoItem } from './ContactInfoItem'

export function IframeModalContactInfo() {
  const { data: listContactInfo } = useContactInfo()

  const [listSuggestContactInfo, setListSuggestContactInfo] = useState<IContactInfoDataResponse[]>([])

  const [limitContactInfo, setLimitAccount] = useState<number>(3)

  const handleSearchContactInfo = (searchValue: string) => {
    const inputValueTrimmed = searchValue.trim().toLowerCase()
    if (listContactInfo) {
      const newListSuggestContactInfo = listContactInfo.filter(
        (contactInfo) =>
          !inputValueTrimmed ||
          ['title', 'firstName', 'midName', 'lastName'].some((key) => {
            const value = contactInfo[key as keyof IContactInfoDataResponse]
            return typeof value === 'string' && value.toLowerCase().includes(inputValueTrimmed)
          })
      )
      setListSuggestContactInfo(newListSuggestContactInfo)
    }
  }

  const handleLoadMore = () => {
    chrome.runtime.sendMessage({ action: 'updateHeight', height: '260px' })
    if (listContactInfo) setLimitAccount(listContactInfo.length)
  }

  useEffect(() => {
    if (listContactInfo) {
      if (listContactInfo?.length < 4) {
        chrome.runtime.sendMessage({
          action: 'updateHeight',
          height: `${(listContactInfo?.length || 1) * 70}px`
        })
      } else {
        chrome.runtime.sendMessage({
          action: 'updateHeight',
          height: `${(limitContactInfo === listContactInfo?.length ? 2.2 : 3) * 70 + 44 + 60}px`
        })
      }
      setListSuggestContactInfo(listContactInfo)
    }
  }, [listContactInfo])

  return (
    <section className='w-full'>
      <div className='flex flex-col'>
        {listContactInfo && listContactInfo?.length > 3 && (
          <CustomInput
            name='searchValue'
            size='large'
            placeholder='Search contact info'
            className='w-full text-lg font-medium m-0 hover:border-primary-800'
            onChange={(e: { target: { value: string } }) => handleSearchContactInfo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Backspace') return false
            }}
          />
        )}
        {listSuggestContactInfo?.length > 0 && (
          <ul
            className={`max-h-[215px] overflow-x-hidden ${limitContactInfo > 3 && listSuggestContactInfo?.length > 3 && 'overflow-y-scroll'}`}
          >
            {listSuggestContactInfo.slice(0, limitContactInfo).map((contactInfo) => (
              <ContactInfoItem key={contactInfo.id} contactInfo={contactInfo} />
            ))}
          </ul>
        )}

        {limitContactInfo < listSuggestContactInfo?.length && (
          <button
            className='w-full text-lg text-left p-4 cursor-pointer transition hover:bg-blue-200 border-t border-gray-300'
            onClick={handleLoadMore}
          >
            Load more
          </button>
        )}
      </div>
    </section>
  )
}
