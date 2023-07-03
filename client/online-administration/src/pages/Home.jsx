import ItemComponent from "./../components/Item"
import Chat from "./../components/Chat"
import Chat2 from "./../components/Chat2"

import axios from "axios"
import SocketContext from "../SocketConetxt"
import React, { useState, useEffect, useContext } from 'react';
import User from './../components/User';
import Navbar from './../components/Navbar';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from "react-router-dom";
import Socket from "../Socket"

import UserContext from "../UserContext";
import {NotificationContext} from "../NotificationContext";
import io from "socket.io-client";
const Home = ({setIsAuthenticated, setIsLoggedIn, setUser}) => {
    const token = localStorage.getItem("token")
    const [userData, setUserData] = useState({})
    const [loading, setLoading] = useState(true);
    const {socket, setSocket} = useContext(SocketContext)
    const [me, setMe] = useState(null)
    const {user} = useContext(UserContext)
    const [socketInstance, setSocketInstance] = useState(null);
    const { notifications, removeNotification, addNotification } = useContext(NotificationContext);
    const fetchData = async () => {
      await fetch("http://localhost:3000/user/home", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    'Authorization': `Bearer ${token}`
  }
  })
  .then(response => response.json()) // Parse the response as JSON
  .then(data => {
    console.log("data", data)
    setUserData(data); // Set the data in the state
    setLoading(false);
    console.log("response", userData);
  })
  .catch(error => {
    console.error('Error fetching data:', error);
    setLoading(false);
    
  });
  }
    useEffect( () => {
      fetchData()
    }, [token])

   
    useEffect( () => {
      
        if(socket){
          socket.on("connect", () => {
            
            console.log("Connected to Socket.IO server");
          });
          
          socket.on("liked", (data)=> {
            console.log("liked by" , data)
            addNotification(`User ${data} liked your post`)
          })
          /*socket.on("me", (id) =>{
            setMe(id)
            
          })*/
          console.log("socket", socket)
          // setSocket(socket);
          
          return () => {
            
            socket.off('liked');
            socket.off('connect');
            
          }
        }
        
      }, [socket])

    if (loading) {
      return <div>Loading...</div>;
    }

    return (
      <div>
        <Navbar  setIsAuthenticated = {setIsAuthenticated} setIsLoggedIn = {setIsLoggedIn} setUser = {setUser}/>
  <h2>Users</h2>
  {socket && user && (<Chat2/>)}
  {userData.users && userData.users.map(user => (
    <div key={user.email}>
      <Link to={`/users/${user.userName}`}><User user = {user}/></Link>
    </div>
  ))}
</div>
  );
}
export default Home;