import { Request, Response } from "express";
import { ApiErrorResponse, ApiResultResponse } from "types";

class UserController {
  createAccount = async (req: Request, res: Response) => {};

  login = async (req: Request, res: Response) => {};

  getSelf = async (req: Request, res: Response, payload: any) => {};

  updateSelf = async (req: Request, res: Response, payload: any) => {};

  deleteSelf = async (req: Request, res: Response, payload: any) => {};
}

const userController = new UserController();
export default userController;
