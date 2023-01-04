import express, { Router } from "express";
import auth from "../middlewares/auth";
import UserController from "../controllers/User.controller";

const router: Router = express.Router();

router
  .route("/")
  .get(auth, UserController.getSelf)
  .patch(auth, UserController.updateSelf)
  .delete(auth, UserController.deleteSelf);

export default router;
