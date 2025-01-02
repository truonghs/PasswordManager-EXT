import { useRef } from 'react'
import { Skeleton, Typography } from 'antd'
import { useQuery } from '@tanstack/react-query'

import { notificationKeys } from '@/keys'
import { Header } from 'antd/es/layout/layout'
import emptyData from '@/lotties/emptyNoti.json'
import { CustomLottie, NotificationItem } from '@/components'

export const Notification = () => {
  const { data: notifications, isFetching } = useQuery(notificationKeys.list())

  const listNotificationRef = useRef<HTMLUListElement | null>(null)
  return (
    <section>
      <Header className='text-left capitalize text-white font-semibold text-xl leading-[64px] bg-primary-800 px-3'>
        Notification
      </Header>
      {notifications && notifications?.length > 0 ? (
        <ul ref={listNotificationRef} className='overflow-y-auto h-[475px]'>
          {notifications.map((notification, index) => (
            <NotificationItem key={index} notification={notification} />
          ))}
        </ul>
      ) : (
        !isFetching && (
          <div className='flex flex-col justify-center items-center'>
            <CustomLottie animationData={emptyData} />
            <Typography.Text className='text-lg text-slate-800 pt-6'>
              There's no notification for you to see yet!
            </Typography.Text>
          </div>
        )
      )}
      {isFetching && (
        <>
          {Array.from({ length: 3 }).map((_, index) => (
            <li key={index} className='p-3 border-b border-gray-200'>
              <Skeleton avatar active title paragraph={{ rows: 2 }} />
            </li>
          ))}
        </>
      )}
    </section>
  )
}
