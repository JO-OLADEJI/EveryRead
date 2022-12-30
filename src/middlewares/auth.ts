import jwt from "jsonwebtoken";
import { Response, Request, NextFunction } from "express";
import { ApiErrorResponse, JwtPayload } from "../types";
import User from "../models/user.model";
import * as dotenv from "dotenv";
dotenv.config();

const auth = async (req: Request, res: Response, next: NextFunction) => {
  const errorResponse: ApiErrorResponse = { success: false, error: "" };

  const token: string | string[] | undefined = req.headers["x-auth-token"];
  if (!token) {
    errorResponse.error = "unauthorized";
    return res.status(401).json(errorResponse);
  }

  let payload: JwtPayload;
  try {
    payload = jwt.verify(
      typeof token === "object" ? token[0] : token,
      process.env.JWT_PRIVATE_KEY ?? ""
    ) as JwtPayload;

    // confirm that the password from token matches stored password
    const user = await User.findById(payload._id).select("password");
    if (user?.password !== payload.password) {
      errorResponse.error = "invalid / expired token";
      return res.status(401).json(errorResponse);
    }

    // add payload to header
    req.headers["user"] = payload as any;
    next();
  } catch (error) {
    errorResponse.error = (error as any).message;
    return res.status(401).json(errorResponse);
  }
};

export default auth;
