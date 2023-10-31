import React, { useState } from "react";
import axios from "axios";

function AddBookForm({ onBookAdded, onBookAddCancel }) {
  const serverApiBaseUrl = process.env.REACT_APP_SERVER_API_URL;
  const [bookData, setBookData] = useState({
    title: "",
    author: "",
    publisher: "",
    coverImageUrl: "",
    synopsis: "",
    pageCount: "",
    id: "",
  });

  const { title, author, publisher, coverImageUrl, synopsis, pageCount, id } = bookData;

  const handleChange = (e) => {
    setBookData({
      ...bookData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Send a POST request to add the book to the server
      const { data } = await axios.post(`${serverApiBaseUrl}/api/admin/book/add`, bookData, {
        headers: {
          "x-auth-token": JSON.parse(localStorage.getItem("token")).token
        },
      });

      // Clear the form fields
      setBookData({
        title: "",
        author: "",
        publisher: "",
        coverImageUrl: "",
        synopsis: "",
        pageCount: "",
        id: "",
      });

      // Notify the parent component (AdminDashboard) that a book was added
      onBookAdded(data);

      // Optionally, show a success message or perform other actions
    } catch (error) {
      // Handle errors, e.g., show an error message
      console.error("Error adding book: ", error);
    }
  };

  const handleAddBookCancel = () => {
    onBookAddCancel();
  };

  return (
    <div className="book__create-edit-form-wrapper">
      <h2>Add a New Book</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label>
          <input
            type="text"
            name="title"
            value={title}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Author:</label>
          <input
            type="text"
            name="author"
            value={author}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Publisher:</label>
          <input
            type="text"
            name="publisher"
            value={publisher}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Cover Image Url:</label>
          <div className="book__create-edit-form-helper-text">
            Must be a valid url address like: <span>https://images-na.ssl-images-amazon.com/images/I/51r6XIPWmoL._SX331_BO1,204,203,200_.jpg</span>
          </div>
          <input
            type="text"
            name="coverImageUrl"
            value={coverImageUrl}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Synopsis:</label>
          <input
            type="text"
            name="synopsis"
            value={synopsis}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Page Count:</label>
          <input
            type="number"
            name="pageCount"
            value={pageCount}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Book ISBN/UID:</label>
          <input
            type="text"
            name="id"
            value={id}
            onChange={handleChange}
            required
          />
        </div>
        <div className="component__buttons-container component__buttons-container--horizontal book__item-buttons-wrapper">
          <button className="component__button" type="submit">Add Book</button>
          <button className="component__button component__button--warning" onClick={handleAddBookCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default AddBookForm;
