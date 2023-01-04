import { ObjectId } from "mongoose";

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
  _id: ObjectId | string;
  iat: number;
  password: string;
}
