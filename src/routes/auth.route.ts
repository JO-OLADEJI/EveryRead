import express, { Router, Request, Response } from "express";
import auth from "middlewares/auth";
import UserController from "controllers/User.controller";

const router: Router = express.Router();

router.post("/login", UserController.login);
router.post("/register", UserController.createAccount);

export default router;
