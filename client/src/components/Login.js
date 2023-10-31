import Header from "./Header";
import { Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useGlobalDataVariables } from '../utils/GlobalVariables';

function Login({ alert, showAlert }) {
    const serverApiBaseUrl = process.env.REACT_APP_SERVER_API_URL;
    let navigate = useNavigate();
    const [loginData, setLoginData] = useState({
        email: "",
        password: ""
    });
    const { email, password } = loginData;

    const { setUserGlobalLoggedStatus, setUserGlobalRole } = useGlobalDataVariables();
    // const { userGlobalLoggedStatus, setUserGlobalLoggedStatus, userGlobalRole, setUserGlobalRole, userGlobalLocation } = useGlobalDataVariables();

    const onChangeHandler = (e) => {
        setLoginData({
            ...loginData,
            [e.target.name]: e.target.value
        })
    }
    const onSubmitHandler = async (e) => {
        try {
            e.preventDefault();

            const { data } = await axios.post(`${serverApiBaseUrl}/api/login`, loginData);          
            localStorage.setItem("token", JSON.stringify(data));
            localStorage.setItem("loggedUserStatus", true);
            setUserGlobalLoggedStatus(true);
            setUserGlobalRole(data.role);
            localStorage.setItem("loggedUserFirstName", data.firstname);
            localStorage.setItem("loggedUserLastName", data.lastname);
            localStorage.setItem("loggedUserEmail", data.email);

            if (data.role === "user") {
                // navigate("/dashboard"); */
                navigate("/");
                // window.location.href = "/";
            } else {
                navigate("/admin");
            }
        } catch (error) {
            if (error.response.data.error) {
                showAlert({
                    type: "error",
                    msg: error.response.data.error
                })
            } else {
                let longError = '';
                error.response.data.errors.forEach(elem => longError += elem.msg + "\n");
                showAlert({
                    type: "error",
                    msg: longError
                });
            }
        }
    }

    const handleReturnHome = () => {
        navigate("/");
    }

    return (
        <div>
            <Header content={"User Login Page"} />
            <div className="container">
                <div>
                    <center>
                        <Link to="/">
                            <img src="https://pngimg.com/uploads/book/book_PNG51090.png" alt="login" style={{ width: '30%' }} />
                           
                            {alert !== null && <h3 className={`alert-${alert.type}`}> {alert.msg}</h3>}
                        </Link>
                    </center>
                </div>
                <div>
                    <form onSubmit={onSubmitHandler}>
                        <label htmlFor="email"><b>Email : </b></label><br />
                        <input type="email" name="email" autoComplete="off" value={email} onChange={onChangeHandler} /><br />
                        <label htmlFor="password"><b> Password : </b></label><br />
                        <input type="password" name="password" value={password} onChange={onChangeHandler} /><br /><br />
                        <input className="component__button" type="submit" value="Login" />
                    </form>
                </div>
                <p> Dont you have an account ? <Link to="/register"> <b> Register</b></Link></p>
                <div className="component__buttons-container component__buttons-container--horizontal book__item-buttons-wrapper">
                    <button className="component__button" onClick={handleReturnHome}>Return to home</button>
                </div>
            </div>
        </div>

    )
}

export default Login;