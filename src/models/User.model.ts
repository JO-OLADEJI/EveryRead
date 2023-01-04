import mongoose, { Document, Model, Schema } from "mongoose";
import Joi from "joi";
import jwt from "jsonwebtoken";
import "dotenv/config";

const JWT_PRIVATE_KEY: string | undefined = process.env.JWT_PRIVATE_KEY;
if (!JWT_PRIVATE_KEY) {
  throw new Error("JWT_PRIVATE_KEY .env variable not defined!");
}

interface IUser {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

interface IUserDocument extends IUser, Document {
  generateAuthToken: () => string;
}

interface IUserModel extends Model<IUserDocument> {
  findOneByEmail: (email: string) => Promise<IUserDocument>;
}

const userSchema: Schema<IUserDocument> = new Schema(
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

userSchema.methods.generateAuthToken = function (): string {
  const token = jwt.sign(
    { _id: this._id, password: this.password },
    JWT_PRIVATE_KEY
  );
  return token;
};

userSchema.statics.findOneByEmail = function (
  email: string
): Promise<IUserDocument> {
  return this.findOne({ email });
};

export const validateNewUser = (body: any) => {
  const userSchema = Joi.object({
    firstname: Joi.string().lowercase().trim().min(3).max(255).required(),
    lastname: Joi.string().lowercase().trim().min(3).max(255).required(),
    email: Joi.string().email().lowercase().trim().required(),
    password: Joi.string().min(6).required(),
    // there should be a code sent to email for validation
  });
  return userSchema.validate(body);
};

export const validateUserUpdate = (body: any) => {
  const userSchema = Joi.object({
    firstname: Joi.string().lowercase().trim().min(3).max(255).optional(),
    lastname: Joi.string().lowercase().trim().min(3).max(255).optional(),
    password: Joi.string().min(6).optional(),
  });
  return userSchema.validate(body);
};

export const validateLogin = (body: any) => {
  const loginSchema = Joi.object({
    email: Joi.string().email().lowercase().trim().required(),
    password: Joi.string().min(6).required(),
  });
  return loginSchema.validate(body);
};

const User = mongoose.model<IUserDocument, IUserModel>("users", userSchema);
export default User;
