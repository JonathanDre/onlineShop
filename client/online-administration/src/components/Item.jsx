import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import UserContext from '../UserContext';

const ItemComponent = ({ item }) => {
  const token = localStorage.getItem("token")
  const {user} = useContext(UserContext)
  const handleClick = async (item) => {
      await fetch("http://localhost:3000/subscriptions/create-checkout-session", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify([{
              item: item,
              quantity: 1,
              user: user.userName
          }]),
      }).then(res => {
          if (res.ok) return res.json()
          return res.json().then(json => Promise.reject(json))
      })
          .then(({ url }) => {
              window.location = url
          })
  
      console.log(item)
  };

  return (
    <div>
      <h2>{item.data.name}</h2>
      <button onClick={() => handleClick(item)}>Add to Cart</button>
    </div>
  );
}

  export default ItemComponent
