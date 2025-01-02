import { message } from 'antd'
import { AxiosError } from 'axios'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { authApi } from '@/apis'
import { userKeys } from '@/keys'
import { LOCAL_STORAGE_KEYS, PATH } from '@/utils/constants'
import { ICurrentUser, IErrorResponse } from '@/interfaces'
import { useChromeStorage } from './useChromeStorage'

export function useAuth() {
  const navigate = useNavigate()

  const queryClient = useQueryClient()

  const { storedValue: accessToken, getValue: getAccessToken } = useChromeStorage(LOCAL_STORAGE_KEYS.accessToken)

  getAccessToken()
  const {
    data: currentUser = null,
    isPending,
    isError
  } = useQuery<ICurrentUser>({
    ...userKeys.profile(),
    enabled: !!accessToken
  })

  const { mutate: mutateLogout } = useMutation<void, AxiosError<IErrorResponse>>({
    mutationFn: authApi.logout,
    onSuccess: () => {
      navigate(PATH.LOGIN)
      queryClient.setQueryData(userKeys.profiles(), null)
      chrome.storage.local.clear()
    },
    onError: (error: AxiosError) => {
      const errorMessage = (error.response?.data as IErrorResponse)?.message
      message.error(errorMessage)
    }
  })
  return { currentUser, isPending, mutateLogout, isError }
}
