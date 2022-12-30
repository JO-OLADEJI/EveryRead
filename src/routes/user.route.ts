import express, { Router } from "express";
import auth from "../middlewares/auth";
import UserController from "../controllers/user.controller";

const router: Router = express.Router();

router.get("/me", auth, UserController.getSelf);
router.put("/update", auth, UserController.updateSelf);
router.delete("/delete", auth, UserController.deleteSelf);

export default router;
