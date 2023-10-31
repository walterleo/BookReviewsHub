import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import NavBar from "./NavBar";
import ReviewStar from "./ReviewStar";
import { useGlobalDataVariables } from "../utils/GlobalVariables";

function BookViewAdmin() {
  const serverApiBaseUrl = process.env.REACT_APP_SERVER_API_URL;
  const { bookId } = useParams();
  const navigate = useNavigate();
  const {setUserGlobalLoggedStatus, setUserGlobalRole} = useGlobalDataVariables();
  /* const { userGlobalLoggedStatus, setUserGlobalLoggedStatus, userGlobalRole, setUserGlobalRole, userGlobalLocation } = useGlobalDataVariables(); */
  const [book, setBook] = useState(null);
  const [bookNotFound, setBookNotFound] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBook, setEditedBook] = useState({});

  useEffect(() => {

    const logout = () => {
      removeLocalStorage();
      window.location.href = "/";
    };

    const removeLocalStorage = () => {
      localStorage.removeItem("token");
      localStorage.setItem("loggedUserStatus", false);
      localStorage.removeItem("loggedUserFirstName");
      localStorage.removeItem("loggedUserLastName");
      localStorage.removeItem("loggedUserEmail");
      setUserGlobalLoggedStatus(false);
      setUserGlobalRole();
    };

    async function verifyAuth() {
      try {
        const { data } = await axios.get(`${serverApiBaseUrl}/api/auth`, {
          headers: {
            "x-auth-token": JSON.parse(localStorage.getItem("token")).token,
          },
        });
        if (data.role !== "admin") {
          logout();
        } else {
          fetchBookDetails();
        }
      } catch (error) {
        logout();
      }
    }

    async function fetchBookDetails() {
      try {
        const bookResponse = await axios.get(`${serverApiBaseUrl}/api/admin/book/view/${bookId}`, {
          headers: {
            "x-auth-token": JSON.parse(localStorage.getItem("token")).token,
          },
        });

        if (bookResponse.status === 404) {
          // Handle the case where the book doesn't exist
          setBookNotFound(true);
        } else {
          // Set the book details in the state
          setBook(bookResponse.data.book);
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          if (error.response.data.code === "BOOK_NOT_FOUND") {
            // Handle the case where the book doesn't exist
            setBookNotFound(true);
          }
        } else {
          console.error("Error fetching book details: ", error);
        }
      }
    }

    verifyAuth();
  }, [serverApiBaseUrl, setUserGlobalLoggedStatus, setUserGlobalRole, bookId]);

  const handleDeleteBook = async () => {
    // Ask the user for confirmation before deleting the book
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this book?"
    );
    if (!isConfirmed) {
      // User canceled the action, do nothing
      return;
    }

    try {
      await axios.delete(`${serverApiBaseUrl}/api/admin/book/delete/${bookId}`, {
        headers: {
          "x-auth-token": JSON.parse(localStorage.getItem("token")).token,
        },
      });
      // Provide feedback to the user, e.g., show a success message.
      alert("Book deleted successfully");
      // Optionally, you can navigate to a different page, e.g., back to the admin dashboard.
      navigate("/admin");
    } catch (error) {
      console.error("Error deleting book: ", error);
      // Handle errors, e.g., show an error message.
      alert("Error deleting the book");
    }
  };

  const handleEditBookMode = () => {
    // Toggle to the editing mode
    setIsEditing(true);
    // Set the editedBook state with the current book data
    setEditedBook(book);
  };

  const handleSaveEdits = async () => {
    // Send a PUT request to update the book with editedBook data
    try {
      await axios.put(`${serverApiBaseUrl}/api/admin/book/update/${bookId}`, editedBook, {
        headers: {
          "x-auth-token": JSON.parse(localStorage.getItem("token")).token,
        },
      });
      // Toggle back to view mode after saving edits
      setIsEditing(false);
      // Optionally, you can update the view with the new book data from the server
      // Fetch the book details again here and update the state
      setBook(editedBook);

      alert("Book updated successfully");
    } catch (error) {
      console.error("Error updating book: ", error);
      // Handle errors, e.g., show an error message.
      alert("Error updating the book");
    }
  };

  const handleCancelEdits = () => {
    // Toggle back to view mode without saving edits
    setIsEditing(false);
  };

  // Calculate the average review score
  const averageReviewScore =
    book && book.reviews && book.reviews.length > 0
      ? (
          book.reviews.reduce((sum, review) => sum + review.reviewScore, 0) /
          book.reviews.length
        ).toFixed(2)
      : "N/A";

  const averageReviewScorePercentCss = () => {
    var totalMaxScore = 5;
    var averageReviewScoreValue = averageReviewScore;
    var averageReviewScorePercent = (averageReviewScoreValue*100)/totalMaxScore;
    var averageReviewScorePercentCss = book && book.reviews && book.reviews.length > 0 ?
      ('linear-gradient( to right, var(--colors-review-stars), var(--colors-review-stars) ' + averageReviewScorePercent.toString() + '%, var(--colors-oxford-blue) 0% )') 
      : 
      ('linear-gradient( to right, var(--colors-review-stars), var(--colors-review-stars) 0%, var(--colors-oxford-blue) 0% )');
    ;
    return averageReviewScorePercentCss;
  };

  return (
    <>
      <Header/>
      <ReviewStar/>
      <div id="mainContents">
        <div className="main main--boks-view">
          <h2  className="component__section-title">Admin Dashboard</h2>
          {bookNotFound ? (
            <div>
              <h2>Book Not Found</h2>
              <p>The book you are looking for doesn't exist.</p>
              <div className="component__buttons-container component__buttons-container--horizontal book__item-buttons-wrapper">
                <button className="component__button" onClick={() => navigate("/admin")}>
                  Go Back to Admin Page
                </button>
              </div>
            </div>
          ) : !book ? (
            <div>Loading...</div>
          ) : isEditing ? (
            // Edit mode
            <div className="book__create-edit-form-wrapper">
              <h2 className="book__item-title">{book.title}</h2>
              <h2>Edit Book</h2>
              <div>
                <label>Title:</label>
                <input
                  type="text"
                  name="title"
                  value={editedBook.title}
                  onChange={(e) =>
                    setEditedBook({ ...editedBook, title: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label>Author:</label>
                <input
                  type="text"
                  name="author"
                  value={editedBook.author}
                  onChange={(e) =>
                    setEditedBook({ ...editedBook, author: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label>Publisher:</label>
                <input
                  type="text"
                  name="publisher"
                  value={editedBook.publisher}
                  onChange={(e) =>
                    setEditedBook({ ...editedBook, publisher: e.target.value })
                  }
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
                  value={editedBook.coverImageUrl}
                  onChange={(e) =>
                    setEditedBook({
                      ...editedBook,
                      coverImageUrl: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <label>Synopsis:</label>
                <input
                  type="text"
                  name="synopsis"
                  value={editedBook.synopsis}
                  onChange={(e) =>
                    setEditedBook({ ...editedBook, synopsis: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label>Page Count:</label>
                <input
                  type="number"
                  name="pageCount"
                  value={editedBook.pageCount}
                  onChange={(e) =>
                    setEditedBook({ ...editedBook, pageCount: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label>Book ISBN/UID:</label>
                <input
                  type="text"
                  name="id"
                  value={editedBook.id}
                  onChange={(e) =>
                    setEditedBook({ ...editedBook, id: e.target.value })
                  }
                  required
                />
              </div>
              <div className="component__buttons-container component__buttons-container--horizontal book__item-buttons-wrapper">
                <button className="component__button" onClick={handleSaveEdits}>Save Edits</button>
                <button className="component__button component__button--warning" onClick={handleCancelEdits}>Cancel</button>
              </div>
            </div>
          ) : (
            // View mode
            <div className="book__item-main-wrapper"> 
              <h2 className="book__item-title">{book.title}</h2>
              <img className="book__item-image" src={book.coverImageUrl} alt="Book cover" width="300px" />
              <ul className="book__item-info">
                <li><strong>Author</strong>: {book.author}</li>
                <li><strong>Publisher</strong>: {book.publisher}</li>
                <li><strong>Page Count</strong>: {book.pageCount}</li>
                <li><strong>Synopsis</strong>: {book.synopsis}</li>
                <li>
                  <div className="book__item-reviews-average-wrapper">
                      <div className="book__item-reviews-average-title">Average Reviews</div>
                      <div className="book__item-reviews-average-star" style={{ background: averageReviewScorePercentCss() }}>
                      <div className="book__item-reviews-average-number">{averageReviewScore}</div>
                    </div>                  
                  </div>
                </li>
              </ul>
              {/* <p><strong>Average Reviews</strong>: {averageReviewScore}</p> */}   
              <div className="component__buttons-container component__buttons-container--horizontal book__item-buttons-wrapper">
                <button className="component__button" onClick={handleEditBookMode}>Edit Book</button>
                <button className="component__button component__button--warning" onClick={handleDeleteBook}>Delete Book</button>
              </div>
              {book.reviews.length > 0 ? (
                <div className="book__item-reviews-wrapper">
                  <h2>Reviews (Newest to Oldest):</h2>
                  {book.reviews
                    .slice() // Create a copy to avoid modifying the original array
                    .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date, newer to older
                    .map((review, index) => (
                      <ul className="book__item-reviews-item" key={index}> 
                        <li><strong>User</strong>: {review.userFullName}</li>
                        <li><strong>Date</strong>: {new Date(review.date).toDateString()}</li>
                        {/* <li><strong>Review score</strong>: {review.reviewScore}</li> */}
                        <li><strong>Review</strong>: {review.reviewText}</li>     
                        <li>
                          <div className={`book__item-reviews-item-total-score-wrapper book__item-reviews-item-total-score-wrapper--${review.reviewScore}`}>
                            <div className="book__item-reviews-item-total-score-title"><strong>Review score</strong>:</div>
                            <div className="book__item-reviews-average-stars-wrapper">
                              <div className="book__item-reviews-average-star book__item-reviews-average-star--item"></div>
                              <div className="book__item-reviews-average-star book__item-reviews-average-star--item"></div>
                              <div className="book__item-reviews-average-star book__item-reviews-average-star--item"></div>
                              <div className="book__item-reviews-average-star book__item-reviews-average-star--item"></div>
                              <div className="book__item-reviews-average-star book__item-reviews-average-star--item"></div>
                            </div>
                          </div>
                        </li>                        
                      </ul>                      
                    ))}
                </div>
              ) : (
                <p>No reviews available for this book.</p>
              )}
            </div>
          )}
        </div>
        <NavBar />
      </div>
      <Footer/>
    </>
  );
}

export default BookViewAdmin;
