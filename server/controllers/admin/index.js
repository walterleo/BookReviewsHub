import express from "express";
import mongoose from "mongoose"
import adminAuth from "../../middlewares/auth/adminAuth.js";
import { addBookValidations, errorMiddleware } from "../../middlewares/validations/index.js";
import Book from "../../models/Book/index.js";
import User from "../../models/User/index.js"
let route = express.Router();


/*
    API --> /api/admin/book
    Method --> POST
    Route Type --> Private
    Description --> Add a Book
*/
route.post("/book/add", adminAuth, addBookValidations(), errorMiddleware, async (req, res) => {
    try {
        let adminData = await User.findById(req.payload._id);

        if (!adminData) return res.status(400).json({ error: "Unauthorized access. Invalid credentials" });

        if (adminData.role !== "admin") {
            return res.status(403).json({ error: "Access denied. Unauthorized access." });
        }

        let bookData = await Book.findOne({ id: req.body.id });

        if (bookData) return res.status(400).json({ error: "Book with the same ID already exists !" });

        let book = new Book({
            title: req.body.title,
            author: req.body.author,
            coverImageUrl: req.body.coverImageUrl,
            id: req.body.id,
            pageCount: req.body.pageCount,
            publisher: req.body.publisher,
            synopsis: req.body.synopsis,
            createdById: req.payload._id,
        });

        await book.save();

        // After saving the book, send the book data in the response
        res.status(200).json({ msg: "Book added successfully", book: book });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});


/*
    API --> /api/admin/book/:book_id
    Method --> PUT
    Route Type --> Private
    Description --> Edit a Book
*/
route.put("/book/update/:book_id", adminAuth, addBookValidations(), errorMiddleware, async (req, res) => {
    try {

        let adminData = await User.findById(req.payload._id);
       
        if (!adminData) return res.status(400).json({ error: "Unauthorized access. Invalid credentials" });

        if (adminData.role !== "admin") {
            return res.status(403).json({ error: "Access denied. Unauthorized access." });
        }

        let _id = mongoose.Types.ObjectId.isValid(req.params.book_id)

        // Checking if book exists
        if (!_id) return res.status(404).json({ error: `Invalid Book ID!` });
        let bookData = await Book.findById(req.params.book_id);

        let book = req.body;
        book._id = req.params.book_id;

        await Book.findByIdAndUpdate(req.params.book_id, book);
        res.status(200).json({ msg: "Book edited successfully" });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});


/*
    API --> /api/admin/book/:book_id
    Method --> DELETE
    Route Type --> Private
    Description --> Delete a Book
*/
route.delete("/book/delete/:book_id", adminAuth, async (req, res) => {
    try {       

        let _id = mongoose.Types.ObjectId.isValid(req.params.book_id)

        // Checking if Student exists
        if (!_id) return res.status(404).json({ error: `Invalid Book ID!` });

        let bookData = await Book.findById(req.params.book_id);
        if (!bookData) return res.status(400).json({ error: "Book doesn't exist !" });

        await Book.findByIdAndRemove(req.params.book_id);

        // let book = req.body;
        // book._id = req.params.book_id;
        // bookData = book
        // await bookData.save();
        res.status(200).json({ msg: "Book deleted successfully" });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});


/*
    API End Point : /api/admin/book/:book_id
    Method : GET
    Access Type : Private
    Validations:
    Valid book ID
    Description: Fetch a specific book with an ID
*/
route.get("/book/view/:book_id", async (req, res) => {
    try {

        /* let adminData = await User.findById(req.payload._id);
       
        if (!adminData) return res.status(400).json({ error: "Unauthorized access. Invalid credentials" }); */

        let _id = mongoose.Types.ObjectId.isValid(req.params.book_id)

        // Checking if book exists
        if (!_id) return res.status(404).json({ code: "BOOK_NOT_FOUND", error: "Invalid Book ID!" });

        let book = await Book.findById(req.params.book_id);
        if (!book) return res.status(404).json({ code: "BOOK_NOT_FOUND", error: "Book doesn't exist!" });

        res.status(200).json({ book });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


/*
    API End Point : /api/admin/books
    Method : GET
    Access Type : Private
    Description: Fetch all books created by a specific admin user
*/
route.get("/books/created", adminAuth, async (req, res) => {
    try {

        let adminData = await User.findById(req.payload._id);

        if (!adminData) return res.status(400).json({ error: "Unauthorized access. Invalid credentials" });

        if (adminData.role !== "admin") {
            return res.status(403).json({ error: "Access denied. Unauthorized access." });
        }

        const userBooks = await Book.find({ createdById: req.payload._id });
  
        res.status(200).json(userBooks);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});


/*
    API End Point : /api/admin/book/:bookId/review/add
    Method : GET
    Access Type : Private
    Description: Add a new review for a specific book
*/
route.put("/book/:bookId/review/add", adminAuth, async (req, res) => {

    const { bookId } = req.params;
    const { userFullName, userMail, reviewScore, reviewText } = req.body;
  
    try {

      let adminData = await User.findById(req.payload._id);

      if (!adminData) return res.status(400).json({ error: "Unauthorized access. Invalid credentials" });

      if (adminData.role !== "admin" && adminData.role !== "user") {
          return res.status(403).json({ error: "Access denied. Unauthorized access." });
      }

      // Find the book by bookId
      const book = await Book.findById(bookId);

      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }
  
      // Check if the user has already reviewed the book
      const existingReviewIndex = book.reviews.findIndex(
        (review) => review.userMail === userMail
      );
  
      if (existingReviewIndex !== -1) {
        // User has already reviewed the book; return an error or inform the user
        return res.status(400).json({ error: "You have already reviewed this book." });
      }
  
      // If the user hasn't reviewed the book, add the new review
      const newReview = {
        userFullName,
        userMail,
        reviewScore,
        reviewText,
        date: new Date().toISOString(),
      };
  
      book.reviews.push(newReview);
      await book.save();
  
      return res.status(200).json({ message: "Review added successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  

/*
    API End Point : /api/admin/book/:bookId/review/edit
    Method : GET
    Access Type : Private
    Description: Edit an existing review for a specific book, based on the user email
*/
route.put("/book/:book_id/review/edit", adminAuth, async (req, res) => {
    try {

      let adminData = await User.findById(req.payload._id);

      if (!adminData) return res.status(400).json({ error: "Unauthorized access. Invalid credentials" });

      if (adminData.role !== "admin" && adminData.role !== "user") {
          return res.status(403).json({ error: "Access denied. Unauthorized access." });
      }

      const bookId = req.params.book_id;
      const userMail = req.body.userMail;
  
      // Find the book by bookId
      let book = await Book.findById(bookId);
  
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }
  
      // Find the index of the review to edit using the user's email
      const reviewIndex = book.reviews.findIndex((review) => review.userMail === userMail);
  
      if (reviewIndex === -1) {
        return res.status(404).json({ error: "Review not found" });
      }
  
      // Update the review content with the new review text
      book.reviews[reviewIndex].reviewText = req.body.reviewText;
      book.reviews[reviewIndex].reviewScore = req.body.reviewScore;
  
      // Save the updated book with the edited review
      await book.save();
  
      res.status(200).json({ msg: "Review edited successfully", book });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });


/*
    API End Point : /api/admin/book/:bookId/review/edit
    Method : GET
    Access Type : Private
    Description: Delete an existing review for a specific book, based on the user email
*/
route.delete("/book/:book_id/review/delete", adminAuth, async (req, res) => {
  try {

    let adminData = await User.findById(req.payload._id);

    if (!adminData) return res.status(400).json({ error: "Unauthorized access. Invalid credentials" });

    if (adminData.role !== "admin" && adminData.role !== "user") {
        return res.status(403).json({ error: "Access denied. Unauthorized access." });
    }

    const bookId = req.params.book_id;
    const userMail = req.body.userEmail;

    // Find the book by bookId
    let book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    // Find the index of the review to delete using the user's email
    const reviewIndex = book.reviews.findIndex((review) => review.userMail === userMail);

    if (reviewIndex === -1) {
      return res.status(404).json({ error: "Review not found" });
    }

    // Remove the review from the array
    book.reviews.splice(reviewIndex, 1);

    // Save the updated book with the review deleted
    await book.save();

    res.status(200).json({ msg: "Review deleted successfully", book });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});


/*
    API End Point : /api/admin/books
    Method : GET
    Access Type : Private
    Description: Fetch all books
*/
route.get("/books", async (req, res) => {
    try {
        let books = await Book.find({});
        setTimeout(()=>{
            res.status(200).json(books);
        },4000);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default route;