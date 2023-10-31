import React, { createContext, useContext, useState } from 'react';
import { useLocation } from 'react-router-dom';

const GlobalVariablesContext = createContext();

export function GlobalDataProvider({ children }) {
 
  const [userGlobalLoggedStatus, setUserGlobalLoggedStatus] = useState(false);
  const [userGlobalRole, setUserGlobalRole] = useState(null);
  const userGlobalLocation = useLocation().pathname;

  return (
    <GlobalVariablesContext.Provider value={{ 
      userGlobalLoggedStatus, setUserGlobalLoggedStatus, 
      userGlobalRole, setUserGlobalRole,
      userGlobalLocation
    }}>
      {children}
    </GlobalVariablesContext.Provider>
  );
}

export function useGlobalDataVariables() {
  return useContext(GlobalVariablesContext);
}
