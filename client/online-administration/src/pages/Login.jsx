import axios from 'axios';
import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import User from '../components/User'
import Socket from "../Socket"
import io from "socket.io-client";
import IMG1 from "../assets/1.png"
import IMG2 from "../assets/2.png"
import IMG3 from "../assets/3.png"
import GIRL1 from "../assets/GIRL1.jpg"
import GIRL2 from "../assets/GIRL2.jpg"
import GIRL3 from "../assets/GIRL3.jpg"
import GIRL4 from "../assets/GIRL4.jpg"
import GIRL5 from "../assets/GIRL5.jpg"
import GIRL6 from "../assets/GIRL6.jpg"
import GIRL7 from "../assets/GIRL7.jpg"
import GIRL8 from "../assets/GIRL8.jpg"
import Logo from "../assets/Logo.png"
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from "react-router-dom";
import { useContext } from 'react';
import UserContext from '../UserContext';
import SocketContext from '../SocketConetxt';
import TokenContext from '../TokenContext';

function Login({ setIsLoggedIn, setUser, setIsAuthenticated, setToken, setSocket }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const location = useLocation();
  const { user } = useContext(UserContext)
  const [userData, setUserData] = useState({})
  const [userClicked, setUserClicked] = useState(null)
  const [socketSet, setSocketSet] = useState(false)
  const [error, setError] = useState(null)
  const [map, setMap] = useState(null)
  const [showLogin, setShowLogin] = useState(false);

  const navigate = useNavigate()

  const myMap = new Map([
    ["1", GIRL1],
    ["2", GIRL2],
    ["3", GIRL3],
    ["4", GIRL4],
    ["5", GIRL5],
    ["6", GIRL6],
    ["7", GIRL7],
    ["8", GIRL8],
  ])

  const shuffleMap = (map) => {
    const values = Array.from(map.values());

    for (let i = values.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [values[i], values[j]] = [values[j], values[i]];
    }

    const shuffledMap = new Map();

    map.forEach((value, key) => {
      shuffledMap.set(key, values.shift());
    });

    return shuffledMap;
  }

  useEffect(() => {
    const shuffledMAP = shuffleMap(myMap)
    setMap(shuffledMAP)
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password })
      }).then(res => res.json())
        .then((data) => {

          if (data.errors) {
            setError(data.errors)
            return
          }
          console.log("data", data)
          localStorage.setItem("token", data.token);
          setToken(data.token)
          setIsLoggedIn(true)
          console.log("change½")
          setIsAuthenticated(true)
          console.log("change", setIsAuthenticated)
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("isAuthenticated", "true");
          setUser(data.message)
          localStorage.setItem('user', JSON.stringify(data.message));
        }).catch(err => {
          console.log(err)
        })

    } catch (error) {
      console.log(error)
    }

    // do something with email and password, like send them to a backend API
  };


  const createSocketConnection = (token) => {
    const socket = io(import.meta.env.VITE_SERVER_URL, {
      auth: {
        token: token
      },
      transport: WebSocket,
    });

    return socket;
  };
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
  const handleYesClick = () => {
    setShowLogin(true);
  };

  const handleNoClick = () => {
    window.location.href = 'https://www.google.com';
  };


  return (<div className='flex flex-col min-h-screen'>
    {!showLogin ? ( <div className='w-screen h-screen flex flex-col items-center justify-center bg-[url("./assets/girl1.png")] bg-cover bg-center bg-no-repeat'>
          <div className='flex flex-col ' style={{
            background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100%25\' height=\'100%25\' viewBox=\'0 0 533 366\' fill=\'none\'%3E%3Cpath d=\'M0 30C0 13.4315 13.4315 0 30 0H503C519.569 0 533 13.4315 533 30V336C533 352.569 519.569 366 503 366H30C13.4315 366 0 352.569 0 336V30Z\' fill=\'url(%23paint0_linear_353_105)\' fill-opacity=\'0.8\'/%3E%3Cdefs%3E%3ClinearGradient id=\'paint0_linear_353_105\' x1=\'167.007\' y1=\'565.656\' x2=\'141.019\' y2=\'-106.015\' gradientUnits=\'userSpaceOnUse\'%3E%3Cstop stop-color=\'%23362759\'/%3E%3Cstop offset=\'1\' stop-color=\'%235601F4\' stop-opacity=\'0\'/%3E%3C/linearGradient%3E%3C/defs%3E%3C/svg%3E")',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
          }}>
          <p className='text-white text-xl italic'>Are you 18 years old or older?</p>
          <div className='flex flex-row items-center justify-around my-2'>
          <button className='bg-transparent text-white border border-blue-200 rounded-2xl' onClick={handleYesClick}>Yes</button>
          <button className='bg-transparent text-white border border-blue-200 rounded-2xl' onClick={handleNoClick}>No</button>
          </div>
          </div>
        </div>) : (<div>
    {map &&

      <div className='flex flex-col min-h-screen'>
        <div className='loginForm'>
          <div className='container flex flex-col absolute top-6 left-9 bg-transparent min-w-min max-w-max min-h-min max-h-max'><img className='w-25 h-20' src={Logo} /></div>
          <div className='container flex flex-col absolute top-10 right-9 bg-transparent items-center justify-center text-center border-2 rounded-2xl min-w-min max-w-max min-h-min max-h-max hover:border-blue-500 lg:right-72'><Link className='w-20 h-10 text-white p-2 hover:text-white' to="/register">Register</Link></div>
          <div className='container flex flex-col absolute bottom-1/4 left-10 w-2/3 justify-center justify-items-center bg-gradient-to-br from-purple-600 to-transparent rounded-2xl sm:w-1/2 md:w-2/5 lg:w-1/3 xl:w-1/4 right-2/3' >
            <div className='flex flex-col items-center justify-start w-full mt-5 text-white text-lg md:text-xl lg:text-2xl xl:text-2xl 2xl:text-3xl '><p className='flex w-5/6'>Log In</p></div>
            <form className='flex flex-col m-auto h-full w-full justify-center justify-items-center' onSubmit={handleSubmit}>
              <div className='flex flex-col items-center mt-5 w-full justify-center'>
                <label className="flex text-white mb-5 w-5/6 ml-1" htmlFor="email">Email:</label>
                <input className="flex text-white text-md mx-auto flex text-center items-center w-5/6 py-1.5 rounded-2xl bg-transparent border-solid border-2 border-indigo-600 md:text-lg lg:text-xl" placeholder='Enter Your Email Adress' style={{ '::placeholder': { color: 'gray', opacity: 0.5 } }} type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <br />
              <div className="flex flex-col items-center justify-center">
                <label className="flex text-white mb-5 w-5/6 ml-1 " htmlFor="password">Password:</label>
                <input className="flex text-white text-md text-center w-5/6 py-1.5 mx-auto rounded-2xl bg-transparent border-solid border-2 border-indigo-600 md:text-lg lg:text-xl" placeholder='Enter Your Password' type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <br />
              {error && <div className='loginError my-1 flex items-center text-red-200 justify-center text-center'>{error}</div>}
              <button className='block w-5/6 mx-auto mb-5 border-solid border-2 border-indigo-600' type="submit">Log in</button>
            </form>
          </div>
          <div className='container flex flex-col absolute z-10 bottom-10 items-center text-center left-1/2 min-w-min max-w-max min-h-min max-h-max justify-center lg:bottom-1/4 xl:left-2/3 ' style={{ transform: 'translateX(-50%)' }}>
            <p className='flex text-purple-100 italic text-2xl lg:text-7xl xl:text-8xl 2xl:text-9xl'>FIND YOUR LIPS</p>
            <p className='flex  py-1 text-purple-100 italic z-20 text-xl lg:text-3xl xl:text-4xl 2xl:text-5xl'>One step destination for finding your love</p>
          </div>
        </div>
        <div className='loginUsers flex flex-col w-full p-8 items-center justify-center 2xl:p-32 '>
          <h1 className='flex text-center items-center text-cyan-400 rounded-2xl drop-shadow-lg shadow-white m-2 text-5xl lg:text-6xl'>
            OUR MEMBERS
            </h1>
            <br className='bg-black shadow-xl shadow-white w-full h-1'/>
          <h1 className=' py-5 mb-5 text-center items-center text-3xl mt-4 text-purple-200 xl:text-4xl'>We have thousands of members waiting for you</h1>
          <div className='w-full mx-auto justify-items-center grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:gap-12'>

            <div className='flex w-full items-center justify-center mb-5 ' >
              <div className='flex h-40 w-40 rounded-full border-solid border-2 border-indigo-600 md:h-60 md:w-60 lg:h-80 lg:w-80 ' style={{
                backgroundImage: `url(${map.get("1")})`, backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
              }} ></div>
            </div>
            <div className='flex w-full items-center justify-center mb-5 '  >
              <div className='h-40 w-40 rounded-full border-solid border-2 border-indigo-600 md:h-60 md:w-60 lg:h-80 lg:w-80 ' style={{
                backgroundImage: `url(${map.get("2")})`, backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
              }}></div>
            </div>
            <div className='flex w-full items-center justify-center mb-5'  >
              <div className='h-40 w-40 rounded-full border-solid border-2 border-indigo-600 md:h-60 md:w-60 lg:h-80 lg:w-80 ' style={{
                backgroundImage: `url(${map.get("3")})`, backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
              }}></div>
            </div>
            <div className='flex w-full items-center justify-center mb-5' >
              <div className='h-40 w-40 rounded-full border-solid border-2 border-indigo-600 md:h-60 md:w-60 lg:h-80 lg:w-80 ' style={{
                backgroundImage: `url(${map.get("4")})`, backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
              }}></div>
            </div>
            <div className='flex w-full items-center justify-center mb-5' >
              <div className='h-40 w-40 rounded-full border-solid border-2 border-indigo-600 md:h-60 md:w-60 lg:h-80 lg:w-80 ' style={{
                backgroundImage: `url(${map.get("5")})`, backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
              }}></div>
            </div>
            <div className='flex w-full items-center justify-center mb-5' >
              <div className='h-40 w-40 rounded-full border-solid border-2 border-indigo-600 md:h-60 md:w-60 lg:h-80 lg:w-80 ' style={{
                backgroundImage: `url(${map.get("6")})`, backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
              }}></div>
            </div>
            <div className='flex w-full items-center justify-center mb-5'>
              <div className='h-40 w-40 rounded-full border-solid border-2 border-indigo-600 md:h-60 md:w-60 lg:h-80 lg:w-80 ' style={{
                backgroundImage: `url(${map.get("7")})`, backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
              }}></div>
            </div>
            <div className='flex w-full items-center justify-center mb-5' >
              <div className='h-40 w-40 rounded-full border-solid border-2 border-indigo-600 md:h-60 md:w-60 lg:h-80 lg:w-80 ' style={{
                backgroundImage: `url(${map.get("8")})`, backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
              }}></div>
            </div>

          </div>
        </div>
        <div className='flex flex-col w-full p-16 items-center justify-center bg-white'>
          <div className='flex flex-col items-center justify-center w-full md:flex-row'>
            <img className="flex w-full md:w-1/2 lg:w-1/3 order-2" src={IMG1} />
            <div className='flex flex-col text-black w-full min-h-min max-h-max items-center justify-center pt-2 md:w-1/2 p-4 '>
              <p className='flex text-center text-indigo-900 justify-center p-4 text-xl xl:text-2xl 2xl:text-3xl p-7 '>BEST MATCH
              </p>
              <p className='flex text-center justify-center xl:text-xl 2xl:text-2xl p-5'>Our system uses your location to identify the most suitable and optimal matches for you. We ensure the safety of your account by never disclosing your information to any third parties.
              </p>
            </div>
          </div>
          <div className='flex flex-col items-center justify-center w-full md:flex-row'>
            <div className='flex flex-col text-black w-full min-h-min max-h-max items-center justify-center pt-2 md:w-1/2 p-4'>
              <p className='flex text-center text-indigo-900 justify-center p-4 text-xl xl:text-2xl 2xl:text-3xl p-7 '>FULLY SECURE
              </p>
              <p className='flex text-center justify-center xl:text-xl 2xl:text-2xl p-5'>Our employees are always available to solve any of your problems. Innovative approach to working with clients, friendly staff, and many people open to communication.
              </p>
            </div>
            <img className="flex w-full md:w-1/2 lg:w-1/3" src={IMG2} />
          </div>
          <div className='flex flex-col items-center justify-center w-full md:flex-row'>
            <img className="flex w-full md:w-1/2 lg:w-1/3 order-2" src={IMG3} />    
            <div className='flex flex-col text-black w-full min-h-min max-h-max items-center justify-center pt-2 md:w-1/2 p-4'>
              <p className='flex text-center text-indigo-900 justify-center p-4 text-xl xl:text-2xl 2xl:text-3xl p-7'>FIND LOVE GUARANTEED
              </p>
              <p className='flex text-center justify-center xl:text-xl 2xl:text-2xl p-5'>Find your perfect match on our website with unique opportunities, innovative features, and thorough moderation. Start building strong relationships today!
              </p>
            </div>
          </div>
        </div>
      </div>
    }</div>)}
  </div>
  );
}
export default Login