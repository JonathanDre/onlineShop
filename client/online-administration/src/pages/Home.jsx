import ItemComponent from "./../components/Item"
import Chat from "./../components/Chat"
import Chat2 from "./../components/Chat2"
import Chat3 from "./../components/Chat3"
import SearchIcon from '@mui/icons-material/Search';
import axios from "axios"
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

const Home = ({ setIsAuthenticated, setIsLoggedIn, setUser }) => {

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
    await fetch(`${import.meta.env.VITE_SERVER_URL}/user/home`, {
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


  useEffect(() => {

    if (socket) {
      socket.on("connect", () => {

        console.log("Connected to Socket.IO server");
      });

      socket.on("liked", (data) => {
        console.log("liked by", data)
        addNotification(`User ${data} liked your post`)
      })
      socket.on("giftSent", (data) => {
        console.log("liked by", data)
        addNotification(`User ${data} sent you a gift!`)
      })
      /*socket.on("me", (id) =>{
        setMe(id)
        
      })*/
      console.log("socket", socket)
      // setSocket(socket);
      socket.on("connect_error", (err) => {
        console.log(`connect_error due to ${err.message}`);
      });

      return () => {

        socket.off('liked');
        socket.off('connect');
        socket.off("connect_error");
      }
    }

  }, [socket])

  const handleFindUser = async () => {
    fetch(`${import.meta.env.VITE_SERVER_URL}/user/getUserById`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: searchUsername })
    }).then(res => res.json())
      .then(data => {
        if (data.errors) {
          setError(data.errors)
          return
        }
        const foundUser = data.user
        setFoundUser(foundUser)

        // Set the found user in the state
      })
  }
  const handleCancelDisplay = () => {
    setFoundUser(null);
  };
  function closeImage() {
    console.log(imageContext)
    setImageContext(null)
  }
  useEffect(()=> {
    setChatOpened(false)
  },[])

  return (<>  {!inCall && <div className="h-screen w-full">
  {imageContext !== null && <div className="absolute flex flex-col bg-slate-900 items-center justify-center w-full h-full">
                <TransformWrapper >
                    <TransformComponent >
                        <img className="flex w-full h-full object-contain" src={imageContext} alt="Received Image" />
                    </TransformComponent>
                </TransformWrapper>
                <div className="fixed top-5 right-5"><button className="bg-transparent border border-white text-white text-xl" onClick={() => closeImage()}>Close</button></div>
            </div>}
    {!chatOpened && !imageContext && !inCall &&  user && (
    <div className="text-white m-auto flex flex-col w-full justify-center " style={{ background: 'linear-gradient(180deg, #000025 0%, #31019A 100%)' }}>
      <div className="h-1/5 mx-auto items-center justify-center  min-w-min pt-10 flex flex-col w-1/2 md:w-1/3 xl:w-1/4">
        <div className="flex w-full mt-2 items-center justify-center  ">
          <input
          placeholder="Search..."
            className="w-full rounded-2xl border-solid border-2 text-center border-indigo-100 text-white bg-transparent"
            type="text"
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
          />
          <SearchIcon className="w-1/5 p-0 max-auto rounded-2xl bg-transparent cursor-pointer" onClick={() => handleFindUser()}/>
        </div>
        {foundUser && (
          <div className="relative flex flex-row w-full h-full mx-auto my-3 items-center p-4 justify-center" style={{
            background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100%25\' height=\'100%25\' viewBox=\'0 0 533 366\' fill=\'none\'%3E%3Cpath d=\'M0 30C0 13.4315 13.4315 0 30 0H503C519.569 0 533 13.4315 533 30V336C533 352.569 519.569 366 503 366H30C13.4315 366 0 352.569 0 336V30Z\' fill=\'url(%23paint0_linear_353_105)\' fill-opacity=\'0.8\'/%3E%3Cdefs%3E%3ClinearGradient id=\'paint0_linear_353_105\' x1=\'167.007\' y1=\'565.656\' x2=\'141.019\' y2=\'-106.015\' gradientUnits=\'userSpaceOnUse\'%3E%3Cstop stop-color=\'%23362759\'/%3E%3Cstop offset=\'1\' stop-color=\'%235601F4\' stop-opacity=\'0\'/%3E%3C/linearGradient%3E%3C/defs%3E%3C/svg%3E")',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
          }}>
            <Link className="text-white mx-3" to = {`/users/${foundUser.userName}`}>{foundUser.userName}</Link>
            <img className="w-10 h-10 mx-3 rounded-full" src={foundUser.mainImage.url} />
            {/* Display other user properties as needed */}
            <CloseIcon fontSize="medium" className="absolute top-0 right-0" onClick={() => handleCancelDisplay()}/>
            
          </div>
        )}
      </div>
      <div className="mx-auto pt-10 grid w-1/2 min-h-min grid-cols-1 gap-8 mb-10 sm:w-2/3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {userData && userData.map(user => (
          <User User={user} />
        ))}
      </div>

    </div>)}</div>}</>

  );
}
export default Home;