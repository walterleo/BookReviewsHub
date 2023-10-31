function Header({ content }) {
    return (
        <>
            <header className="component__header">
                <h1>{content}</h1>
            </header>
        </>
    )
}
Header.defaultProps = {
    content: "React Online Library"
};
export default Header;