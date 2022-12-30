interface BaseResponse {
  success: boolean;
}

export interface ApiErrorResponse extends BaseResponse {
  error: Object | string;
}

export interface ApiSuccessResponse extends BaseResponse {
  result: Object | string;
}

export interface JwtPayload {
  _id: string;
  iat: number;
  password: string;
}
