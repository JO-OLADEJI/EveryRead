import jwt from "jsonwebtoken";
import { Response, Request, NextFunction } from "express";
import "dotenv/config";
import { ApiErrorResponse } from "../types";

const auth = (req: Request, res: Response, next: NextFunction) => {
  const token: string | string[] | undefined = req.headers["x-auth-token"];
  if (!token) {
    const response: ApiErrorResponse = {
      success: false,
      error: "unauthorized",
    };
    return res.status(401).json(response);
  }

  let payload: any;
  try {
    payload = jwt.verify(
      typeof token === "object" ? token[0] : token,
      process.env.JWT_SECRET ?? ""
    );
    req.headers["user"] = payload;
    next();
  } catch (error) {
    const response: ApiErrorResponse = {
      success: false,
      error: (error as any).message,
    };
    return res.status(401).json(response);
  }
};

export default auth;
