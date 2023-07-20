import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import UserContext from '../UserContext';
import Silver from '../assets/Silver.png'
import Gold from '../assets/Gold.png'
import Diamond from '../assets/Diamond.png'
import Ruby from '../assets/Ruby.png'
import MONEY from "../assets/money.png"
const ItemComponent = ({ item }) => {

  const myMap = new Map([
    ['Silver', Silver],
    ['Gold', Gold],
    ['Diamond', Diamond],
    ['Ruby', Ruby]
  ]);


  const myNewMap = new Map([
    ["Gold", "#FFD700"],
    ["Ruby", "#E53252"],
    ["Diamond", "#0D98BA"],
    ["Silver", "#C0C0C0"],
  ],)

  const token = localStorage.getItem("token")
  const { user } = useContext(UserContext)
  const handleClick = async (item) => {
    await fetch(`${import.meta.env.VITE_SERVER_URL}/subscriptions/create-checkout-session`, {
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
    <div className='flex flex-col mx-2 items-center justify-center'>
      <p className='my-2 text-2xl rounded-full w-1/2 italic' style={{ color: myNewMap.get(item.data.name) }}>{item.data.name}</p>
      <img src={myMap.get(item.data.name)} />
      <div className='flex flex-row my-3'>
        <p className='flex my-2 text-2md mx-1 rounded-full w-1/2 italic' style={{ color: myNewMap.get(item.data.name) }}>{item.data.value}</p>
        <img className='flex mx-1' src = {MONEY} />
      </div>
      <button className='text-red-500 bg-transparent rounded-2xl border-solid border-2 border-indigo-100 cursor-pointer' onClick={() => handleClick(item)} style={{ color: myNewMap.get(item.data.name) }}>{item.data.price/100}$</button>
    </div>
  );
}

export default ItemComponent
