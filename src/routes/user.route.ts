import express, { Router } from "express";
import auth from "../middlewares/auth";
import UserController from "../controllers/user.controller";

const router: Router = express.Router();

router.get("/", auth, UserController.getSelf);
router.delete("/delete", auth, UserController.deleteSelf);
router.patch("/update", auth, UserController.updateSelf);

export default router;
