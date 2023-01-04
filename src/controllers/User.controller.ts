import { Request, Response } from "express";
import { ApiErrorResponse, ApiSuccessResponse, JwtPayload } from "../types";
import User, {
  validateNewUser,
  validateUserUpdate,
  validateLogin,
} from "../models/User.model";
import { hash, comparePassword } from "../utils/hash";

class UserController {
  createAccount = async (req: Request, res: Response) => {
    const successResponse: ApiSuccessResponse = { success: true, result: "" };
    const errorResponse: ApiErrorResponse = { success: false, error: "" };

    // validate input literals
    const { error, value } = validateNewUser(req.body);
    if (error) {
      errorResponse.error = error["details"][0]["message"];
      return res.status(400).json(errorResponse);
    }

    try {
      // check if account with email exists already
      const existingUser = await User.findOneByEmail(value.email);
      if (existingUser) {
        errorResponse.error = "account with email aready exists";
        return res.status(400).json(errorResponse);
      }

      // hash password
      const hashedPassword = await hash(value.password);
      const user = new User({ ...value, password: hashedPassword });
      await user.save();

      // generate auth token for user
      const token: string = user.generateAuthToken();

      const { firstname, lastname, email } = user;
      successResponse.result = { firstname, lastname, email };
      res.status(201).header("x-auth-token", token).json(successResponse);
    } catch (err) {
      errorResponse.error = (err as any).message;
      res.status(400).json(errorResponse);
    }
  };

  login = async (req: Request, res: Response) => {
    const errorResponse: ApiErrorResponse = { success: false, error: "" };
    const successResponse: ApiSuccessResponse = { success: true, result: "" };

    // validate input literals
    const { error, value } = validateLogin(req.body);
    if (error) {
      errorResponse.error = error["details"][0]["message"];
      return res.status(400).json(errorResponse);
    }

    try {
      // check if account with email exists
      const user = await User.findOneByEmail(value.email);
      if (!user) {
        errorResponse.error = "invalid email or password";
        return res.status(400).json(errorResponse);
      }

      // check if the password matches
      const passwordDidMatch: boolean = await comparePassword(
        value.password,
        user.password
      );
      if (!passwordDidMatch) {
        errorResponse.error = "invalid email or password";
        return res.status(400).json(errorResponse);
      }

      // generate auth token for user
      const token: string = user.generateAuthToken();

      const { firstname, lastname, email } = user;
      successResponse.result = { firstname, lastname, email };
      res.status(200).header("x-auth-token", token).json(successResponse);
    } catch (err) {
      errorResponse.error = (err as any).message;
      res.status(400).json(errorResponse);
    }
  };

  getSelf = async (req: Request, res: Response) => {
    const errorResponse: ApiErrorResponse = { success: false, error: "" };
    const successResponse: ApiSuccessResponse = { success: true, result: "" };

    const payload: JwtPayload = req.headers["user"] as any as JwtPayload;

    try {
      const user = await User.findById(payload._id);
      if (!user) {
        errorResponse.error = "user not found";
        return res.status(404).json(errorResponse);
      }

      const { firstname, lastname, email } = user;
      successResponse.result = { firstname, lastname, email };
      res.status(200).json(successResponse);
    } catch (err) {
      errorResponse.error = (err as any).message;
      return res.status(400).json(errorResponse);
    }
  };

  getEmailMatch = async (req: Request, res: Response) => {};

  updateSelf = async (req: Request, res: Response) => {
    const errorResponse: ApiErrorResponse = { success: false, error: "" };
    const successResponse: ApiSuccessResponse = { success: true, result: {} };

    const payload: JwtPayload = req.headers["user"] as any as JwtPayload;

    // validate input literals
    const { error, value } = validateUserUpdate(req.body);
    if (error) {
      errorResponse.error = error["details"][0]["message"];
      return res.status(400).json(errorResponse);
    }

    try {
      // find user to update
      const user = await User.findById(payload._id);
      if (!user) {
        errorResponse.error = "user not found";
        return res.status(404).json(errorResponse);
      }

      // prepare update object
      const updateInfo = {
        firstname: value.firstname ?? user.firstname,
        lastname: value.lastname ?? user.lastname,
        password: user.password,
      };
      if (value.password) {
        const hashedPassword = await hash(value.password);
        updateInfo.password = hashedPassword;
      }

      // update user and return updated document
      const updatedUser = await User.findByIdAndUpdate(
        payload._id,
        {
          ...updateInfo,
        },
        { returnDocument: "after" }
      );
      if (updatedUser) {
        const { firstname, lastname, email } = updatedUser;
        successResponse.result = { firstname, lastname, email };
      }

      // generate new token when user changes password
      if (value.password) {
        const token: string | undefined = updatedUser?.generateAuthToken();
        res.header("x-auth-token", token);
      }
      res.status(200).json(successResponse);
    } catch (err) {
      errorResponse.error = (err as any).message;
      res.status(400).json(errorResponse);
    }
  };

  deleteSelf = async (req: Request, res: Response) => {
    const errorResponse: ApiErrorResponse = { success: false, error: "" };
    const successResponse: ApiSuccessResponse = { success: true, result: {} };

    const payload: JwtPayload = req.headers["user"] as any as JwtPayload;

    try {
      // get password in the body of request
      const password: string | undefined = req.body.password;
      if (!password) {
        errorResponse.error = "invalid password";
        return res.status(400).json(errorResponse);
      }

      // get user's stored password
      const user = await User.findById(payload._id).select("password");
      if (!user) {
        errorResponse.error = "user not found";
        return res.status(404).json(errorResponse);
      }

      // compare inputted password with user's password
      const passwordDidMatch = await comparePassword(password, user.password);
      if (!passwordDidMatch) {
        errorResponse.error = "invalid password";
        return res.status(400).json(errorResponse);
      }

      // delete user document from DB
      const deletedUser = await User.findByIdAndDelete(payload._id, {
        returnDocument: "after",
      });
      if (!deletedUser) {
        errorResponse.error = "error deleting user";
        return res.status(400).json(errorResponse);
      }

      const { firstname, lastname, email } = deletedUser;
      successResponse.result = { firstname, lastname, email };
      res.status(200).json(successResponse);
    } catch (err) {
      errorResponse.error = (err as any).message;
      res.status(400).json(errorResponse);
    }
  };
}

const userController = new UserController();
export default userController;
