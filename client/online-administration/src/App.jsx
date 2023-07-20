import React from 'react';
import io from "socket.io-client";
import "./App.css";
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link, Navigate  } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Shop from "./pages/Shop"
import Profile from "./pages/Profile"
import Authentication from './pages/Authentication';
import Gallery from './pages/Gallery';
import UserProfilePage from './components/UserProfilePage';
import UserContext from './UserContext';
import SocketContext from './SocketConetxt';
import ImageContext from './ImageContext';
import TokenContext from './TokenContext';
import ChatContext from './ChatContext';
import MessageNotifContext from './MessageNotifContext';
import Socket from "./Socket"
import { useState, useContext, useEffect } from 'react'
import { NotificationProvider } from './NotificationContext';
import Chat3 from './components/Chat3';
import Navbar from './components/Navbar';
import Terms from './components/Terms';

//add error page
const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user , setUser] = useState(null)
  const [socket, setSocket] = useState(null);
  const [token, setToken] = useState(null)
  const [tokenSet, setTokenSet] = useState(false)
  const [messagesNotif, setMessagesNotif] = useState([])
  const [chatOpened, setChatOpened] = useState(false)
  const [chatOpenedAfterRedirect, setChatOpenedAfterRedirect] = useState(false)

  const [chatWith, setChatWith] = useState(null)
  const [inCall, setInCall] = useState(false)
  const [isReceiveingCall, setIsReceiveingCall] = useState(false)
  const [isCalling, setIsCalling] = useState(false)
  const [imageContext, setImageContext] = useState(null)

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log("token", token)
      const res = await axios.get(`${import.meta.env.VITE_SERVER_URL}/user/currentuser`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch (error) {
      console.log(error);
    }
  };
  

  useEffect(() => {
    if(isLoggedIn && token){
      console.log("socket",socket)
      const newSocket = createSocketConnection(token)
      setSocket(newSocket);
    }else {
      setSocket(null)
      console.log("socket is nulll")
    }// Create and configure your socket connection here
    
    // Clean up the socket connection on component unmount
  }, [isLoggedIn, token, setUser]);


  useEffect(()=> {
    if(user){
      setMessagesNotif(user.messageNotifications)
    }
  }, [user])
  const clearLocalStorage = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setIsAuthenticated(false);
    setUser(null);
  };
  const getTokenExpiration = (token) => {
    // Extract the expiration time from the token and convert it to milliseconds
    const { exp } = JSON.parse(atob(token.split('.')[1]));
    return exp * 1000;
  };
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    console.log("isLoggedIn", isLoggedIn)
    const token = localStorage.getItem('token');
    console.log("token", token)
    if (isLoggedIn && token) {

      const tokenExpiration = getTokenExpiration(token);
      if (tokenExpiration < Date.now()) {
        // Token has expired, clear local storage
        clearLocalStorage();
        return;
      }
      fetchUserData();
      setIsLoggedIn(true);
      setIsAuthenticated(true);
      setToken(token)
      // Set the user data from localStorage or fetch it from the backend
      const userData = localStorage.getItem('user');

      // Fetch the user data from the backend using the stored token
      
      const newSocket = createSocketConnection(token)
      console.log("socket.set veforeeeeeeee")
      console.log("user", user)

      console.log("socket.set")

    }
  }, [setIsLoggedIn, setIsAuthenticated]);
/*useEffect(()=> {
  if(!tokenSet){
    const lstoken = localStorage.getItem("token")
  if(lstoken && token === ""){
    setToken(lstoken)
  }else if(lstoken){
    setTokenSet(true)
  }
}
}, [tokenSet])*/
const createSocketConnection = (token) => {
  const socket = io(import.meta.env.VITE_SERVER_URL, {
    auth: {
      token: token
    },
    transport: WebSocket,
  });

  return socket;
};
  return (
    
    <Router >
      <UserContext.Provider value = {{user, setUser, isLoggedIn, setIsLoggedIn, isAuthenticated, setIsAuthenticated}}>
      <SocketContext.Provider value = {{socket, setSocket}}>
      <NotificationProvider>
      <TokenContext.Provider value = {{token, setToken}}>
      <MessageNotifContext.Provider value = {{messagesNotif, setMessagesNotif}}>
      <ChatContext.Provider value = {{chatOpened, setChatOpened,chatOpenedAfterRedirect,setChatOpenedAfterRedirect, chatWith, setChatWith,inCall, setInCall,isReceiveingCall, setIsReceiveingCall,isCalling, setIsCalling}}>
      <ImageContext.Provider value = {{imageContext, setImageContext}}>
      {/* Your app components */}
      
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route
          path="/login"
          element={isLoggedIn || isAuthenticated ? <Navigate to="/home" /> : <Login setIsLoggedIn={setIsLoggedIn} setIsAuthenticated={setIsAuthenticated} setUser={setUser} setSocket={setSocket} setToken={setToken} />}
        />
        <Route path="/termsAndConditions" element={<Terms/>} />
        <Route path="/register" element={isLoggedIn || isAuthenticated ? <Navigate to="/home" /> : <Authentication setIsLoggedIn={setIsLoggedIn} setIsAuthenticated={setIsAuthenticated} setUser = {setUser}/>} />
        <Route path="/register/:myUserData" element={isLoggedIn || isAuthenticated ? <Navigate to="/home" /> : <Authentication setIsLoggedIn={setIsLoggedIn} setIsAuthenticated={setIsAuthenticated} setUser = {setUser}/>} />
        <Route path="/home" element={isLoggedIn || isAuthenticated ? <Home /> : <Navigate to= "/login"/> }/>
        <Route path="/shop" element={isLoggedIn ? <Shop /> : <Navigate to="/login" />} />
        <Route path="/profile" element={isLoggedIn ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/gallery" element={isLoggedIn ? <Gallery /> : <Navigate to="/login" />} />
        <Route path="/users/:userId" element={<UserProfilePage/>} />
        <Route path="*" element={<h1>Page not found</h1>} />
      </Routes>
      {isLoggedIn && socket && user && !imageContext  && <Chat3/>}
      {isLoggedIn && user && !imageContext && !inCall && <Navbar isLoggedIn = {isLoggedIn}/>}
          </ImageContext.Provider>
          </ChatContext.Provider>
          </MessageNotifContext.Provider>
          </TokenContext.Provider>
          </NotificationProvider>
      </SocketContext.Provider>
      </UserContext.Provider>
    </Router>
  );
};





export default App
