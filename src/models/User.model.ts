import mongoose from "mongoose";
import Joi from "joi";

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 255,
    },
    lastname: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 255,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      match:
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
  },
  { timestamps: true }
);

export const validateUser = (body: any) => {
  const userSchema = Joi.object({
    firstname: Joi.string().lowercase().trim().min(3).max(255).required(),
    lastname: Joi.string().lowercase().trim().min(3).max(255).required(),
    email: Joi.string().email().lowercase().trim().required(),
    password: Joi.string().min(6).required()
  });
  return userSchema.validate(body);
}

const User = mongoose.model("User", userSchema);
export default User;
