import mongoose from "mongoose";

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
        required: true,
    },
    pageCount: {
        type: Number,
        required: true,
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
    reviews: [
        {
            userMail: {
                type: String,
                required: true,
            },
            userFullName: {
                type: String,
                required: true,
            },
            reviewScore: {
                type: Number,
                required: true,
            },
            reviewText: {
                type: String,
                required: true,
            },
            date: {
                type: Date,
                default: Date.now,
            },
        },
    ],
});

export default mongoose.model("Books", bookSchema, "books");
