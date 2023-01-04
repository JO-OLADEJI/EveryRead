import { Router } from "express";
import UserController from "../controllers/User.controller";

const router: Router = Router();

router.route("/login").post(UserController.login);

router.route("/register").post(UserController.createAccount);

export default router;
