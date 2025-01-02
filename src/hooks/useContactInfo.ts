import { AxiosError } from 'axios'
import { useQuery } from '@tanstack/react-query'

import { contactInfoKeys } from '@/keys'
import { LOCAL_STORAGE_KEYS } from '@/utils/constants'
import { IContactInfoDataResponse, IErrorResponse } from '@/interfaces'

import { useChromeStorage } from './useChromeStorage'

export function useContactInfo() {
  const { storedValue: accessToken, getValue: getAccessToken } = useChromeStorage(LOCAL_STORAGE_KEYS.accessToken)

  getAccessToken()
  const { data, isFetching, isLoading, isError } = useQuery<IContactInfoDataResponse[], AxiosError<IErrorResponse>>({
    ...contactInfoKeys.list(),
    enabled: !!accessToken
  })

  return { data, isFetching, isLoading, isError }
}
