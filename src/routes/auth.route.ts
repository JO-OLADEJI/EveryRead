import express, { Router } from "express";
import UserController from "../controllers/user.controller";

const router: Router = express.Router();

router.post("/login", UserController.login);
router.post("/register", UserController.createAccount);

export default router;
