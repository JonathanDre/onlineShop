import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import UserContext from '../UserContext';

const User = ({ user }) => {
  const {setUser} = useContext(UserContext)
  const token = localStorage.getItem("token")
  const handleImageError = (event) => {
    event.target.src = './123.jpg'; // Replace 'placeholder.jpg' with the path to your placeholder image
  };


  const addUser = async () => {

    await fetch("http://localhost:3000/user/addFriend", {
      method: "POST", 
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({user: user.userName})
    }).then((response) => response.json())
    .then((data) => {
        // Access the user information from the response data
        const user = data.user;
        setUser(user)
        console.log("userASDASDASDASDASDSADASD", user)
        // Do something with the user information
    })
    .catch((error) => {
        // Handle any errors
        console.error('Error fetching data:', error);
    });

  }
  return (
    <div>
      <h2>{user.userName}</h2>
      <button onClick={() => addUser(user)}>Add</button>
    </div>
  );
}

  export default User
