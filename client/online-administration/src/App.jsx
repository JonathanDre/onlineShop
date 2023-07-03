import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate  } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Shop from "./pages/Shop"
import Profile from "./pages/Profile"
import Authentication from './pages/Authentication';
import UserProfilePage from './components/UserProfilePage';
import UserContext from './UserContext';
import SocketContext from './SocketConetxt';
import { useState, useContext } from 'react'
import { NotificationProvider } from './NotificationContext';

//add error page
const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user , setUser] = useState(null)
  const [socket, setSocket] = useState(null);
  return (
    <Router>
      <UserContext.Provider value = {{user, setUser, isLoggedIn, setIsLoggedIn, isAuthenticated, setIsAuthenticated}}>
      <SocketContext.Provider value = {{socket, setSocket}}>
      <NotificationProvider>
      {/* Your app components */}
      <div>
        Navbar
        {isLoggedIn && <Link to="/home">Home</Link>}
        {!isLoggedIn && <Link to="/login">Login</Link>}
        {!isLoggedIn && <Link to="/register">Register</Link>}
        {isLoggedIn && <Link to="/shop">Shop</Link>}
        {isLoggedIn && <Link to="/profile">Profile</Link>}
      </div>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route
          path="/login"
          element={isLoggedIn || isAuthenticated ? <Navigate to="/home" /> : <Login setIsLoggedIn={setIsLoggedIn} setIsAuthenticated={setIsAuthenticated} setUser={setUser} />}
        />
        <Route path="/register" element={isLoggedIn || isAuthenticated ? <Navigate to="/home" /> : <Authentication setIsLoggedIn={setIsLoggedIn} setIsAuthenticated={setIsAuthenticated} setUser = {setUser}/>} />
        <Route path="/register/:myUserData" element={isLoggedIn || isAuthenticated ? <Navigate to="/home" /> : <Authentication setIsLoggedIn={setIsLoggedIn} setIsAuthenticated={setIsAuthenticated} setUser = {setUser}/>} />
        <Route path="/home" element={isLoggedIn || isAuthenticated ? <Home /> : <Navigate to= "/login"/> }/>
        <Route path="/shop" element={isLoggedIn ? <Shop /> : <Navigate to="/shop" />} />
        <Route path="/profile" element={isLoggedIn ? <Profile /> : <Navigate to="/profile" />} />
        <Route path="/users/:userId" element={<UserProfilePage/>} />
        <Route path="*" element={<h1>Page not found</h1>} />
      </Routes>
          </NotificationProvider>
      </SocketContext.Provider>
      </UserContext.Provider>
    </Router>
  );
};

export default App
