import { Dropdown, MenuProps } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { useAuth } from '@/hooks'
import { icons } from '@/utils/icons'
import { loadLanguageFromStorage } from '@/utils/helpers'
import { ENVIRONMENT_KEYS, PATH } from '@/utils/constants'

export function Account() {
  const { i18n, t } = useTranslation()
  const navigate = useNavigate()

  const { currentUser } = useAuth()
  const [language, setLanguage] = useState<string>('en')

  const itemsLanguages: MenuProps['items'] = [
    {
      key: 'en',
      label: (
        <span className='flex justify-between items-center text-base font-normal'>
          {t('account.en')}
          {language === 'en' && <span className='text-green-500 text-xl'>{icons.check}</span>}
        </span>
      )
    },
    {
      key: 'vi',
      label: (
        <span className='flex justify-between items-center text-base font-normal'>
          {t('account.vi')}
          {language === 'vi' && <span className='text-green-500 text-xl'>{icons.check}</span>}
        </span>
      )
    }
  ]

  const handleLogout = () => {
    chrome.storage.local
      .clear()
      .then(() => {
        navigate(PATH.LOGIN)
      })
      .catch((e) => console.error(e))
  }

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
    chrome.storage.sync.set({ language: lng })
  }

  const onClick: MenuProps['onClick'] = ({ key }) => {
    changeLanguage(key)
    setLanguage(key)
  }

  const handleOpenSettings = () => {
    const clientSettingUrl = `${ENVIRONMENT_KEYS.VITE_CLIENT_URL}${PATH.VAULT_SETTINGS}`
    chrome.runtime.sendMessage({ action: 'syncLoginToWeb', userId: currentUser?.id, targetUrl: clientSettingUrl })
  }

  useEffect(() => {
    const getLanguage = async () => {
      const savedLanguage = await loadLanguageFromStorage()
      setLanguage(savedLanguage)
    }
    getLanguage()
  }, [setLanguage])

  return (
    <section className='bg-radial-custom h-full'>
      <h2 className='flex items-center text-lg font-semibold bg-primary-800 text-white leading-[64px] px-2'>
        <span className='mr-2'>{icons.user}</span>
        {currentUser?.email}
      </h2>

      <Dropdown
        menu={{ items: itemsLanguages, onClick }}
        trigger={['click']}
        className='block text-left text-lg text-slate-800 p-2 cursor-pointer hover:text-blue-antd'
      >
        <div className='flex items-center'>
          <span className='mr-2'>{icons.language}</span>
          {t('account.language')} ({language})
        </div>
      </Dropdown>

      <div>
        <a className='flex items-center text-lg text-slate-800 p-2'>
          <span className='mr-2'>{icons.versions}</span>
          {t('account.version')}
        </a>
      </div>

      <button
        onClick={handleOpenSettings}
        className='flex items-center w-full text-lg text-slate-800 p-2 hover:text-blue-antd'
      >
        <span className='text-xl mr-2'>{icons.settings}</span>
        {t('account.settings')}
      </button>

      <button
        onClick={handleLogout}
        className='flex items-center w-full text-lg text-slate-800 p-2 hover:text-blue-antd'
      >
        <span className='text-xl mr-2'>{icons.logout}</span>
        {t('account.logout')}
      </button>
    </section>
  )
}
