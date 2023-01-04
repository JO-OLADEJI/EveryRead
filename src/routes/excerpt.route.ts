import { Router } from "express";
import auth from "../middlewares/auth";
import NoteController from "../controllers/Note.controller";

const router: Router = Router();

router
  .route("/:id")
  .patch(auth, NoteController.updateExcerpt)
  .delete(auth, NoteController.deleteExcerpt);

export default router;
