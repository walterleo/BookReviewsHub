import mongoose from "mongoose";

let userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    maxlength: 25,
    minlength: 2,
    required: true
  },
  lastname: {
    type: String,
    maxlength: 25,
    minlength: 2,
    required: true
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  userverified: {
    type: Boolean,
    default: false
  },
  userverifytoken: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: "user"
  }
});

export default mongoose.model("Users", userSchema, "users");