import React, { useEffect, useState, useContext } from 'react';
import UserContext from '../UserContext';
import axios from 'axios';
import SocketContext from '../SocketConetxt';
import Cupidon from '../assets/cupid1.png'
import Kiss from '../assets/kiss1.png'
import Chocolate from '../assets/chocolate.png'
import Flowers from '../assets/bouquet1.png'
import Keys from '../assets/love-key1.png'
import Ring from '../assets/ring.png'
import Strawberry from '../assets/strawberry1.png'
import MONEY from "../assets/money.png"
import Error from "../components/Error"

const Window = ({ onClose, target, setOtherUser, otherUser,setError }) => {
  const token = localStorage.getItem("token")
  const [gifts, setGifts] = useState([])
  const [gift, setGift] = useState({})
  const [giftSent, setGiftSent] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { user, setUser } = useContext(UserContext);
  const { socket } = useContext(SocketContext)
  
  console.log("user", user)

  const myMap = new Map([
    ['Cupidon', Cupidon],
    ['Kiss', Kiss],
    ['Chocolate', Chocolate],
    ['Flowers', Flowers],
    ['Keys', Keys],
    ['Ring', Ring],
    ['Strawberry', Strawberry]
  ]);
  const handleGiftSend = async (gift) => {
    if(user.tokens < gift.Value){
      console.log("error and cannot send gift")
      setError("Not enought tokens!")
      return
    }
    // Check if the source person has enough tokens
    if (user.tokens >= gift.Value) {
      try {
        // Deduct tokens from the source person's balance
        const updatedBalance = user.tokens - gift.Value;
        // Make an API request to update the token balance on the server-side
        await fetch(`${import.meta.env.VITE_SERVER_URL}/user/updateBalance`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ balance: updatedBalance }),
        }).then(res => res.json())
          .then(data => {
            console.log(data)
            setUser({ ...user, tokens: updatedBalance })
          }).catch(err => {
            console.log(err)
          })
        console.log("user1111", user)
        // Send the gift to the target user
        /*await fetch(`http://localhost:3000/user/sendToUser`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ gift, from: {username: user.userName, image: user.mainImage}, target }),
        })*/

        await fetch(`${import.meta.env.VITE_SERVER_URL}/user/sendToUser`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ gift, from: { username: user.userName, image: user.mainImage }, target: target }),
        })
          .then((response) => response.json())
          .then(data => {
            setOtherUser({...otherUser, gifts: [{ gift, from: { username: user.userName, image: user.mainImage }, target: target } , ...otherUser.gifts]})
            // Gift updated successfully
            socket.emit("giftSent", (target))
            console.log('Gift updated');
            console.log('Gift sent successfully!');
            setGiftSent(true)

            setTimeout(() => {
              setGiftSent(false)
            }, 3000);
          }).catch(err => {

            // Failed to update gift
            console.log(err)
          })
        // Optionally, display a confirmation message or update the UI

      } catch (error) {
        console.error('Error sending gift:', error);
      }
    } else {
      console.log('Not enough tokens to send the gift!');
    }
  };


  const fetchData = async () => {
    await fetch(`${import.meta.env.VITE_SERVER_URL}/gifts/getGifts`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    })
      .then(response => response.json()) // Parse the response as JSON
      .then(data => {
        setGifts(data)
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }

  const handleSendClick = (gift) => {
    setShowConfirmation(true);
    setGift(gift)
  };

  const handleConfirmSend = () => {
    handleGiftSend(gift)
    setGift({}) // Call the logout handler passed from the parent component
    setShowConfirmation(false);
  };

  const handleCancelSend = () => {
    setShowConfirmation(false);
  };

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="flex flex-col items-center my-5 justify-center w-full xl:w-1/2" style={{
      background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100%25\' height=\'100%25\' viewBox=\'0 0 533 366\' fill=\'none\'%3E%3Cpath d=\'M0 30C0 13.4315 13.4315 0 30 0H503C519.569 0 533 13.4315 533 30V336C533 352.569 519.569 366 503 366H30C13.4315 366 0 352.569 0 336V30Z\' fill=\'url(%23paint0_linear_353_105)\' fill-opacity=\'0.8\'/%3E%3Cdefs%3E%3ClinearGradient id=\'paint0_linear_353_105\' x1=\'167.007\' y1=\'565.656\' x2=\'141.019\' y2=\'-106.015\' gradientUnits=\'userSpaceOnUse\'%3E%3Cstop stop-color=\'%23362759\'/%3E%3Cstop offset=\'1\' stop-color=\'%235601F4\' stop-opacity=\'0\'/%3E%3C/linearGradient%3E%3C/defs%3E%3C/svg%3E")',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
    }}>
      <div className="flex items-center justify-center flex-col">
        <h2 className='flex text-red-500 text-md justify-center my-3 xl:text-xl '>Choose a gift</h2>
        <div className='grid grid-cols-2'>{gifts.map((gift) => (
          <div className='flex flex-col items-center justify-center m-2 cursor-pointer' key={gift.Name} onClick={() => handleSendClick(gift)}>
            <img className='mb-2' src={myMap.get(gift.Name)} />
            <div className='flex flex-row items-center justify-center mb-1'>
              <span className='mx-1'>{gift.Value}</span>
              <img src={MONEY} />
            </div>
          </div>
        ))}
        </div>
        {showConfirmation && (
          <div className="fixed top-1/3 left-1/2 flex flex-col w-2/3 items-center text-center bg-gradient-to-b from-red-500 to-fuchsia-700 z-20 rounded-2xl p-1" style={{ transform: 'translateX(-50%)' }}>
          <p className=" italic text-white font-serif">Are you sure you want to send the gift?</p>
          <div className="flex flex-row items-center justify-center my-2">
              <button className="text-white cursor-pointer mr-2 bg-transparent rounded-2xl border-solid border-2 border-indigo-100" onClick={() => handleConfirmSend()}>Yes</button>
              <button className="text-white cursor-pointer ml-2 bg-transparent rounded-2xl border-solid border-2 border-indigo-100" onClick={() => handleCancelSend()}>No</button>
          </div>
      </div>
        )}
        {giftSent && (
          <div className='fixed bottom-1/2 flex rounded-2xl h-1/6 flex-col text-red-400 items-center justify-center bg-transparent'>
            <p>Gift sent successfully</p>
          </div>
        )}
        <button className='my-5 text-red-500 bg-transparent rounded-2xl border-solid border-2 border-indigo-100' onClick={onClose}>Close</button>
      </div>
    </div>
  );
};



export default Window;