import mongoose, { Document, Model, Schema, ObjectId } from "mongoose";
import Joi from "joi";

interface IExcerpt {
  content: string;
  note: ObjectId; // ID for note excerpt is part of
}

interface IExcerptDocument extends IExcerpt, Document {}

interface IExcerptModel extends Model<IExcerptDocument> {}

const excerptSchema: Schema<IExcerptDocument> = new Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    note: {
      type: Schema.Types.ObjectId,
      ref: "notes",
    },
  },
  { timestamps: true }
);

export const validateExcerpt = (body: any) => {
  const excerptSchema = Joi.object({
    content: Joi.string().trim().min(3).required(),
  });
  return excerptSchema.validate(body);
};

const Excerpt = mongoose.model<IExcerptDocument, IExcerptModel>(
  "excerpts",
  excerptSchema
);
export default Excerpt;
