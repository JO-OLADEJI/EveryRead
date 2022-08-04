import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      lowercase: true,
      trime: true,
      minlength: 3,
      maxlength: 255,
    },
    lastname: {
      type: String,
      required: true,
      lowercase: true,
      trime: true,
      minlength: 3,
      maxlength: 255,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trime: true,
      unique: true,
      match:
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 10,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
