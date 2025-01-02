import { Badge, Layout } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { NavLink, useLocation } from 'react-router-dom'

import { notificationKeys } from '@/keys'
import { BOTTOM_TAB_LIST, PATH } from '@/utils/constants'

const { Footer } = Layout

export function BottomTab() {
  const location = useLocation()

  const { data: notifications } = useQuery(notificationKeys.list())

  return (
    <Footer className='flex justify-between items-center text-white bg-primary-800 p-0'>
      {BOTTOM_TAB_LIST.map((bottomTabItem) => (
        <div className='flex-1' key={bottomTabItem.title}>
          <NavLink
            className={({ isActive }) =>
              `py-3 flex flex-col items-center justify-center ${isActive ? 'bg-primary-500' : ''}`
            }
            to={bottomTabItem.to}
          >
            {bottomTabItem.to === PATH.NOTIFICATION ? (
              <Badge
                count={
                  location.pathname === PATH.NOTIFICATION
                    ? 0
                    : notifications?.filter((notification) => !notification.isRead)?.length || 0
                }
              >
                <div className='text-lg font-semibold text-white'>{bottomTabItem.icon}</div>
              </Badge>
            ) : (
              <div className='text-lg font-semibold text-white'>{bottomTabItem.icon}</div>
            )}
            <span className='font-medium'>{bottomTabItem.title}</span>
          </NavLink>
        </div>
      ))}
    </Footer>
  )
}
