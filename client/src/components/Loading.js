/* import loading from "./loading.gif"; */
function Loading() {
    return (
        <>
            {/* <div className="component__loading">
                <img src={loading} alt="Loading.." />
            </div> */}
            <div className="component__loading-wrapper">
                <div className="component__loading-spinner"></div>
            </div>
        </>
    )
}

export default Loading;