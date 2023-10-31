import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import NavBar from "./NavBar";
import ReviewStar from "./ReviewStar";
import { useGlobalDataVariables } from "../utils/GlobalVariables";

function BookViewPublic() {
  const serverApiBaseUrl = process.env.REACT_APP_SERVER_API_URL;
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { userGlobalLoggedStatus, setUserGlobalLoggedStatus, setUserGlobalRole} = useGlobalDataVariables();
  /* const { userGlobalLoggedStatus, setUserGlobalLoggedStatus, userGlobalRole, setUserGlobalRole, userGlobalLocation } = useGlobalDataVariables(); */
  const [book, setBook] = useState(null);
  const [bookNotFound, setBookNotFound] = useState(false);
  const [isCreatingEditing, setIsCreatingEditing] = useState(false);
  const [userHasReview, setUserHasReview] = useState(false);
  const [addEditReviewTitle, setAddEditReviewTitle] = useState(null);
  const reviewScores = [1, 2, 3, 4, 5]; 
  const [userDataReviewText, setUserDataReviewText] = useState("");
  const [userDataReviewScore, setUserDataReviewScore] = useState(0);

  useEffect(() => {

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
        const token = localStorage.getItem("token");
        if (token) {
          const { data } = await axios.get(`${serverApiBaseUrl}/api/auth`, {
            headers: {
              "x-auth-token": JSON.parse(localStorage.getItem("token")).token,
            },
          });
          if (data.role !== "admin") {
            fetchBookDetails();
          } else {
            fetchBookDetails();
          }
        } else {
          fetchBookDetails();
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          if (error.response.data.code === "INVALID_TOKEN") {
            // Handle the case where the token is invalid or has expired            
            removeLocalStorage();
          }
        } else {
          console.error("Authentication error:", error);
          removeLocalStorage();
        }
      }
    }

    async function fetchBookDetails() {
      try {
        const bookResponse = await axios.get(`${serverApiBaseUrl}/api/admin/book/view/${bookId}`);

        if (bookResponse.status === 404) {
          // Handle the case where the book doesn't exist
          setBookNotFound(true);
        } else {
          // Set the book details in the state
          setBook(bookResponse.data.book);

          // Checks if the user has an review on the current loaded book
          const userCurrentBookReviewData = bookResponse.data.book.reviews.find(
            (review) => review.userMail === localStorage.getItem("loggedUserEmail")
          );      
          if (userCurrentBookReviewData) {     
            setUserHasReview(true);
          }

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
  }, [serverApiBaseUrl, setUserGlobalLoggedStatus, setUserGlobalRole, bookId, navigate]);
  
  const handleReviewAddExecute = async () => {
    // Check if the user has provided a review
    if (userDataReviewText.trim() === "") {
      alert("Please enter your review.");
      return;
    }

    if (userDataReviewScore === 0) {
      alert("Please enter your score.");
      return;
    }

    try {
      // Send a POST request to add the review
      await axios.put(
        `${serverApiBaseUrl}/api/admin/book/${bookId}/review/add`,
        {
          userFullName: localStorage.getItem("loggedUserFirstName") + " " + localStorage.getItem("loggedUserLastName"),
          userMail: localStorage.getItem("loggedUserEmail"),
          reviewScore: userDataReviewScore,
          reviewText: userDataReviewText,
        },
        {
          headers: {
            "x-auth-token": JSON.parse(localStorage.getItem("token")).token,
          },
        }
      );      
      
      // Clear the user's review inputs field
      setUserDataReviewText("");            
      setUserDataReviewScore(0);            

      alert("Review added successfully");

      setIsCreatingEditing(false);

      // Reload book data
      handleReloadBookData();

    } catch (error) {
      console.error("Error adding review: ", error);
      // Handle errors, e.g., show an error message.
      alert("Error adding the review");
    }
  };

  const handleReloadBookData = async () => {
    try {
      const updatedBookResponse = await axios.get(
        `${serverApiBaseUrl}/api/admin/book/view/${bookId}`
      );
      setBook(updatedBookResponse.data.book);

      // Checks if the user has an review on the current loaded book
      const userCurrentBookReviewData = updatedBookResponse.data.book.reviews.find(
        (review) => review.userMail === localStorage.getItem("loggedUserEmail")
      );      

      if (userCurrentBookReviewData) {
        setUserHasReview(true);
      } else {
        setUserHasReview(false);
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
  };

  const handleReviewEditMode = () => {
    // Find the user's review to edit

    setAddEditReviewTitle("Edit review")

    const userReviewToEdit = book.reviews.find(
      (review) => review.userMail === localStorage.getItem("loggedUserEmail")
    );

    if (userReviewToEdit) {
      // Populate the editedReview state with the existing review content
      setUserDataReviewText(userReviewToEdit.reviewText);
      setUserDataReviewScore(userReviewToEdit.reviewScore);

      setIsCreatingEditing(true);
    }
  };

  const handleReviewEditSaveExecute = async () => {
    try {
      // Send a PUT request to edit the review
      await axios.put(
        `${serverApiBaseUrl}/api/admin/book/${bookId}/review/edit`,
        {
          userMail: localStorage.getItem("loggedUserEmail"), // Include the user's email
          reviewText: userDataReviewText, // Include the updated review content
          reviewScore: userDataReviewScore,
        },
        {
          headers: {
            "x-auth-token": JSON.parse(localStorage.getItem("token")).token,
          },
        }
      );

      setIsCreatingEditing(false);

      // Clear the user's review inputs field
      setUserDataReviewText("");            
      setUserDataReviewScore(0);   

      alert("Review edited successfully");

      handleReloadBookData();

    } catch (error) {
      console.error("Error editing review: ", error);
      // Handle errors, e.g., show an error message.
      alert("Error editing the review");
    }
  };

  const handleDeleteReview = () => {
    // Display a confirmation dialog to the user
    const isConfirmed = window.confirm(
      "Are you sure you want to delete your review?"
    );
    if (isConfirmed) {
      deleteReview(localStorage.getItem("loggedUserEmail")); // Pass the user's email to identify their review
    }
  };

  const deleteReview = async (userEmail) => {
    try {
      // Send a DELETE request to delete the review
      await axios.delete(`${serverApiBaseUrl}/api/admin/book/${bookId}/review/delete`, {
        headers: {
          "x-auth-token": JSON.parse(localStorage.getItem("token")).token,
        },
        data: { userEmail }, // Include the user's email
      });

      alert("Review deleted successfully");

      handleReloadBookData();

    } catch (error) {
      console.error("Error deleting review: ", error);
      // Handle errors, e.g., show an error message.
      alert("Error deleting the review");
    }
  };

  const handleReviewAddMode = () => {
    // Toggle to the editing mode
    setAddEditReviewTitle("Add new review")
    setIsCreatingEditing(true);
  };

  const handleCancelCreateEdit = () => {
    // Toggle back to view mode without saving edits
    setIsCreatingEditing(false);

    // Clear the user's review inputs field
    setUserDataReviewText("");            
    setUserDataReviewScore(0);   
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
          {bookNotFound ? (
            <div>
              <h2>Book Not Found</h2>
              <p>The book you are looking for doesn't exist.</p>
              <button onClick={() => navigate("/")}>Go Back to Home</button>
            </div>
          ) : !book ? (
            <div>Loading...</div>
          ) : isCreatingEditing ? (
            // Edit mode
            <div>
              <div>              
              <h2 className="book__item-title">{book.title}</h2>
              <img className="book__item-image" src={book.coverImageUrl} alt="Book cover" width="200px" />
              </div>
              <h2>{addEditReviewTitle}</h2>
              <div>
                <label>Your Review:</label>
                <textarea
                  rows="4"
                  cols="50"
                  value={userDataReviewText}
                  onChange={(e) => setUserDataReviewText(e.target.value)}
                ></textarea>                
              </div>

              <div>
                <label>Your review score:</label>
                <div className={`book__item-review-score-select-wrapper book__item-review-score-select-wrapper--score-${userDataReviewScore}`}>
                  {reviewScores.map((score) => (
                    <div
                      key={score}
                      className="book__item-review-score-item"
                    >
                      <label htmlFor={"reviewScore" + score}>{score}</label>
                      <input
                        id={"reviewScore" + score}
                        type="radio"
                        name="reviewScore"
                        value={score}
                        checked={userDataReviewScore === score}
                        onChange={() => setUserDataReviewScore(score)}
                      />
                    </div>
                  ))}
                </div>
              </div>              
              <div className="component__buttons-container component__buttons-container--horizontal book__item-buttons-wrapper">
                {userGlobalLoggedStatus && !userHasReview && (
                  <button className="component__button" onClick={handleReviewAddExecute}>Save review</button>
                )}
                {userGlobalLoggedStatus && userHasReview && (
                  <button className="component__button" onClick={handleReviewEditSaveExecute}>Update review</button>
                )}
                <button className="component__button component__button--warning" onClick={handleCancelCreateEdit}>Cancel</button>
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
              {book.reviews.length > 0 ? (
                <div className="book__item-reviews-wrapper">
                  <h2>Reviews (Newest to Oldest):</h2>
                  {book.reviews
                    .slice() // Create a copy to avoid modifying the original array
                    .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date, newer to older
                    .map((review, index) => (
                      <ul className="book__item-reviews-item" key={index}>   
                        {userGlobalLoggedStatus && review.userMail === localStorage.getItem("loggedUserEmail") && (
                          <li className="book__item-reviews-item__current-user">This is your review</li>
                        )}                     
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
                        {(userGlobalLoggedStatus && review.userMail === localStorage.getItem("loggedUserEmail") && userGlobalLoggedStatus && userHasReview) && (
                          <li>
                            <div className="component__buttons-container component__buttons-container--horizontal book__item-buttons-wrapper">
                              <button className="component__button" onClick={handleReviewEditMode}>Edit Review</button>
                              <button className="component__button component__button--warning" onClick={handleDeleteReview}>Delete Review</button>
                            </div>
                          </li>
                        )}
                      </ul>                      
                    ))}
                </div>
              ) : (
                <p>No reviews available for this book.</p>
              )}
              <div className="component__buttons-container component__buttons-container--horizontal book__item-buttons-wrapper">
                {userGlobalLoggedStatus && !userHasReview && (
                  <button className="component__button" onClick={handleReviewAddMode}>Add Review</button>
                )}                
              </div>            

              {!userGlobalLoggedStatus && (
                  <>
                    <p>
                      Please note that in order to write a review, you must be logged in or registered. If you haven't already, please log in to your account or register to get started.
                    </p>
                    <div className="component__buttons-container component__buttons-container--horizontal book__item-buttons-wrapper">
                      <Link className="component__button" to="/login">Login</Link>
                      <Link className="component__button" to="/register">Register</Link>
                    </div>
                  </>
                )
              }   
            </div>
          )}
        </div>
        <NavBar />
      </div>
      <Footer/>
    </>
  );
}

export default BookViewPublic;
