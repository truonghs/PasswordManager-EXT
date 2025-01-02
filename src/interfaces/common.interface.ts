export interface IErrorResponse {
  errorCode: string
  message: string
  status: number
}

export interface IDataResponse {
  statusCode: string
  message: string
}
export interface IPaginationParams {
  page: number
  limit: number
  keyword?: string
}