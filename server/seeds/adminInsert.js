import mongoose from "mongoose";
import bcrypt from "bcrypt";

async function connectDB() {
  try {
    await mongoose.connect(process.env.ENV_DB_URL);
    console.log(`DB Connected`);
  } catch (error) {
    console.log(error);
  }
}
connectDB();


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
  }
});

let adminModel = new mongoose.model("Admin", adminSchema, "admin");

async function insertAdmin() {
  try {
    let admin = {
      name: "Prash",
      password: bcrypt.hashSync("Prashanth@123", 12),
      email: "prashanth@code.in",
      role: "admin",
    };

    let adminData = new adminModel(admin);

    await adminData.save();
    console.log(`Admin Added Successfully`);
  } catch (error) {
    console.log(error);
  }
}
insertAdmin();

