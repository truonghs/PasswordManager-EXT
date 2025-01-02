import { Tabs, FloatButton } from 'antd'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { icons } from '@/utils/icons'
import { useAuth, useBoolean } from '@/hooks'
import { ENVIRONMENT_KEYS, HOME_TAB_KEY, HOME_TAB_LIST, HomeTabKey, STATUS_2FA } from '@/utils/constants'


export function Home() {
  const location = useLocation()

  const { currentUser } = useAuth()

  const [activeTab, setActiveTab] = useState<HomeTabKey>(HOME_TAB_KEY.ACCOUNT)

  const {
    value: showSuggestionTwoFa,
    setTrue: setShowSuggestionTwoFa,
    setFalse: setCloseSuggestionTwoFa
  } = useBoolean(false)

  const handleOpenTwoFa = () => {
    const CLIENT_TWO_FA_URL = `${ENVIRONMENT_KEYS.VITE_CLIENT_URL}/two-fa-recommendation`
    window.open(CLIENT_TWO_FA_URL)
    setCloseSuggestionTwoFa()
  }

  const onChange = (key: string) => {
    setActiveTab(key as HomeTabKey)
  }

  useEffect(() => {
    if (currentUser && currentUser.status === STATUS_2FA.NOT_REGISTERED && !currentUser?.isSkippedTwoFa) {
      setShowSuggestionTwoFa()
    }
  }, [currentUser])

  useEffect(() => {
    const activeTab = location.state?.activeTab
    if (activeTab) {
      setActiveTab(activeTab)
    }
  }, [location])

  return (
    <section className='min-h-full flex flex-col'>
      {showSuggestionTwoFa && (
        <FloatButton
          shape='square'
          type='default'
          icon={<span className='text-primary-800'>{icons.shieldLock}</span>}
          badge={{ dot: true }}
          onClick={handleOpenTwoFa}
          style={{ insetInlineEnd: 10, insetBlockEnd: 72 }}
          tooltip={<span>Enable Two Fa</span>}
        />
      )}
      <Tabs
        activeKey={activeTab}
        tabBarGutter={10}
        type='card'
        items={HOME_TAB_LIST}
        onChange={onChange}
        className='text-primary-800'
      />
    </section>
  )
}
