import { Request, Response } from "express";
import { ObjectId } from "mongoose";
import { ApiErrorResponse, ApiSuccessResponse, JwtPayload } from "../types";
import Note, { validateNote } from "../models/Note.model";
import Excerpt, { validateExcerpt } from "../models/Excerpt.model";
import AutomateController from "./Automate.controller";

class NoteController {
  // create a new note
  createNote = async (req: Request, res: Response) => {
    const successResponse: ApiSuccessResponse = { success: true, result: "" };
    const errorResponse: ApiErrorResponse = { success: false, error: "" };

    const payload: JwtPayload = req.headers["user"] as any as JwtPayload;

    const { error, value } = validateNote(req.body);
    if (error) {
      errorResponse.error = error["details"][0]["message"];
      return res.status(400).json(errorResponse);
    }

    try {
      const note = new Note({ ...value, owner: payload._id });
      await note.save();

      const { title, subtitle } = note;
      successResponse.result = { title, subtitle };
      res.status(201).json(successResponse);
    } catch (err) {
      errorResponse.error = (err as any).message;
      res.status(400).json(errorResponse);
    }
  };

  // create an excerpt that belongs to a note
  createExcerpt = async (req: Request, res: Response) => {
    const successResponse: ApiSuccessResponse = { success: true, result: "" };
    const errorResponse: ApiErrorResponse = { success: false, error: "" };

    const { error, value } = validateExcerpt(req.body);
    if (error) {
      errorResponse.error = error["details"][0]["message"];
      return res.status(400).json(errorResponse);
    }

    try {
      const noteId: string = req.params["id"];
      const excerpt = new Excerpt({ content: value.content, note: noteId });
      await excerpt.save();

      // - append excerpt to the summary[] of note
      const note = await Note.findByIdAndUpdate(
        noteId,
        {
          $push: { summary: excerpt._id },
        },
        { returnDocument: "after" }
      );
      if (!note) {
        errorResponse.error = "note not found";
        return res.status(400).json(errorResponse);
      }

      // schedule spaced repitition intervals for excerpt
      const isScheduled: boolean = await AutomateController.scheduleSpacedReminders(excerpt._id);

      const { content } = excerpt;
      successResponse.result = { content, note: noteId };
      res.status(201).json(successResponse);
    } catch (err) {
      errorResponse.error = (err as any).message;
      res.status(400).json(errorResponse);
    }
  };

  // get a note: populate its owner and excerpts
  getNote = async (req: Request, res: Response) => {
    const successResponse: ApiSuccessResponse = { success: true, result: "" };
    const errorResponse: ApiErrorResponse = { success: false, error: "" };

    try {
      const noteId: string = req.params["id"];
      const note = await Note.findById(noteId)
        .populate({ path: "owner", select: "email" })
        .populate({ path: "summary", select: "content" });
      if (!note) {
        errorResponse.error = "note not found";
        return res.status(400).json(errorResponse);
      }

      successResponse.result = note;
      res.status(200).json(successResponse);
    } catch (err) {
      errorResponse.error = (err as any).message;
      res.status(400).json(errorResponse);
    }
  };

  // get a preview of notes owned by authenticated user
  getAllNotesPreview = async (req: Request, res: Response) => {
    const successResponse: ApiSuccessResponse = { success: true, result: "" };
    const errorResponse: ApiErrorResponse = { success: false, error: "" };

    const payload: JwtPayload = req.headers["user"] as any as JwtPayload;

    try {
      const notesPreview = await Note.find({ owner: payload._id })
        .select("title subtitle owner")
        .populate({ path: "owner", select: "email" });

      successResponse.result = notesPreview;
      res.status(200).json(successResponse);
    } catch (err) {
      errorResponse.error = (err as any).message;
      res.status(400).json(errorResponse);
    }
  };

  // update title and/or sub-title of a note
  updateNote = async (req: Request, res: Response) => {
    const successResponse: ApiSuccessResponse = { success: true, result: "" };
    const errorResponse: ApiErrorResponse = { success: false, error: "" };

    try {
      const { error, value } = validateNote(req.body);
      if (error) {
        errorResponse.error = error["details"][0]["message"];
        return res.status(400).json(errorResponse);
      }

      const noteId: string = req.params["id"];
      const note = await Note.findByIdAndUpdate(
        noteId,
        { ...value },
        { returnDocument: "after" }
      );
      if (!note) {
        errorResponse.error = "note not found";
        return res.status(400).json(errorResponse);
      }

      const { title, subtitle } = note;
      successResponse.result = { title, subtitle };
      res.status(200).json(successResponse);
    } catch (err) {
      errorResponse.error = (err as any).message;
      res.status(400).json(errorResponse);
    }
  };

  // update the content of an excerpt
  updateExcerpt = async (req: Request, res: Response) => {
    const successResponse: ApiSuccessResponse = { success: true, result: "" };
    const errorResponse: ApiErrorResponse = { success: false, error: "" };

    const { error, value } = validateExcerpt(req.body);
    if (error) {
      errorResponse.error = error["details"][0]["message"];
      return res.status(400).json(errorResponse);
    }

    try {
      const excerptId: string = req.params["id"];
      const excerpt = await Excerpt.findByIdAndUpdate(
        excerptId,
        { content: value.content },
        { returnDocument: "after" }
      );
      if (!excerpt) {
        errorResponse.error = "excerpt not found";
        return res.status(400).json(errorResponse);
      }

      // schedule spaced repitition intervals for excerpt
      const isScheduled: boolean = await AutomateController.scheduleSpacedReminders(excerpt._id);

      const { content, note } = excerpt;
      successResponse.result = { content, note };
      res.status(200).json(successResponse);
    } catch (err) {
      errorResponse.error = (err as any).message;
      res.status(400).json(errorResponse);
    }
  };

  // delete a note and all it's excertps
  deleteNote = async (req: Request, res: Response) => {
    const successResponse: ApiSuccessResponse = { success: true, result: "" };
    const errorResponse: ApiErrorResponse = { success: false, error: "" };

    try {
      const noteId: string = req.params["id"];

      // - delete note excerpts
      const note = await Note.findById(noteId);
      if (!note) {
        errorResponse.error = "note not found";
        return res.status(400).json(errorResponse);
      }
      const excerptsDeleteResult = await Note.deleteMany({
        _id: { $in: note.summary },
      });
      if (note.summary.length !== excerptsDeleteResult.deletedCount) {
        errorResponse.error = "error deleting note excerpts";
        return res.status(400).json(errorResponse);
      }

      // - delete note itself
      const deletedNote = await Note.findByIdAndDelete(note._id, {
        returnDocument: "after",
      });
      if (!deletedNote) {
        errorResponse.error = "note not found";
        return res.status(400).json(errorResponse);
      }

      const { title, subtitle, owner } = deletedNote;
      successResponse.result = { title, subtitle, owner };
      res.status(200).json(successResponse);
    } catch (err) {
      errorResponse.error = (err as any).message;
      res.status(400).json(errorResponse);
    }
  };

  // delete the excerpt and remove it from the summary[] of note
  deleteExcerpt = async (req: Request, res: Response) => {
    const successResponse: ApiSuccessResponse = { success: true, result: "" };
    const errorResponse: ApiErrorResponse = { success: false, error: "" };

    try {
      const excerptId: string = req.params["id"];
      const excerpt = await Excerpt.findById(excerptId);
      if (!excerpt) {
        errorResponse.error = "excerpt not found";
        return res.status(400).json(errorResponse);
      }

      // - remove excerpt from summary[] of note
      const impactedNote = await Note.findByIdAndUpdate(
        excerpt.note,
        {
          $pull: { summary: excerptId },
        },
        { returnDocument: "after" }
      );
      if (!impactedNote) {
        errorResponse.error = "note not found";
        return res.status(400).json(errorResponse);
      }
      if (impactedNote.summary.includes(excerptId as any as ObjectId)) {
        errorResponse.error = "error deleting excerpt";
        return res.status(400).json(errorResponse);
      }

      // - delete excerpt iteself
      const deletedExcerpt = await Excerpt.findByIdAndDelete(excerptId, {
        returnDocument: "after",
      });
      if (!deletedExcerpt) {
        errorResponse.error = "excerpt not found";
        return res.status(400).json(errorResponse);
      }

      const { content, note } = deletedExcerpt;
      successResponse.result = { content, note };
      res.status(200).json(successResponse);
    } catch (err) {
      errorResponse.error = (err as any).message;
      res.status(400).json(errorResponse);
    }
  };
}

const noteController = new NoteController();
export default noteController;
