import mongoose from "mongoose";

let adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
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
  role: {
    type: String,
    default: "admin"
  }
});

export default mongoose.model("Admin", adminSchema, "admin");