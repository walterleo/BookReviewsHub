import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

async function connectDB() {
  try {

    await mongoose.connect(process.env.ENV_DB_URL);
    console.log(`DB Connected`);
  } catch (error) {
    console.log(error);
  }
}
connectDB();
