import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import NavBar from "./components/NavBar";
import Main from "./components/Main";
import Login from "./components/Login";
import Register from "./components/Register";
import AdminDashboard from "./components/AdminDashboard";
import BookViewAdmin from "./components/BookViewAdmin";
import BookViewPublic from "./components/BookViewPublic";
import UserDashboard from "./components/UserDashboard";
import PrivateRoutes from "./utils/PrivateRoutes";
import axios from "axios";
import { useGlobalDataVariables } from "./utils/GlobalVariables";

function App() {
  const serverApiBaseUrl = process.env.REACT_APP_SERVER_API_URL;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const {setUserGlobalLoggedStatus, setUserGlobalRole} = useGlobalDataVariables();
  /* const { userGlobalLoggedStatus, setUserGlobalLoggedStatus, userGlobalRole, setUserGlobalRole, userGlobalLocation } = useGlobalDataVariables(); */

  useEffect(() => {
    async function verifyAuth() {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const { data } = await axios.get("/api/auth", {
            headers: {
              "x-auth-token": JSON.parse(localStorage.getItem("token")).token,
            },
          });

          if (data.role !== "admin" && data.role !== "user") {
            setUserGlobalLoggedStatus(false);
            setUserGlobalRole();
            removeLocalStorage();
          } else {
            setUserGlobalLoggedStatus(true);
            setUserGlobalRole(data.role);
          }
        } else {
          setUserGlobalLoggedStatus(false);
          setUserGlobalRole();
          removeLocalStorage();
        }

        fetchData();
      } catch (error) {
        if (error.response && error.response.status === 401) {
          if (error.response.data.code === "INVALID_TOKEN") {
            // Handle the case where the token is invalid or has expired
            setUserGlobalLoggedStatus(false);
            setUserGlobalRole();
            removeLocalStorage();
          }
        } else {
          console.error("Authentication error:", error);
          setUserGlobalLoggedStatus(false);
          setUserGlobalRole();
          removeLocalStorage();
        }
      }
    }

    async function fetchData() {
      try {
        setLoading(true);
        const { data } = await axios.get(`${serverApiBaseUrl}/api/admin/books`);
        setLoading(false);
        setData(data);
      } catch (error) {
        console.log(error.response.data);
      }
    }
    verifyAuth();
  }, [serverApiBaseUrl, setUserGlobalLoggedStatus, setUserGlobalRole]);

  const removeLocalStorage = () => {
    localStorage.removeItem("token");
    localStorage.setItem("loggedUserStatus", false);
    localStorage.removeItem("loggedUserFirstName");
    localStorage.removeItem("loggedUserLastName");
    localStorage.removeItem("loggedUserEmail");
  };

  //showAlert
  const showAlert = (data) => {
    setAlert({
      type: data.type,
      msg: data.msg,
    });
    setTimeout(() => {
      setAlert(null);
    }, 5000);
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <Header/>
            <div id="mainContents">
              <Main data={data} loading={loading} />
              <NavBar />
            </div>
            <Footer/>
          </>
        }
      />

      <Route
        path="/login"
        element={<Login alert={alert} showAlert={showAlert} />}
      />
      <Route
        path="/register"
        element={<Register alert={alert} showAlert={showAlert} />}
      />
      <Route
        path="/book/:bookId"
        element={<BookViewPublic alert={alert} showAlert={showAlert} data={data} loading={loading} />}
      />
      <Route element={<PrivateRoutes />}>
        <Route
          path="/dashboard"
          element={
            <UserDashboard
              alert={alert}
              showAlert={showAlert}
              data={data}
              loading={loading}
            />
          }
        />
        <Route
          path="/admin"
          element={
            <AdminDashboard
              alert={alert}
              showAlert={showAlert}
              data={data}
              loading={loading}
            />
          }
        />
        <Route path="/admin/book/:bookId" element={<BookViewAdmin />} />
      </Route>
    </Routes>
  );
}

export default App;

//Note : in-line styling in React JSx must be sent as object)key-value pair

//State : Dynamic Data of React comp. is known as State
