import React, { createContext, useState } from 'react';

// Create the context
const NotificationContext = createContext();

// Create the provider
const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Add a new notification
  const addNotification = (notification) => {
    setNotifications([ notification, ...[notifications]]);
  };

  const setAllNotifications = async (notifications) => {
    setNotifications(notifications)
  }

  // Remove a notification
  
  // Clear all notifications
  const clearNotifications = async (token) => {
    await fetch(`${import.meta.env.VITE_SERVER_URL}/user/clearNotifications`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      }
    }).then(()=> {
    setNotifications([]);
    }).catch(error => {
      console.log(error)
    })
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        
        clearNotifications,
        setAllNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export { NotificationContext, NotificationProvider };