import {  Link } from "react-router-dom";

function BookItem({ elem }) {
    // const { elem } = props;

    const calculateAverageReviewScore = (reviews) => {
        if (reviews.length > 0) {
          const totalScore = reviews.reduce((sum, review) => sum + review.reviewScore, 0);
          return (totalScore / reviews.length).toFixed(2);
        }
        return "N/A";
    };

    const averageReviewScorePercentCss = () => {
        var totalMaxScore = 5;
        var averageReviewScoreValue = calculateAverageReviewScore(elem.reviews);
        var averageReviewScorePercent = (averageReviewScoreValue*100)/totalMaxScore;
        var averageReviewScorePercentCss = calculateAverageReviewScore(elem.reviews) > 0 ?
          ('linear-gradient( to right, var(--colors-review-stars), var(--colors-review-stars) ' + averageReviewScorePercent.toString() + '%, var(--colors-oxford-blue) 0% )') 
          : 
          ('linear-gradient( to right, var(--colors-review-stars), var(--colors-review-stars) 0%, var(--colors-oxford-blue) 0% )');

        return averageReviewScorePercentCss;
      };

    return (
        <div className="books__item-main-wrapper">
            <center>
                {/* <h4>Publisher  - <span className="author">{elem.publisher}</span></h4> */}
                <Link to={`/book/${elem._id}`}>
                    <img src={elem.coverImageUrl} alt="Book cover" height={"250px"}></img>
                </Link>
                <Link to={`/book/${elem._id}`}>
                    <h2 className="books__item-details-title">{elem.title} - <span className="author">{elem.author}</span></h2>
                </Link>
                <div className="books__item-details-wrapper">
                    <p className="books__item-details-synopsis">{elem.synopsis}</p>
                    {/* <p className="books__item-details-av-reviews">Average reviews - {calculateAverageReviewScore(elem.reviews)}</p> */}
                    <div className="book__item-reviews-average-wrapper book__item-reviews-average-wrapper--books">
                        <div className="book__item-reviews-average-title">Average Reviews:</div>
                        <div className="book__item-reviews-average-star" style={{ background: averageReviewScorePercentCss() }}>
                            <div className="book__item-reviews-average-number">{calculateAverageReviewScore(elem.reviews)}</div>
                        </div>                  
                    </div>
                </div>
                <Link className="component__button books__item-details-button" to={`/book/${elem._id}`}>
                    View book details
                </Link>                    
            </center>
        </div>
    )
}

export default BookItem;