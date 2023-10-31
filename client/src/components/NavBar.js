import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGlobalDataVariables } from '../utils/GlobalVariables';

function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { userGlobalLoggedStatus, setUserGlobalLoggedStatus, userGlobalRole, setUserGlobalRole, userGlobalLocation } = useGlobalDataVariables();

  const removeLocalStorage = () => {
    localStorage.removeItem("token");
    localStorage.setItem("loggedUserStatus", false);
    localStorage.removeItem("loggedUserFirstName");
    localStorage.removeItem("loggedUserLastName");
    localStorage.removeItem("loggedUserEmail");
    setUserGlobalLoggedStatus(false);
    setUserGlobalRole();
  };

  const logoutHome = () => {
    removeLocalStorage();
    window.location.href = "/";
  };

  const userGlobalRoleVisibleText = () => {
    var stringRole = userGlobalRole[0].toUpperCase() + userGlobalRole.slice(1);
    return stringRole;
  };

  useEffect(() => {
    // Add an event listener to track window width
    const handleResize = () => {
      if (window.innerWidth > 1000) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className={`menu ${menuOpen ? 'menu--open' : ''}`}>
      <div className="menu__toggle-button" onClick={() => setMenuOpen(!menuOpen)}>
        <div></div>
      </div>
      <div className="menu__main-buttons">
        {userGlobalLoggedStatus && (
          <div className="menu__user">
            <div className="menu__user-tag">{userGlobalRoleVisibleText()}</div>
            <span className="menu__user-name">{localStorage.getItem("loggedUserFirstName") + " " + localStorage.getItem("loggedUserLastName")}</span>
          </div>
        )}
        {userGlobalLocation !== "/" && (
          <Link to="/">Home</Link>
        )}
        {userGlobalLoggedStatus && userGlobalRole === 'admin' && userGlobalLocation !== "/admin" && (
          <Link to="/admin">Admin dashboard</Link>
        )}
        {!userGlobalLoggedStatus && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
        {userGlobalLoggedStatus && (userGlobalRole === 'admin' || userGlobalRole === 'user') && (
          <button className="menu__logout" onClick={logoutHome}>Logout</button>
        )}
      </div>
      {/* <Link to="/contact">Contact Us</Link> */}
      {/* This part is just for test and debug purposes */}
      {/* <p location={userGlobalLocation}>
        Current Location: {userGlobalLocation}<br></br>
        Global status and role: {userGlobalLoggedStatus.toString()}, {userGlobalRole}
      </p>    */} 
    </div>
  );
}

export default NavBar;
