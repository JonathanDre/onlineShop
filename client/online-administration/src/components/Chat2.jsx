import React, { useEffect, useState, useContext, useRef, useCallback  } from "react";
import UserContext from './../UserContext';
import Peer from 'simple-peer'
import SocketContext from "../SocketConetxt";


const Chat2 = () => {
    const token = localStorage.getItem("token")
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [userList, setUserList] = useState([]);
    const {user, setUser} = useContext(UserContext);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [receivedImage, setReceivedImage] = useState(null);
    const [messageIndex, setMessageIndex] = useState(5);

    const [chatOpened, setChatOpened] = useState(false)
    const [visibleMessages, setVisibleMessages] = useState([]);

    


    const [isCallRejected, setIsCallRejected] = useState(false);
    const [timer, setTimer] = useState(null)
    const [isCalling, setIsCalling] = useState(false)
    const [stream, setStream] = useState(null);
    const [receiveingCall, setReceivingCall] = useState(false);
    const [caller, setCaller] = useState("");
    const [callerSignal, setCallerSignal] = useState("");
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [name, setName] = useState("");
    const [inChat, setInChat] = useState(false)

    const {socket} = useContext(SocketContext)
  
    const myVideo = useRef(null)
    const userVideo = useRef(null)
    const connectionRef = useRef(null)
    const peerRef = useRef(null);

  ///////////////SOKET//////////////////////
  useEffect(() => {
        

    if(user && userList) {

     setName(user.userName)

     // Event listeners for socket events
     
     socket.on('receiveImage', ({message,from, at, image, id, blured}) => {
         setReceivedImage(message);
         setMessages((prevMessages) => [...prevMessages, {message: message, from: from,id: id, at: at, image: image, blured: blured  }])
         console.log("receivedImage",receivedImage)
     });
     socket.on("chatInitiated", (message) => {
         console.log(message);
     })
     socket.on("disconnect", () => {
         console.log("Disconnected from Socket.IO server");
     });
     socket.on('privateMessage', ({message,userName}) => {
        // console.log(user.friendList)
         console.log("user.friendList", userList)
         
         const friendIndex = user.friendList.findIndex(Friend => Friend["userName"] === userName)
         console.log("friendIndex", friendIndex)
         console.log("user.friendlist[friendIndex]", user.friendList)
         const newestUser = user
         newestUser.friendList[friendIndex].messages.push(message)
         setUser(newestUser)
         console.log("user", newestUser)
         console.log(message)
         console.log(messages)
         setMessages((prevMessages) => [...prevMessages, message]);
     });
     socket.on('message', (message) => {
         console.log(message)
     });
     return () => {
        socket.off('receiveImage');
        socket.off('chatInitiated');
        socket.off('disconnect');
        socket.off('privateMessage');
        socket.off('message');
      };
     // Clean up the socket connection when the component is unmounted
     ;}
     
 }, [ userList]);
  ////////////////SOKET////////////////////


  ////////MESSSAGES/////////////////

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setSelectedImage(file);
};

const handleSendImage = () => {
    if (selectedImage) {
        const randomNumber = Math.floor(Math.random() * 10000000000000001);
        const reader = new FileReader();
        const timestamp = Date.now()
        const date = new Date(timestamp)
            const firebaseDate = date.toISOString()
        reader.onload = (event) => {
            const imageData = event.target.result;
            setMessages((prevMessages) => [...prevMessages, {message: imageData, from: "me", at: firebaseDate, image: true , blured: false }])
            socket.emit('sendImage', {data: imageData, friend: selectedFriend, id: randomNumber });
        };
        reader.readAsDataURL(selectedImage);
    }
};


  const handleMessageChange = (e) => {
    setMessage(e.target.value);
};

const handleMessageSubmit = (e) => {
    e.preventDefault();
    if (selectedFriend) {
        console.log("selectedFriend", selectedFriend)
        socket.emit('privateMessage', {
            friend: selectedFriend,
            message: message
        });
        const timestamp = Date.now()
        const date = new Date(timestamp)
        const firebaseDate = date.toISOString()
        setMessages((prevMessages) => [...prevMessages, {message: message, from: "me", at: firebaseDate}]);
        setMessage('');
    } else {
        console.log("no friend selected")// Handle sending message to general chat or display an error message
    }
};
  
  ////////MESSSAGES/////////////////

   // set The users from my Friend list
    /////////////FriendClick, FriendMessages///////////////
   const handleFriendClick = useCallback(async (friend) => {

    if (selectedFriend && selectedFriend.email === friend.email) {
        setSelectedFriend(null);
    } else {
        
        setSelectedFriend(friend);
        setMessageIndex(5)
        const updatedUserList = [...userList];
        const friendIndex = updatedUserList.findIndex((user) => user.email === friend.email);
        const [clickedFriend] = updatedUserList.splice(friendIndex, 1);
        updatedUserList.unshift(clickedFriend);
        setUserList(updatedUserList);
        await fetch("http://localhost:3000/user/updateList",{
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({friend: friend.userName})
        }).then((response)=>{
          console.log(response)
      }).catch((err)=>{
          console.log("error", err)
      })
        const friendInfo = userList.find((Friend) => Friend.email === friend.email);
        await fetchSelectedFriend();
        setMessages(friendInfo.messages);
        socket.emit('startChat', friend);
        }
    // Fetch the conversation data for the selected friend
    // and update the conversation section
    // ...
    },[selectedFriend, userList, setUserList, setUser, socket]);

    const handleLoadMoreMessages = useCallback (() => {
        setMessageIndex((prevIndex) => Math.max(0, prevIndex + 5));
      }, []);
/////////////////////Friend Finished///////////////////

    ///////////////////////////////////////////
    useEffect(() => {
        console.log("user", user)
        if(user){
            console.log("socket", socket)
            setUserList(user.friendList)
        }
        console.log("userList", user.friendList)
    }, [user])
    //////////////////////////////////

    useEffect(() => {
        if (messages && messages.length > 0) {
            const startIndex = Math.max(0, messages.length - messageIndex);

            if(messages.length < messageIndex){
                setVisibleMessages(messages.slice(messages.length - 1));
                console.log("setVisibleemessages", messages)

            }else{

                console.log("setVisibleemessages", messages)
                setVisibleMessages(messages.slice(startIndex));
            }
        }
      }, [messages, messageIndex, userList, selectedFriend]);
      ///////////////////////////////////////////

      const fetchSelectedFriend = useCallback (async () => {
        
                await fetch("http://localhost:3000/user/currentuser", {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            },
              })
              .then(response => response.json()) // Parse the response as JSON
              .then(data => {
                setUser(data)
              })
              .catch(error => {
              console.error('Error fetching data:', error);
              });
              

      }, [setUser, token])
      useEffect(()=> {
        if(selectedFriend){
            fetchSelectedFriend()
        }
      }, [selectedFriend])

      useEffect(()=> {
        if(token){

            fetchSelectedFriend()
        }
      }, [token])

      const unblockImage = async (message) => {

        await fetch('http://localhost:3000/user/updateUnlockPhoto', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({id: message.id, price: 50, from: selectedFriend.userName})
        }).then(response => response.json()) // Parse the response as JSON
        .then(data => {
          console.log(data)
        })
        .catch(error => {
        console.error('Error fetching data:', error);
        });
        // Handle click event for blurred images
        console.log('Image clicked:', message.id);
        // Perform any other actions you want
      };

      const imageStyle = {
        filter: 'blur(20px)',
      };

      const toggleChat = () => {
        setChatOpened(prev => !prev)
      }
    return (
        <>

        <button onClick={toggleChat}>Chat</button>
        <div>{chatOpened && (<div>
    {userList && (
      <div className="chat" style={{ display: "flex", flexDirection: "row" }}>
        <div className="friendsList">
          {userList.map((user) => (
            <div
              key={user.userName}
              onClick={() => handleFriendClick(user)}
              className={`friend ${
                selectedFriend && selectedFriend.email === user.email ? "active" : ""
              }`}
            >
              {user.userName}
            </div>
          ))}
        </div>
        {selectedFriend && selectedFriend.email && (
          <>
            <div className="messages">
              {messages && messages.length > messageIndex && (
                <button onClick={handleLoadMoreMessages}>Load More</button>
              )}
              {visibleMessages.map((message, index) =>
                message.image ? (
                    message.blured ? (

                        <div key={message.id}>
                    { 
                      <img style={imageStyle} onClick={() => unblockImage(message)} src={message.message} alt="Received Image" />
                    }
                  </div>
                    ): (<div key={message.id}>
                        { 
                          <img src={message.message} alt="Received Image" />
                        }
                      </div>)
                ) : (
                  <div key={index}>
                    <p>{message.message}</p>
                  </div>
                )
              )}
            </div>
            <div className="sendMessageInput">
              <form onSubmit={handleMessageSubmit}>
                <input type="text" value={message} onChange={handleMessageChange} />
                <button type="submit">Send</button>
              </form>
            </div>
            <div className="sendImage">
              <input type="file" onChange={handleImageChange} />
              <button onClick={handleSendImage}>Send Image</button>
            </div>
          </>
        )}
      </div>
    )}
    </div>)}
    </div>
  </>
    )
}

export default Chat2;