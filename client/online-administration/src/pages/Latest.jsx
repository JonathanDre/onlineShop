
import SearchIcon from '@mui/icons-material/Search';

import SocketContext from "../SocketConetxt"
import React, { useState, useEffect, useContext } from 'react';
import User from './../components/User';
import Navbar from './../components/Navbar';
import { BrowserRouter as Router, Route, Routes, Link, Navigate, useNavigate } from "react-router-dom";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import Socket from "../Socket"
import CloseIcon from '@mui/icons-material/Close';
import UserContext from "../UserContext";
import ChatContext from "../ChatContext";
import ImageContext from "../ImageContext";
import { NotificationContext } from "../NotificationContext";
import io from "socket.io-client";
import onlineContext from "../onlineContext";

const Latest = ({ setIsAuthenticated, setIsLoggedIn, setUser }) => {

  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const [userData, setUserData] = useState([])
  const [loading, setLoading] = useState(true);
  const [foundUser, setFoundUser] = useState(null)
  const [error, setError] = useState("")
  const [searchUsername, setSearchUsername] = useState("");
  const { socket, setSocket } = useContext(SocketContext)
  const { chatOpened,setChatOpened, inCall } = useContext(ChatContext)
  const [me, setMe] = useState(null)
  const { user } = useContext(UserContext)
  const [socketInstance, setSocketInstance] = useState(null);
  const { notifications, addNotification } = useContext(NotificationContext);
  const { imageContext, setImageContext } = useContext(ImageContext)
  const { online, setOnline } = useContext(onlineContext)
  const fetchData = async () => {
    await fetch(`${import.meta.env.VITE_SERVER_URL}/user/latest`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => response.json()) // Parse the response as JSON
      .then(data => {
        console.log("data", data)
        const newData = data.users.filter(f => f.email !== user.email)
        newData.sort((a,b) => new Date(b.dateCreated) - new Date(a.dateCreated))
        setUserData(newData); // Set the data in the state
        setLoading(false);
        console.log("response", userData);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);

      });
  }

  console.log("online", online)

  useEffect(()=> {
    setChatOpened(false)
  },[])
  useEffect(() => {
    if (token && user) {
      fetchData()
      setLoading(false)
    } else {
      setLoading(true)
    }
  }, [token, loading, user])

  useEffect(()=> {
    setChatOpened(false)
  },[])

  return (<>

    {!chatOpened && !imageContext && !inCall &&  user && (
    <div className="text-white m-auto flex flex-col w-full justify-center " style={{ background: 'linear-gradient(180deg, #000025 0%, #31019A 100%)' }}>
      <div className="mx-auto pt-10 grid w-1/2 min-h-min grid-cols-1 gap-8 mb-10 sm:w-2/3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {userData && userData.map(user => (
          <User User={user} />
        ))}
      </div>

    </div>)}</>
  );
}
export default Latest