import { Request, Response } from "express";
import { ApiErrorResponse, ApiResultResponse } from "../types";
import User, { validateUser } from "../models/user.model";
import { hash } from "../utils/hash";

class UserController {
  createAccount = async (req: Request, res: Response) => {
    const { error, value } = validateUser(req.body);
    if (error) {
      const response: ApiErrorResponse = {
        success: false,
        error: error["details"][0]["message"],
      };
      return res.status(400).json(response);
    }

    // hash the password here
    const hashedPassword = await hash(value.password);
    const user = new User({ ...value, password: hashedPassword });
    // await user.save();
    const response: ApiResultResponse = {
      success: true,
      result: user,
    };
    res.status(201).json(response);
  };

  login = async (req: Request, res: Response) => {
    res.send("login route");
  };

  getSelf = async (req: Request, res: Response) => {};

  updateSelf = async (req: Request, res: Response) => {};

  deleteSelf = async (req: Request, res: Response) => {};
}

const userController = new UserController();
export default userController;
