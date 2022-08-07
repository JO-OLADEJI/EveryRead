import { Request, Response } from "express";
import { ApiErrorResponse, ApiResultResponse } from "../types";
import User, { validateNewUser, validateLogin } from "../models/user.model";
import { hash, compareHash } from "../utils/hash";

class UserController {
  createAccount = async (req: Request, res: Response) => {
    const { error, value } = validateNewUser(req.body);
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

    // generate token for the user
    const token: string = user.generateAuthToken();

    await user.save();
    const response: ApiResultResponse = {
      success: true,
      result: user,
    };
    res.status(201).header("x-auth-token", token).json(response);
  };

  login = async (req: Request, res: Response) => {
    const errorResponse: ApiErrorResponse = { success: false, error: "" };
    const resultResponse: ApiResultResponse = { success: true, result: "" };

    const { error, value } = validateLogin(req.body);
    if (error) {
      errorResponse["error"] = error["details"][0]["message"];
      return res.status(400).json(errorResponse);
    }

    // check if an account with email exists
    const user = await User.findOne({ email: value.email });
    if (!user) {
      errorResponse["error"] = "invalid email or password";
      return res.status(400).json(errorResponse);
    }

    // check if the password matches
    const passwordMatch: boolean = await compareHash(value.password, user.password);
    if (!passwordMatch) {
      errorResponse["error"] = "invalid email or password";
      return res.status(400).json(errorResponse);
    }

    // generate auth token for the user
    const token: string = user.generateAuthToken();

    await user.save();
    resultResponse["result"] = user;
    res.status(200).header("x-auth-token", token).json(resultResponse);
  };

  getSelf = async (req: Request, res: Response) => {};

  updateSelf = async (req: Request, res: Response) => {};

  deleteSelf = async (req: Request, res: Response) => {};
}

const userController = new UserController();
export default userController;
