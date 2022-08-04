interface BaseResponse {
  success: boolean
}

export interface ApiErrorResponse extends BaseResponse {
  error: Object | string
}

export interface ApiResultResponse extends BaseResponse {
  result: Object | string
}
