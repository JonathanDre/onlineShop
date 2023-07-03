import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Window from './Window';
import { Navigate } from 'react-router-dom';
import SocketContext from '../SocketConetxt';
import UserContext from '../UserContext';
import Socket from "../Socket"
const UserProfilePage = () => {
  const token = localStorage.getItem("token")
  const { userId } = useParams();
  const [otherUser, setOtherUser] = useState(null);
 const {socket, setSocket} = useContext(SocketContext)
 const [liked, setLiked] = useState(false)
 const {user, setUser} = useContext(UserContext)

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

 const giveLike = async () => {
  try {
    console.log(token)
    const url = `http://localhost:3000/users/updateLike`;
      console.log('Fetch URL:', url);
      const response = await fetch("http://localhost:3000/user/updateLike",{
        method: "POST",  
      headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body:JSON.stringify({userId})
      }).then(response => response.json());
      console.log("response from fetchUser", response)
      if (socket){
        socket.emit("liked", ({userId, myId: user.userName}))
console.log("liked to:" ,userId)
console.log("liked by:" ,user.userName)
      }
  }catch(err){
    console.log(err)
  }
 }


  const fetchUser = async () => {
    
    try {
      const url = `http://localhost:3000/users/${userId}`;
      console.log('Fetch URL:', url);
      const response = await axios.get(`http://localhost:3000/user/${userId}`,{
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        }
      });
      console.log("response from fetchUser", response)
      const userData = response.data;
      console.log("userData", userData)
      setOtherUser(userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    
    fetchUser();
  }, [userId]);

  if (!otherUser) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>User Profile</h2>
      <p>Name: {otherUser.name}</p>
      <p>Email: {otherUser.email}</p>
      <button onClick={giveLike}>Give like</button>
      {/* Add more user details here */}
      <div>
      

      {otherUser.gifts && otherUser.gifts.map(gift =>(
        <div>
          <div>{gift.from.username}</div>
        <img src = {gift.from.image.url}/>
        </div>

      ))}
    </div>
    </div>
  );
};

export default UserProfilePage;
