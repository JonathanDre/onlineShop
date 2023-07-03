import React from 'react';
import { useContext } from 'react';
import UserContext from '../UserContext';
const LogoutButton = () => {

    const {setIsLoggedIn, setUser,setIsAuthenticated} = useContext(UserContext);
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isAuthenticated');
    // Clear any stored user data or authentication state in your React app
    // ...
    setIsAuthenticated(false)
    setIsLoggedIn(false)
    setUser("")
  };

  return <button onClick={logout}>Yes</button>;
};

export default LogoutButton;