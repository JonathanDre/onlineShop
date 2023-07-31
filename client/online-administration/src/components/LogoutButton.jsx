import React from 'react';
import { useContext } from 'react';
import UserContext from '../UserContext';
import TokenContext from '../TokenContext';
import SocketContext from '../SocketConetxt';

const LogoutButton = () => {

    const {setIsLoggedIn, setUser,setIsAuthenticated} = useContext(UserContext);
    const {setToken} = useContext(TokenContext);
    const {socket,setSocket} = useContext(SocketContext);
    const token = localStorage.getItem("token")
  const logout = async () => {

    await fetch(`${import.meta.env.VITE_SERVER_URL}/user/clearNotifications`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      }
    }).then((response)=> {
      console.log("response",response)
      localStorage.removeItem('token');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('isAuthenticated');
      if(socket){
        socket.disconnect()
      }
      // Clear any stored user data or authentication state in your React app
      // ...
      setIsAuthenticated(false)
      setIsLoggedIn(false)
      setUser("")
      setSocket(null)
      setToken(null)
      window.location = "/login"
    }).catch(error => {
      console.log(error)
    })
    };
    
    return <button className='flex bg-transparent border border-white text-center rounded-2xl' onClick={() => logout()}>Yes</button>;
};

export default LogoutButton;