import React, { useContext, useEffect, useState } from 'react';
import UserContext from './../UserContext';
import LogoutButton from './LogoutButton';
import { useNavigate } from 'react-router-dom';
import { NotificationContext } from "../NotificationContext"
import TokenContext from '../TokenContext';
import MONEY from "../assets/money.png"
import { Link, useParams } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import logoNav from "../assets/logoNav.png"
import logoNav2 from "../assets/logoNav2.png"
const Navbar = (isLoggedIn) => {
  const { user } = useContext(UserContext)
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { notifications, clearNotifications, setAllNotifications } = useContext(NotificationContext);
  const { token } = useContext(TokenContext)
  const [showNotifications, setShowNotifications] = useState(false)
  const navigate = useNavigate();
  const handleLogoutClick = () => {
    setShowConfirmation((prev) => !prev);
  };

  const clearAllNotifications = () => {
    ; // Call the logout handler passed from the parent component
    clearNotifications(token)
  };

  const handleCancelLogout = () => {
    setShowConfirmation(false);
  };

  const handleNotifications = () => {
    setShowNotifications((prev) => !prev)
  }
  const handleDivClick = () => {
    // Call the navigate function to redirect to a different route
    navigate('/shop');
  };

  useEffect(() => {
    if (user) {
      setAllNotifications(user.notifications)
    }
  }, [user])

  return (
    <div className='fixed top-0 w-full flex flex-row flex-wrap items-center justify-center h-10 text-black' style={{ background: "#000025" }}>
      <div className=' flex flex-row flex-1 ml-1 items-center h-full'>
        {isLoggedIn && <Link className='flex items-center h-full text-white' to="/home"><img className='h-10 h-full min-w-10' src={logoNav2}/></Link>}
        {/*!isLoggedIn && <Link to="/login">Login</Link>}
        {!isLoggedIn && <Link to="/register">Register</Link>}*/}
        {isLoggedIn && <Link className='text-white ml-2' to="/gallery">Gallery</Link>}
      </div>
      <div className='h-full flex-1 flex flex-col items-center justify-center' onClick={handleDivClick}>
        {user && (<div className='flex flex-row h-full items-center'>
          <p className='flex ml-px mr-px items-center italic justify-center text-white'>{user.tokens}</p>
          <img className='flex my-1 items-center justify-center' src={MONEY} />
        </div>)}
      </div>
      <div className='flex flex-1 flex-row items-center h-full justify-center'>
        {notifications.length === 0 && <button className='bg-transparent p-0 hover:none' onClick={handleNotifications} ><NotificationsNoneIcon className='text-white' /></button>}
        {notifications.length !== 0 && <button className='bg-transparent p-0' onClick={handleNotifications} ><NotificationsIcon fontSize='medium' className='text-red-500' /></button>}
        {showNotifications && <div className="absolute top-full w-1/2 right-5 bg-indigo-900 rounded-2xl flex flex-col text-white items-center justify-center text-center">
          {notifications.length !== 0 && notifications.map((notification) => (
            <div className="flex flex-row">
              <Link to={`/users/${notification.from}`} className='my-1'>{notification.from}</Link>
              <p className='my-1'>{notification.message}</p>
            </div>
          ))}
          {notifications.length !== 0 && <DeleteOutlineOutlinedIcon className='flex h-4/5 items-center opacity-50 ' onClick={clearAllNotifications} />}
        </div>}
        {isLoggedIn && <Link className='flex h-4/5 w-8 mx-2 border border-indigo-900 items-center justify-center rounded-full' to="/profile"><img className='w-full h-full rounded-2xl' src={user.mainImage.url} /></Link>}
        <LogoutIcon fontSize='medium' className='flex mx-px h-full items-center justify-center text-center bg-transparent text-white hover:text-blue-200 hover:rounded-full' onClick={handleLogoutClick} />
      </div>

      {showConfirmation && (
        <div className='absolute top-10 right-0 p-2 text-white flex flex-col bg-indigo-900 rounded-2xl items-center justify-center '>
          <p className='flex my-1'>Are you sure you want to log out?</p>
          <div className='flex flex-row justify-around w-full'>
            <LogoutButton/>
            <button className='flex bg-transparent border border-white text-center rounded-2xl' onClick={handleCancelLogout}>No</button>
          </div>
        </div>
      )}
    </div>
  );

};

export default Navbar;