import mongoose from "mongoose";
import Books from "./config/books.js"

async function connectDB() {
    try {
        await mongoose.connect(process.env.ENV_DB_URL);
        console.log(`DB Connected`);
    } catch (error) {
        console.log(error);
    }
}
connectDB();


let bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    coverImageUrl: {
        type: String,
        required: true,
    },
    id: {
        type: String,
        unique: true,
        required: true
    },
    pageCount: {
        type: Number,
        required: true
    },
    publisher: {
        type: String,
        required: true,
    },
    synopsis: {
        type: String,
        required: true,
    },
    createdById: {
        type: String,
        required: false,
    },
});

let Book = new mongoose.model("Book", bookSchema, "book");

async function insertBook() {
    try {
        await Book.insertMany(Books)
        console.log(`Books Added Successfully`);
    } catch (error) {
        console.log(error);
    }
}
insertBook();

