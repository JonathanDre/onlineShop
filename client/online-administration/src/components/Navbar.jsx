import React, { useContext, useState } from 'react';
import UserContext from './../UserContext';
import LogoutButton from './LogoutButton';
import {NotificationContext} from "../NotificationContext"
const Navbar = () => {
  const {user} = useContext(UserContext)
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { notifications, removeNotification } = useContext(NotificationContext);


  const handleDismiss = (id) => {
    removeNotification(id);
  };


  const handleLogoutClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmLogout = () => {
    handleLogout(); // Call the logout handler passed from the parent component
  };

  const handleCancelLogout = () => {
    setShowConfirmation(false);
  };

  return (
    <div>

<div className="notifications">
        {notifications && notifications.map((notification) => (
          <div key={notification} className="notification">
            {notification}
            <button onClick={() => handleDismiss(notification.id)}>Dismiss</button>
          </div>
        ))}
      </div>
      <nav>
      {user && (<div><div>{user.tokens}</div>
      <div>{user.email}</div></div>)}
    </nav>
      {/* Render your navigation links */}

      {
        <button onClick={handleLogoutClick}>Logout</button>
      }

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div>
          <p>Are you sure you want to log out?</p>
          <LogoutButton/>
          <button onClick={handleCancelLogout}>No</button>
        </div>
      )}
    </div>
  );
    
};

export default Navbar;