import { useTranslation } from 'react-i18next'
import { useEffect, useRef, useState } from 'react'
import { Button, message, Modal, Spin, Typography } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { accountApi } from '@/apis'
import { accountKeys } from '@/keys'
import { icons } from '@/utils/icons'
import emptyData from '@/lotties/emptyData.json'
import { useAccount, useBoolean, useDebounce } from '@/hooks'
import { IAccountDataResponse, IPaginationParams } from '@/interfaces'
import { AccountItem, CustomBtn, CustomInput, CustomLottie } from '@/components'

export const ListAccounts = () => {
  const { t } = useTranslation()

  const queryClient = useQueryClient()

  const listRef = useRef<HTMLUListElement | null>(null)

  const [queryParams, setQueryParams] = useState<IPaginationParams>({
    page: 1,
    limit: 20
  })

  const { data, isLoading, isFetching, isFetched } = useAccount(queryParams)

  const [deleteAccountId, setDeleteAccountId] = useState<string>('')

  const [searchValue, setSearchValue] = useState<string>('')

  const debouncedInputValue = useDebounce(searchValue, 600)

  const [accounts, setAccounts] = useState<IAccountDataResponse[]>([])

  const { value: open, setTrue: setOpen, setFalse: setClose } = useBoolean(false)

  const handleCancel = () => {
    setDeleteAccountId('')
    setClose()
  }

  const handleDelete = () => {
    if (deleteAccountId) mutateDeleteAccount(deleteAccountId)
  }

  const { mutate: mutateDeleteAccount, isPending: isPendingDeleteAccount } = useMutation({
    mutationFn: accountApi.delete,
    onSuccess: () => {
      message.success('Delete account successfully')
      setClose()
      queryClient.invalidateQueries({ queryKey: accountKeys.lists(), refetchType: 'all' })
    },
    onError: (e) => {
      message.error(e.message)
    }
  })

  const handleSearchAccount = (searchValue: string) => {
    setSearchValue(searchValue)
    setAccounts([])
  }

  const handleOpenForm = () => {
    chrome.runtime.sendMessage({ action: 'openForm' }, () => {
      window.close()
    })
  }

  useEffect(() => {
    setQueryParams({
      page: 1,
      limit: 20,
      keyword: debouncedInputValue
    })
  }, [debouncedInputValue])

  useEffect(() => {
    if (data && data.accounts) {
      setAccounts((prev) => [...prev.filter((account) => account.id !== deleteAccountId), ...data.accounts])
    }
  }, [data])

  useEffect(() => {
    const listContainer = listRef.current
    if (!listContainer) return
    const handleScroll = () => {
      const scrollTop = listContainer.scrollTop
      const scrollHeight = listContainer.scrollHeight
      const clientHeight = listContainer.clientHeight

      if (scrollHeight - scrollTop <= clientHeight + 100) {
        if (data && data.totalPages > queryParams.page) {
          setQueryParams({
            page: queryParams.page + 1,
            limit: 20,
            keyword: debouncedInputValue
          })
        }
      }
    }

    listContainer.addEventListener('scroll', handleScroll)

    return () => {
      listContainer.removeEventListener('scroll', handleScroll)
    }
  }, [accounts])

  return (
    <div>
      {((!isLoading && data && accounts.length > 0) || searchValue || queryParams?.keyword) && (
        <div className='flex items-center pb-3 border-b border-b-gray-300'>
          <CustomInput
            name='searchValue'
            size='large'
            placeholder={t('home.searchPlaceholder')}
            className='text-lg font-medium mx-2 border-1 border-gray-200 rounded-md hover:border-primary-800 focus-within:shadow-custom'
            onChange={(e: { target: { value: string } }) => handleSearchAccount(e.target.value)}
          />
          <CustomBtn
            type='primary'
            className='!mt-0 !w-fit !h-11 !gap-0 mr-2'
            children={<span className='text-2xl'>{icons.add}</span>}
            onClick={handleOpenForm}
          />
        </div>
      )}

      {isLoading && isFetched && (
        <div className='flex justify-center items-center mt-5'>
          <Spin size='large' />
        </div>
      )}

      {accounts.length > 0 && (
        <>
          <Modal
            open={open}
            title={t('home.deleteConfirmTitle')}
            onCancel={handleCancel}
            cancelText={t('home.cancelButton')}
            footer={(_, { CancelBtn }) => (
              <>
                <CancelBtn />
                <Button danger type='primary' onClick={handleDelete} loading={isPendingDeleteAccount}>
                  {t('home.deleteConfirmTitle')}
                </Button>
              </>
            )}
          >
            <span>{t('home.deleteConfirmMessage')}</span>
          </Modal>

          <ul ref={listRef} className='h-[410px] overflow-y-auto'>
            {accounts.map((account: IAccountDataResponse) => (
              <AccountItem
                key={account.id}
                account={account}
                setOpen={setOpen}
                setDeleteAccountId={setDeleteAccountId}
              />
            ))}
          </ul>
        </>
      )}

      {isFetching && (
        <div className='flex justify-center items-center mt-5'>
          <Spin size='large' />
        </div>
      )}

      {!isLoading && !isFetching && data && data?.accounts.length === 0 && (
        <div className='flex flex-col justify-center items-center'>
          <CustomLottie animationData={emptyData} />
          <Typography.Text className='text-center text-lg text-slate-800'>
            {!debouncedInputValue ? "There's no account for you to see yet!" : 'No account found!'}
          </Typography.Text>
          {!debouncedInputValue && (
            <>
              <Typography.Text className='text-center text-lg text-slate-800'>
                If you want to create new account, just click
              </Typography.Text>
              <CustomBtn
                title='Create Account'
                type='primary'
                className='mt-2 !w-fit !h-12 !gap-2'
                children={<span className='text-2xl'>{icons.add}</span>}
                onClick={handleOpenForm}
              />
            </>
          )}
        </div>
      )}
    </div>
  )
}
