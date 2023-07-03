import axios from 'axios';
import { useState, useEffect } from 'react'
import { useLocation} from 'react-router-dom';
import User from '../components/User'
import Socket from "../Socket"

import { BrowserRouter as Router, Route, Routes, Link, Navigate } from "react-router-dom";
import { useContext } from 'react';
import UserContext from '../UserContext';
import SocketContext from '../SocketConetxt';

function Login({setIsLoggedIn, setUser,setIsAuthenticated}) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const location = useLocation();
    const {isAuthenticated} = useContext(UserContext)
    const [userData, setUserData] = useState({})
    const {socket, setSocket} = useContext(SocketContext)
    const [userClicked, setUserClicked] = useState(null)

    const fetchData = async () => {
      await fetch("http://localhost:3000/user/homeLogin", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  }
  })
  .then(response => response.json()) // Parse the response as JSON
  .then(data => {
    console.log("data", data)
    setUserData(data);
    setSocket(Socket) // Set the data in the state
    
    console.log("response", userData);
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });
  }
    useEffect( () => {
      fetchData()
    }, [])


    const handleSubmit = async (event) => {
      event.preventDefault();
      try {
        const res = await axios.post('http://localhost:3000/auth/signin', { email, password });
        localStorage.setItem("token", res.data.token);
        setIsLoggedIn(true)
        console.log("change½")
        setIsAuthenticated(true)
        console.log("change", setIsAuthenticated)
        localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("isAuthenticated", "true");
        setUser(res.data.message)
        localStorage.setItem('user', JSON.stringify(res.data.message));
      }catch(error) {
        console.log(error)
      }

      // do something with email and password, like send them to a backend API
    };

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
useEffect(()=>{
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const token = localStorage.getItem('token');
    if (isLoggedIn && token) {

      const tokenExpiration = getTokenExpiration(token);
      if (tokenExpiration < Date.now()) {
        // Token has expired, clear local storage
        clearLocalStorage();
        return;
      }
      setIsLoggedIn(true);
      setIsAuthenticated(true);
      // Set the user data from localStorage or fetch it from the backend
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
        setSocket(Socket)
      } else {
        // Fetch the user data from the backend using the stored token
        fetchUserData();
      }
    }
  }, [setIsLoggedIn, setIsAuthenticated, setUser]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3000/user/currentuser', {
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


  
    return (
      <div>
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <br />
        <label>
          Password:
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <br />
        <button type="submit">Submit</button>
      </form>
{userData && userData.users && userData.users.map(user => (
  <div key={user.email}>
          <div >
         {<User user = {user}/>}
    </div>
  </div>
))} 
      
</div>
    );
  }
  export default Login