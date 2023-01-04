import { Router } from "express";
import auth from "../middlewares/auth";
import NoteController from "../controllers/Note.controller";

const router: Router = Router();

router
  .route("/")
  .get(auth, NoteController.getAllNotesPreview)
  .post(auth, NoteController.createNote);

router
  .route("/:id")
  .get(auth, NoteController.getNote)
  .post(auth, NoteController.createExcerpt)
  .patch(auth, NoteController.updateNote)
  .delete(auth, NoteController.deleteNote);

export default router;
