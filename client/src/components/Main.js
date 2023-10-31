import BookItem from "./BookItem";
import Loading from "./Loading";
import ReviewStar from "./ReviewStar";

function Main({ data, loading }) {
    return (
        <div className="main">
            <ReviewStar/>
            <div className="books__main-wrapper">            
                {loading && <Loading />}
                {Array.isArray(data) ? (
                    data.map((elem, index) => (
                        <BookItem key={index} elem={elem} />
                    ))
                ) : (
                    <p>No data available.</p> // You can display a message or handle this case as needed
                )}
            </div>
        </div>
    )
}

export default Main;
