import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Checkbox, Layout, message, Slider, Tooltip } from 'antd'

import { icons } from '@/utils/icons'
import { useCopyToClipboard } from '@/hooks'
import { generateCustomPassword } from '@/utils/helpers'
import { PASSWORD_SETTING_OPTIONS } from '@/utils/constants'

const { Header } = Layout

type PasswordSettingKeys = 'length' | 'numbers' | 'symbols' | 'lowercase' | 'uppercase'
type PasswordSettings = Record<PasswordSettingKeys, number | boolean>

const passwordTemp = generateCustomPassword({
  length: 50,
  numbers: true,
  symbols: true,
  lowercase: true,
  uppercase: true
})

export function Generator({ isShowHeader = true, isShowCopy = true }) {
  const { t } = useTranslation()
  const [, copy] = useCopyToClipboard()
  const [password, setPassword] = useState<string>(passwordTemp)
  const [disablePasswordSetting, setDisablePasswordSetting] = useState<string>('')
  const [passwordSettings, setPasswordSettings] = useState<PasswordSettings>({
    length: 50,
    numbers: true,
    symbols: true,
    lowercase: true,
    uppercase: true
  })

  const handleCopyPasswordToClipboard = () => {
    copy(password)
      .then(() => {
        message.success(t('generator.copySuccess'))
      })
      .catch((error) => {
        message.error(t('generator.copyFailed', { error }))
      })
  }

  const handleGeneratePassword = () => {
    const { length, numbers, symbols, lowercase, uppercase } = passwordSettings
    const newPassword = generateCustomPassword({
      length: length as number,
      numbers: !!numbers,
      symbols: !!symbols,
      lowercase: !!lowercase,
      uppercase: !!uppercase
    })

    setPassword(newPassword)
  }

  const handleChangePasswordSetting = (key: keyof PasswordSettings, checked: boolean) => {
    const { length, ...updatedSettings } = { ...passwordSettings, [key]: checked }
    const activeSettingsCount = Object.values(updatedSettings).filter(Boolean).length
    if (activeSettingsCount === 1) {
      setDisablePasswordSetting(
        Object.keys(updatedSettings).find((setting) => updatedSettings[setting as keyof typeof updatedSettings]) || ''
      )
    } else {
      setDisablePasswordSetting('')
    }
    setPasswordSettings({ length, ...updatedSettings })
  }

  const handleFillPasswordToInputField = () => {
    chrome.runtime.sendMessage({
      action: 'fillPassword',
      password: password
    })
  }

  useEffect(() => {
    handleGeneratePassword()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passwordSettings])

  return (
    <div>
      {isShowHeader && (
        <Header className='text-left capitalize text-white font-semibold text-xl leading-[64px] bg-primary-800 px-3'>
          {t('generator.passwordGenerator')}
        </Header>
      )}

      <div className='mt-5 mx-4'>
        <div className='flex justify-between items-center border-2 border-slate-200 px-3 py-2'>
          <p className='text-slate-800 text-lg text-left truncate'>{password}</p>
          <div className='flex'>
            {isShowCopy ? (
              <Tooltip title={t('generator.copy')} color='blue'>
                <span className='mr-3 text-primary-500 text-lg cursor-pointer' onClick={handleCopyPasswordToClipboard}>
                  {icons.copy}
                </span>
              </Tooltip>
            ) : (
              <Tooltip title={t('generator.fill')} color='blue'>
                <span className='mr-3 text-primary-500 text-lg cursor-pointer' onClick={handleFillPasswordToInputField}>
                  {icons.gitStashApply}
                </span>
              </Tooltip>
            )}

            <Tooltip title={t('generator.refresh')} color='blue'>
              <span className='text-primary-500 text-lg cursor-pointer' onClick={handleGeneratePassword}>
                {icons.refresh}
              </span>
            </Tooltip>
          </div>
        </div>

        <div className='mt-5'>
          <div className='flex justify-between'>
            <span className='text-slate-800 text-xl text-left'>{t('generator.passwordLength')}</span>
            <span className='text-slate-800 text-lg text-right'>{passwordSettings.length}</span>
          </div>
          <Slider
            min={8}
            max={100}
            defaultValue={passwordSettings.length as number}
            onChange={(value) => setPasswordSettings({ ...passwordSettings, length: value })}
          />
        </div>

        <div className='flex flex-col mt-5'>
          <p className='text-slate-800 text-xl text-left mb-2'>{t('generator.passwordSettings')}</p>
          {PASSWORD_SETTING_OPTIONS.map(({ key }) => (
            <Checkbox
              key={key}
              disabled={disablePasswordSetting === key}
              className='text-lg text-slate-700 mb-2'
              checked={!!passwordSettings[key as keyof PasswordSettings]}
              onChange={(e) => handleChangePasswordSetting(key as keyof PasswordSettings, e.target.checked)}
            >
              {t(`generator.${key}`)}
            </Checkbox>
          ))}
        </div>
      </div>
    </div>
  )
}
