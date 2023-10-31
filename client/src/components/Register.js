import Header from "./Header";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Register({ alert, showAlert }) {
    const serverApiBaseUrl = process.env.REACT_APP_SERVER_API_URL;

    let navigate = useNavigate();

    const [userData, setUserData] = useState({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        password2: ""
    });
    const { firstname, lastname, email, password, password2 } = userData;
    const onChangeHandler = (e) => {
        setUserData({
            ...userData,
            [e.target.name]: e.target.value
        });
    }

    const onSubmitHandler = async (e) => {
        try {
            e.preventDefault();
            const { data } = await axios.post(`${serverApiBaseUrl}/api/user/register`, userData);
            showAlert({
                type: "success",
                msg: data.success
            });
            navigate("/login");
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
            <Header content={"User Signup Page"}/>
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
                        <label htmlFor="firstname"><b>First Name :</b></label>
                        <input type="text" name="firstname" autoComplete="off" value={firstname} onChange={onChangeHandler} />
                        <label htmlFor="firstname"><b>Last Name :</b></label>
                        <input type="text" name="lastname" autoComplete="off" value={lastname} onChange={onChangeHandler} />
                        <label htmlFor="email"><b>Email : </b></label><br />
                        <input type="email" name="email" autoComplete="off" value={email} onChange={onChangeHandler} />
                        <label htmlFor="password"><b> Password : </b></label>
                        <input type="password" name="password" value={password} onChange={onChangeHandler} />
                        <label htmlFor="password"><b> Confirm Password : </b></label>
                        <input type="password" name="password2" value={password2} onChange={onChangeHandler} /><br />
                        <input className="component__button" type="submit" value="Register" />
                    </form>
                </div>
                <p> Already have an account ? <Link to="/login"> <b> Login</b></Link></p>
                <div className="component__buttons-container component__buttons-container--horizontal book__item-buttons-wrapper">
                    <button className="component__button" onClick={handleReturnHome}>Return to home</button>
                </div>
            </div>
        </div>
    )
}

export default Register;