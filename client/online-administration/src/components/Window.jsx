import React, {useEffect, useState, useContext} from 'react';
import UserContext from '../UserContext';
import axios from 'axios';
const Window = ({ onClose , target}) => {
    const token = localStorage.getItem("token")
    const [gifts, setGifts] = useState([])
    const [gift, setGift] = useState({})
    const [giftSent, setGiftSent] = useState(false)
    const [showConfirmation, setShowConfirmation] = useState(false);
    const {user} = useContext(UserContext);
    console.log("user", user)
    const handleGiftSend = async (gift) => {
        // Check if the source person has enough tokens
        if (user.tokens >= gift.Value) {
          try {
            // Deduct tokens from the source person's balance
            const updatedBalance = user.tokens - gift.Value;
            // Make an API request to update the token balance on the server-side
            await fetch('http://localhost:3000/user/updateBalance', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ balance: updatedBalance }),
            }).catch(err =>{
                console.log(err)
            })
            console.log("user1111",user)
            // Send the gift to the target user
            /*await fetch(`http://localhost:3000/user/sendToUser`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ gift, from: {username: user.userName, image: user.mainImage}, target }),
            })*/

              await fetch('http://localhost:3000/user/sendToUser', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ gift, from: { username: user.userName, image: user.mainImage }, target }),
              })
                .then((response) => {
                  if (response.ok) {
                    // Gift updated successfully
                    console.log('Gift updated');
                  } else {
                    // Failed to update gift
                    return response.json();
                  }
                })
                .catch((error) => {
                  console.error('Error:', error);
                });
            // Optionally, display a confirmation message or update the UI
            console.log('Gift sent successfully!');
            setGiftSent(true)

            setTimeout(() => {
              setGiftSent(false)
          }, 3000);
          } catch (error) {
            console.error('Error sending gift:', error);
          }
        } else {
          console.log('Not enough tokens to send the gift!');
        }
      };


    const fetchData = async () => {
        await fetch("http://localhost:3000/gifts/getGifts", {
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

      useEffect( () => {
        fetchData()
      }, [])

  return (
    <div className="popup-window">
      <div className="popup-content">
      <h2>Gifts</h2>
      {gifts.map((gift) => (
        <div key={gift.Name}>
          <span>{gift.Name}</span>
          <span>{gift.Value}</span>
          <button onClick={() => handleSendClick(gift)}>Send Gift</button>
        </div>
      ))}
      {showConfirmation && (
        <div>
          <p>Are you sure you want to send?</p>
          <button onClick={handleConfirmSend}>Yes</button>
          <button onClick={handleCancelSend}>No</button>
        </div>
      )}
      {giftSent && (
        <div>
          <p>Gift sent successfully</p>
        </div>
      )}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};



export default Window;