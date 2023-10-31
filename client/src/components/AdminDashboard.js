import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import NavBar from "./NavBar";
import ReviewStar from "./ReviewStar";
import BookAddForm from "./BookAddForm";
import { useGlobalDataVariables } from '../utils/GlobalVariables';

function AdminDashboard() {
  const serverApiBaseUrl = process.env.REACT_APP_SERVER_API_URL;
  const [userBooks, setUserBooks] = useState([]);
  const [addBookMode, setAddBookMode] = useState(false);

  const { setUserGlobalLoggedStatus, setUserGlobalRole } = useGlobalDataVariables();
  /* const { userGlobalLoggedStatus, setUserGlobalLoggedStatus, userGlobalRole, setUserGlobalRole, userGlobalLocation } = useGlobalDataVariables(); */

  // Function to update the list of books when a new book is added
  const handleBookAdded = (newBook) => {
    // Update the userBooks state with the new book
    setUserBooks([...userBooks, newBook.book]);
    handleAddBookCancel();
  };

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
          // User is authenticated, so fetch and display their books
          const userBooksResponse = await axios.get(
            `${serverApiBaseUrl}/api/admin/books/created`,
            {
              headers: {
                "x-auth-token": JSON.parse(localStorage.getItem("token")).token,
              },
            }
          );
          
          // Calculate the average review score for each book
          const booksWithAverageScore = userBooksResponse.data.map((book) => ({
            ...book,
            averageReviewScore: calculateAverageReviewScore(book),
          }));

          setUserBooks(booksWithAverageScore);

        }
      } catch (error) {
        logout();
      }
    }
    verifyAuth();
  }, [serverApiBaseUrl, setUserGlobalLoggedStatus, setUserGlobalRole]);

  // Function to calculate the average review score for a book
  const calculateAverageReviewScore = (book) => {
    if (book.reviews && book.reviews.length > 0) {
      const totalScore = book.reviews.reduce(
        (sum, review) => sum + review.reviewScore,
        0
      );
      return (totalScore / book.reviews.length).toFixed(2);
    }
    return "N/A";
  };

  const averageReviewScorePercentCss = (book) => {
    var totalMaxScore = 5;
    var averageReviewScoreValue = book;
    var averageReviewScorePercent = (averageReviewScoreValue*100)/totalMaxScore;
    var averageReviewScorePercentCss = book > 0 ?
      ('linear-gradient( to right, var(--colors-review-stars), var(--colors-review-stars) ' + averageReviewScorePercent.toString() + '%, var(--colors-oxford-blue) 0% )') 
      : 
      ('linear-gradient( to right, var(--colors-review-stars), var(--colors-review-stars) 0%, var(--colors-oxford-blue) 0% )');

    return averageReviewScorePercentCss;
  };

  const handleAddBookStart = () => {
    setAddBookMode(true);
  };

  const handleAddBookCancel = () => {
    setAddBookMode(false);
  };

  return (
    <>
      <Header content={"React Online Library"} />
      <ReviewStar/>
      <div id="mainContents">
        <div className="main">
          <div>
            <h2 className="component__section-title">Admin Dashboard</h2>
            {!addBookMode && (
              <div className="component__buttons-container component__buttons-container--horizontal book__item-buttons-wrapper">
                <button className="component__button" onClick={handleAddBookStart}>+ Add new book</button>
              </div>
            )}
            {addBookMode && (
              <BookAddForm onBookAdded={handleBookAdded} onBookAddCancel={handleAddBookCancel} />
            )}    
            {!addBookMode && (        
              <div>
                <h2 className="component__section-title component__section-title--sub-section">Your Books:</h2>
                <div className="books__main-wrapper books__main-wrapper--admin">   
                    {userBooks.map((book) => (
                      <div className="books__item-main-wrapper" key={book._id}>
                        <Link to={`/admin/book/${book._id}`}>
                          <img src={book.coverImageUrl} alt="Book cover" height={"300px"}></img>
                        </Link>
                        <Link to={`/admin/book/${book._id}`}>
                          <h2 className="books__item-details-title">{book.title} - <span className="author">{book.author}</span></h2>
                        </Link>
                        <div className="book__item-reviews-average-wrapper book__item-reviews-average-wrapper--books">
                          <div className="book__item-reviews-average-title">Average Reviews:</div>
                          <div className="book__item-reviews-average-star" style={{ background: averageReviewScorePercentCss(book.averageReviewScore) }}>
                              <div className="book__item-reviews-average-number">{(book.averageReviewScore)}</div>
                          </div>                  
                        </div>
                        <Link className="component__button books__item-details-button" to={`/admin/book/${book._id}`}>
                          View book details
                        </Link>    
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <NavBar />
      </div>
      <Footer/>
    </>
  );
}

export default AdminDashboard;
