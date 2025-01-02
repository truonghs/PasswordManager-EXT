import axios, { AxiosError } from 'axios'
import type { NotificationArgsProps } from 'antd'
import { useEffect, useLayoutEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Layout, notification, Space } from 'antd'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import { loginHistoryApi } from '@/apis'
import { useAuth, useBoolean } from '@/hooks'
import { BottomTab, CustomBtn } from '@/components'
import { ENVIRONMENT_KEYS, LOCAL_STORAGE_KEYS, PATH } from '@/utils/constants'
import { IDataResponse, IErrorResponse, ILoginHistoryData } from '@/interfaces'

const { Content } = Layout
type NotificationPlacement = NotificationArgsProps['placement']

export const DefaultLayout = () => {
  const navigate = useNavigate()

  const location = useLocation()

  const { currentUser } = useAuth()

  const [api, contextHolder] = notification.useNotification()

  const { value: isShowPopupConfirmSync, setTrue: setShowPopupConfirmSync } = useBoolean(false)

  const handleSyncLoginToWeb = () => {
    api.destroy()
    chrome.runtime.sendMessage({
      action: 'syncLoginToWeb',
      userId: currentUser?.id,
      targetUrl: ENVIRONMENT_KEYS.VITE_CLIENT_URL
    })
  }

  const handleCancelSyncLoginToWeb = () => {
    api.destroy()
  }

  const { mutate: mutateStoreLoginHistory } = useMutation<IDataResponse, AxiosError<IErrorResponse>, ILoginHistoryData>(
    {
      mutationFn: loginHistoryApi.store
    }
  )

  const requestLocationAndSave = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          try {
            const { data } = await axios.get(`${ENVIRONMENT_KEYS.VITE_OPEN_STREET_MAP_API_URL}`, {
              params: {
                lat: latitude,
                lon: longitude,
                format: 'json'
              }
            })
            mutateStoreLoginHistory({
              lat: latitude,
              lon: longitude,
              address: data.display_name
            })
          } catch (error) {
            console.error(error)
          }
        },
        (error) => {
          console.error('Location access denied', error)
        }
      )
    } else {
      console.warn('Geolocation is not supported by this browser.')
    }
  }

  useLayoutEffect(() => {
    const openNotification = (placement: NotificationPlacement) => {
      api.info({
        message: 'Do you want to sync login to vault?',
        description: (
          <Space className='w-full justify-between'>
            <CustomBtn title='Cancel' size='small' className='!text-sm !h-9' onClick={handleCancelSyncLoginToWeb} />
            <CustomBtn
              title='Sync'
              type='primary'
              size='small'
              className='!text-sm !h-9'
              onClick={handleSyncLoginToWeb}
            />
          </Space>
        ),
        placement,
        duration: 0
      })
    }

    if (location.state?.fromLogin && !isShowPopupConfirmSync && currentUser) {
      setShowPopupConfirmSync()
      openNotification('top')
      requestLocationAndSave()
    }
  }, [location, currentUser, isShowPopupConfirmSync])

  useEffect(() => {
    const getDataLocal = async () => {
      try {
        const result = await chrome.storage.local.get(LOCAL_STORAGE_KEYS.accessToken)
        if (!result[LOCAL_STORAGE_KEYS.accessToken]) {
          navigate(PATH.LOGIN)
        }
      } catch (error) {
        navigate(PATH.LOGIN)
        chrome.storage.local.clear()
        console.error('Error getting data from chrome.storage:', error)
      }
    }
    getDataLocal()
  }, [navigate])

  return (
    <Layout className='w-[375px] h-[600px] max-w-full overflow-hidden'>
      <Content className='text-center min-h-[120px] text-white bg-white overflow-hidden'>
        {contextHolder}
        <Outlet />
      </Content>
      <BottomTab />
    </Layout>
  )
}
