import Header from "./Header";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function UserDashboard() {

  const serverApiBaseUrl = process.env.REACT_APP_SERVER_API_URL;
  let navigate = useNavigate();
  const [userIsLoggedStatus, setUserIsLoggedStatus] = useState("");
  const [userFirstName, setUserFirstName] = useState("");
  const [userLastName, setUserLastName] = useState("");
  useEffect(() => {
    async function verifyAuth() {
      try {
        const { data } = await axios.get(`${serverApiBaseUrl}/api/auth`, {
          headers: {
            "x-auth-token": JSON.parse(localStorage.getItem("token")).token,
          },
        });
        if (data.role !== "user") {
          logout();
        } else {
          setUserIsLoggedStatus(localStorage.getItem("loggedUserStatus"));
          setUserFirstName(localStorage.getItem("loggedUserFirstName"));
          setUserLastName(localStorage.getItem("loggedUserLastName"));
        }
      } catch (error) {
        logout();
      }
    }
    verifyAuth();
    // eslint-disable-next-line
  }, []);

  const removeLocalStorage = () => {
    localStorage.removeItem("token");
    localStorage.setItem("loggedUserStatus", false);
    localStorage.removeItem("loggedUserFirstName");
    localStorage.removeItem("loggedUserLastName");
    localStorage.removeItem("loggedUserEmail");
  };

  const logout = () => {
    removeLocalStorage();
    navigate("/login");
  };

  const logoutHome = () => {
    removeLocalStorage();
    navigate("/");
  };
  return (
    <>
      <Header content={"User Dashboard"} />
      <div style={{ overflow: "auto" }}>
        <div className="main">
          <div>
            <h1>
              {" "}
              User Dashboard {userFirstName} {userLastName}
            </h1>
          </div>
        </div>
        <div className="menu">
          <Link to="/">Home</Link>
          <p onClick={logoutHome}> Logout</p>
          {!userIsLoggedStatus && <Link to="/register">Register</Link>}
          <Link to="/contact">Contact Us</Link>
        </div>
      </div>
    </>
  );
}

export default UserDashboard;
