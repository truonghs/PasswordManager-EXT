import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { Button, message, Modal, Spin, Typography } from 'antd'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { workspaceApi } from '@/apis'
import { icons } from '@/utils/icons'
import { workspaceKeys } from '@/keys'
import emptyData from '@/lotties/emptyWorkspace.json'
import { LOCAL_STORAGE_KEYS } from '@/utils/constants'
import { useBoolean, useChromeStorage, useDebounce } from '@/hooks'
import { CustomBtn, CustomInput, CustomLottie, WorkspaceItem } from '@/components'
import { IErrorResponse, IPaginationParams, IWorkspaceDataResponse, IWorkspaceDataResponsePaginate } from '@/interfaces'

export function ListWorkspaces() {
  const { t } = useTranslation()

  const navigate = useNavigate()

  const queryClient = useQueryClient()

  const listRef = useRef<HTMLUListElement | null>(null)

  const { storedValue: accessToken, getValue: getAccessToken } = useChromeStorage(LOCAL_STORAGE_KEYS.accessToken)
  getAccessToken()

  const [queryParams, setQueryParams] = useState<IPaginationParams>({
    page: 1,
    limit: 20
  })

  const { data, isLoading, isFetching, isFetched } = useQuery<
    IWorkspaceDataResponsePaginate,
    AxiosError<IErrorResponse>
  >({
    ...workspaceKeys.list(queryParams as IPaginationParams),
    enabled: !!queryParams && !!accessToken
  })

  const [searchValue, setSearchValue] = useState<string>('')

  const debouncedInputValue = useDebounce(searchValue, 600)

  const [workspaces, setWorkspaces] = useState<IWorkspaceDataResponse[]>([])

  const [deleteWorkspaceId, setDeleteWorkspaceId] = useState<string>('')

  const { value: openWarningDeleteWorkspace, toggle: setOpenWarningDeleteWorkspace } = useBoolean(false)

  const handleOpenFormCreateWorkspace = () => {
    navigate('/create-workspace')
  }

  const { mutate, isPending } = useMutation({
    mutationFn: workspaceApi.softDelete,
    onSuccess: () => {
      message.success(t('workspace.deleteSuccess'))
      setOpenWarningDeleteWorkspace()
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() })
    },
    onError: () => {
      message.error(t('workspace.deleteError'))
    }
  })

  const handleSearchWorkspace = (searchValue: string) => {
    setSearchValue(searchValue)
    setWorkspaces([])
  }

  const handleDelete = () => {
    if (deleteWorkspaceId) mutate(deleteWorkspaceId)
  }

  const handleCancel = () => {
    setDeleteWorkspaceId('')
    setOpenWarningDeleteWorkspace()
  }

  useEffect(() => {
    setQueryParams({
      page: 1,
      limit: 20,
      keyword: debouncedInputValue
    })
  }, [debouncedInputValue])

  useEffect(() => {
    if (data && data.workspaces) {
      setWorkspaces((prev) => [...prev.filter((workspace) => workspace.id !== deleteWorkspaceId), ...data.workspaces])
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
  }, [workspaces])

  return (
    <section>
      {((!isLoading && data && workspaces.length > 0) || searchValue || queryParams?.keyword) && (
        <div className='flex items-center pb-3 border-b border-b-gray-300'>
          <CustomInput
            name='searchValue'
            size='large'
            placeholder={t('workspace.searchPlaceholder')}
            className='text-lg font-medium mx-2 border-1 border-gray-200 rounded-md hover:border-primary-800 focus-within:shadow-custom'
            onChange={(e: { target: { value: string } }) => handleSearchWorkspace(e.target.value)}
          />
          <CustomBtn
            type='primary'
            className='!mt-0 !w-fit !h-11 !gap-0 mr-2'
            children={<span className='text-2xl'>{icons.add}</span>}
            onClick={handleOpenFormCreateWorkspace}
          />
        </div>
      )}

      {isLoading && isFetched && (
        <div className='flex justify-center items-center mt-5'>
          <Spin size='large' />
        </div>
      )}

      {workspaces.length > 0 && (
        <>
          <Modal
            open={openWarningDeleteWorkspace}
            title={t('workspace.warning')}
            onCancel={handleCancel}
            cancelText={t('workspace.cancelButton')}
            footer={(_, { CancelBtn }) => (
              <>
                <CancelBtn />
                <Button danger type='primary' onClick={handleDelete} loading={isPending}>
                  {t('workspace.deleteButton')}
                </Button>
              </>
            )}
          >
            <span>{t('workspace.deleteConfirmation')}</span>
          </Modal>

          <ul ref={listRef} className='mt-1 h-[410px] overflow-y-auto'>
            {workspaces.map((workspace: IWorkspaceDataResponse) => {
              return (
                <WorkspaceItem
                  key={workspace.id}
                  workspace={workspace}
                  setDeleteWorkspaceId={setDeleteWorkspaceId}
                  setOpen={setOpenWarningDeleteWorkspace}
                />
              )
            })}
          </ul>
        </>
      )}

      {isFetching && (
        <div className='flex justify-center items-center mt-5'>
          <Spin size='large' />
        </div>
      )}

      {!isLoading && !isFetching && data && data?.workspaces.length === 0 && (
        <div className='flex flex-col justify-center items-center'>
          <CustomLottie animationData={emptyData} />
          <Typography.Text className='text-center text-lg text-slate-800'>
            {!debouncedInputValue ? "There's no workspace for you to see yet!" : 'No workspace found!'}
          </Typography.Text>
          {!debouncedInputValue && (
            <>
              <Typography.Text className='text-center text-lg text-slate-800 mx-1'>
                If you want to create new workspace, just click
              </Typography.Text>
              <CustomBtn
                title='Create Workspace'
                type='primary'
                className='mt-2 !w-fit !h-12 !gap-2'
                children={<span className='text-2xl'>{icons.add}</span>}
                onClick={handleOpenFormCreateWorkspace}
              />
            </>
          )}
        </div>
      )}
    </section>
  )
}
