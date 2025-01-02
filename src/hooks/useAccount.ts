import { AxiosError } from 'axios'
import { useQuery } from '@tanstack/react-query'

import { accountKeys } from '@/keys'
import { LOCAL_STORAGE_KEYS } from '@/utils/constants'
import { IAccountDataResponsePaginate, IErrorResponse, IPaginationParams } from '@/interfaces'

import { useChromeStorage } from './useChromeStorage'

export const useAccount = (queryParams: IPaginationParams) => {
  const { storedValue: accessToken, getValue: getAccessToken } = useChromeStorage(LOCAL_STORAGE_KEYS.accessToken)

  getAccessToken()

  const { data, isLoading, isError, isFetching, isFetched, refetch } = useQuery<
    IAccountDataResponsePaginate,
    AxiosError<IErrorResponse>
  >({
    ...accountKeys.list(queryParams as IPaginationParams),
    enabled: !!queryParams && !!accessToken
  })

  return { data, isFetching, isLoading, isFetched, isError , refetch}
}
