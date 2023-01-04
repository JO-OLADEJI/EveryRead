import mongoose, { Document, Model, Schema, ObjectId } from "mongoose";
import Joi from "joi";

export interface INote {
  title: string;
  subtitle: string;
  owner: ObjectId; // user ID of owner
  summary: Array<ObjectId>; // array of excerpts IDs
}

interface INoteDocument extends INote, Document {}

interface INoteModel extends Model<INoteDocument> {}

const noteSchema: Schema<INoteDocument> = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 255,
    },
    subtitle: {
      type: String,
      required: false,
      trim: true,
      minlength: 3,
      maxlength: 255,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    summary: [
      {
        type: Schema.Types.ObjectId,
        ref: "excerpts",
      },
    ],
  },
  { timestamps: true }
);

export const validateNote = (body: any) => {
  const noteSchema = Joi.object({
    title: Joi.string().trim().min(3).max(255).required(),
    subtitle: Joi.string().trim().min(3).max(255).optional(),
  });
  return noteSchema.validate(body);
};

const Note = mongoose.model<INoteDocument, INoteModel>("notes", noteSchema);
export default Note;
