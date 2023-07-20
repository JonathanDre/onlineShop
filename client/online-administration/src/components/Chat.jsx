import React, { useEffect, useState, useContext, useRef } from "react";
import io from "socket.io-client";
import UserContext from './../UserContext';
import VideoChat from "./VideoChat";
import Peer from 'simple-peer'
import SocketContext from "../SocketConetxt";
import ChatContext from "../ChatContext";

const Chat = () => {

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const {user, setUser} = useContext(UserContext);
    const [userList, setUserList] = useState([]);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [receivedImage, setReceivedImage] = useState(null);
    const [visibleMessages, setVisibleMessages] = useState([]);
    const [messageIndex, setMessageIndex] = useState(5);
    const [isCallRejected, setIsCallRejected] = useState(false);
    const {inCall, setInCall,isReceiveingCall, setIsReceiveingCall,isCalling, setIsCalling} = useContext(ChatContext)
    const [updateInchat, setUpdateInChat] = useState(false)
    //////////////////////////////////////////
    const [me, setMe] = useState("");

    const [timer, setTimer] = useState(null)
    //const [isCalling, setIsCalling] = useState(false)
    const [stream, setStream] = useState(null);
   
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


    useEffect(()=>{
        if (timer) {
            clearTimeout(timer); // Clear previous timer
          }
      
          if (selectedFriend && isCalling) {
            const newTimer = setTimeout(() => {
              declineAuto();
            }, 30000); // Set timer for 30 seconds
            setTimer(newTimer);
          }
    },[isCalling, selectedFriend])
      
    useEffect(()=> {
        if (socket) {
            
            socket.on("callUser", (data) => {
                console.log("data", data)
                setCallAccepted(false);
                setIsCallRejected(false)
                setIsReceiveingCall(true)
                setCaller(data.from)
                setCallerSignal(data.signal)
            })

            socket.on("autodecline", ()=> {
                setIsCallRejected(true)
                setIsReceiveingCall(false)
                setCallEnded(true)
                setCaller("")
                setCallerSignal("")
                setCallAccepted(false);
            })
           
            socket.on("leaveCall", () => {
                // If the user is in a call and receives a leaveCall event,
                // it means the other participant has left the call,
                // so we need to leave the call as well
                
                  leaveCallReceived();
                
              });
            
              socket.on("declined", ()=> {
                setIsCallRejected(true)
                setCallEnded(true)
                setCallAccepted(false)
                setIsCalling(false)
                setInCall(false)

                
        
                if (connectionRef.current) {
                    
                    console.log("connection destroyed")
                  }

                  
    
            })

            socket.on("cancelCall", ()=>{
                setIsCallRejected(true)
                setCallEnded(true)
                setCallAccepted(false)
                setIsCalling(false)
                
            })
        
    }
        }, [socket, inChat ])
        const callUser = (id) => {
            setCallAccepted(false)
            setCallEnded(false)
            setIsCallRejected(false)
            setInCall(true)
           
           
            navigator.mediaDevices.getUserMedia({video: true, audio: true}).then((stream1) => {
                setStream(stream1)
                console.log("stream", stream)
                console.log("stream1 in callUser", stream1)
                const peer = new Peer ({
                    initiator: true,
                    trickle: false,
                    stream: stream1
                    
                })
             
                console.log("peer in callUser", peer)
                
                peer.on("signal", (data) => {
                console.log("there is a signal and the user To Call is :", id )
                socket.emit ("callUser", {
                    userToCall: id,
                    signalData: data,
                    from: user.userName,
                    name: name
                })
                setIsCalling(true)
            })
            peer.on('close', () => { console.log('peer closed'); socket.off("callAccepted"); socket.off("callUser") });
            peer.on("stream", (stream2) => {

                console.log("in the on Stream1: ", stream1)
                console.log("in the on Stream2: ", stream2)
                myVideo.current.srcObject = stream1
                    userVideo.current.srcObject = stream2  
            })
           
            connectionRef.current = peer;
            
            socket.on("callAccepted", (signal) => {
                console.log("Received signal:", signal);
                console.log("Peer:", peer);
                setIsCallRejected(false)
                setCallEnded(false)
                setCallAccepted(true),
                setInChat(true)
                setIsCalling(false)
                
                peer.signal(signal);

            })
            
        }).catch((error) => {
            console.error('Error accessing media devices:', error);
          });
        }
        
        
        const declineAuto = () => {
            setIsCalling(false)
            setCallEnded(true)
            setIsCallRejected(true)
            setInCall(false)
            if (timer) {
                clearTimeout(timer);
              }
              socket.emit("autodecline", (selectedFriend.userName))
              ///
        }

        const declineCall = () => {
            setIsCallRejected(true)
            socket.emit("declined",(caller), (error) => {
                console.log("error",error)
                return 
              })
              if (connectionRef.current) {
                
              }
              setIsReceiveingCall(false)
                setCallEnded(true)
                setCaller("")
                setCallerSignal("")
                setCallAccepted(false);
                
        }
        
        const answerCall = () => {
            setCallAccepted(true)
            setCallEnded(false)
            setIsReceiveingCall(false)
            setIsCallRejected(false)
            setInCall(true)

            navigator.mediaDevices.getUserMedia({video: true, audio: true}).then((stream1) => {
                setStream(stream1)

                    console.log("stream", stream)
                    const peer = new Peer ({
                        initiator: false,
                        trickle: false,
                        stream: stream1
                        
                    })
                    
                    peer.on("signal", (data) => {
                        socket.emit("answerCall", {signal: data, to: caller})
                        setInChat(true)
                    })
                    
                    peer.on("stream", (stream2) => {
                        myVideo.current.srcObject = stream1
                        userVideo.current.srcObject = stream2
                    })
                    
                    
                    peer.signal(callerSignal)
                    
                    connectionRef.current = peer
                }).catch((error) => {
                    console.error('Error accessing media devices:', error);
                });
            }
            
    useEffect(()=> {
        if(stream && isCallRejected ){

            stopCameraStream(stream)

            
        }
    }, [stream, isCallRejected])


    const stopCameraStream = (stream) => {
        console.log("stream", stream)
        const tracks = stream.getTracks();
        tracks.forEach((track) => {
          track.stop();
        });
      };

      const leaveCallSooner = () => {
        setIsCalling(false)
        setInCall(false)
        socket.emit("cancelCall", (selectedFriend.userName))
        setIsCallRejected(true)
        setCallEnded(true);
        setInChat(false)
        setCallAccepted(false); // Reset callAccepted state
        setCaller(""); // Reset caller state
        setCallerSignal("");
        /*if (connectionRef.current) {
            connectionRef.current.destroy();
          }*/
          //window.location.reload()
      }
    
    const leaveCallSent = () => {
        console.log("myVideo", myVideo)
        console.log("userVideo", userVideo)
        myVideo.current.srcObject = null; // Clear local video display
        userVideo.current.srcObject = null;
        console.log("caller", caller)
        if(caller !== "" && caller !== null){
            socket.emit("leaveCall", (caller))
        }else{
            socket.emit("leaveCall", (selectedFriend.userName))
           
        }
        setCallEnded(true);
        setInChat(false)
        setIsCallRejected(true)
        setInCall(false)
        //connectionRef.current.destroy();
        setCallAccepted(false); // Reset callAccepted state
        setCaller(""); // Reset caller state
        setCallerSignal(""); // Reset callerSignal state
        if (connectionRef.current) {
            connectionRef.current.destroy();
          }
         
          
        //window.location.reload()
  
    }

    const leaveCallReceived = () => {
        console.log("myVideo", myVideo)
        console.log("userVideo", userVideo)
        myVideo.current.srcObject = null; // Clear local video display
        userVideo.current.srcObject = null;
        // connectionRef.current.destroy();
        setCallEnded(true);
        setInCall(false)
        setInChat(false)
        setCallAccepted(false); // Reset callAccepted state
        setIsCallRejected(true)
        setCaller(""); // Reset caller state
        setCallerSignal(""); // Reset callerSignal state
        if (connectionRef.current) {
            connectionRef.current.destroy();
          }
      
        //window.location.reload()
  
    }
    
    
    const handleImageChange = (event) => {
        const file = event.target.files[0];
        setSelectedImage(file);
    };
    
    const handleSendImage = () => {
        if (selectedImage) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const imageData = event.target.result;
                socket.emit('sendImage', {data: imageData, friend: selectedFriend });
            };
            reader.readAsDataURL(selectedImage);
        }
    };
    
    const handleFriendClick = (friend) => {
        
        console.log("friend",friend)
        console.log("user.friendList",user.friendList)
        setSelectedFriend(friend);
        const friendInfo = userList.find(Friend => Friend["userName"] === friend.userName)
        console.log("friendInfo", friendInfo)
        setMessages(friendInfo.messages)
        
        console.log(messages)
        socket.emit('startChat', friend);
        // Fetch the conversation data for the selected friend
        // and update the conversation section
        // ...
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

    
    
    useEffect(() => {
        

       if(user && userList) {

        setName(user.userName)

        // Event listeners for socket events
        
        socket.on('receiveImage', ({message,from, at}) => {
            setReceivedImage(message);
            setMessages((prevMessages) => [...prevMessages, {message: message, from: from, at: at, image: true  }])
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
    }, [user, userList]);

    const handleLoadMoreMessages = () => {
        setMessageIndex((prevIndex) => Math.max(0, prevIndex + 5));
      };

    useEffect(() => {
        console.log("user", user)
        if(user && socket.connected){
            console.log("socket", socket)
            setUserList(user.friendList)
        }
        console.log("userList", user.friendList)
    }, [user, socket])

    /*useEffect(() => {
        if(user.friendList){
            setUserList(user.friendList)
        }
    }, [user, messages])*/

    useEffect(() => {
        if (messages.length && messages.length > 0) {
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

      
          /*useEffect(() => {
            console.log("userList", userList)
              if (!selectedFriend && userList.length > 0 && userList.length) {
                setSelectedFriend(userList[0]);
              }
            }, [userList, selectedFriend]);*/

            /*useEffect(() => {
                console.log("userList", userList)
                //maybe user and userList
                  if (selectedFriend ) {
                    const friendInfo = userList.find(Friend => Friend["userName"] === selectedFriend.userName)
                    setMessages(friendInfo.messages)
                  }
                }, [selectedFriend]);*/
    

    // Component render and logic
    return (
        <div className="chat">
            <div className="user-list">
                {userList && userList.map((user) => (
                    <div
                        key={user.email}
                        onClick={() => handleFriendClick(user)}
                        className={`friend ${selectedFriend && selectedFriend.email === user.email ? 'active' : ''}`}
                    >
                        {user.userName}
                    </div>
                ))}
            </div>
            <div className="conversation-section">
                {true ? (
                        <div>
                           
                                <div className="videoChat">
                            {callAccepted && !callEnded && (
  <div className="video">
    { <video playsInline muted ref={myVideo} autoPlay style={{ width: "300px" }} />}
  </div>
)}
                            <div className="video">
                                {callAccepted && !callEnded && <video playsInline ref={userVideo} autoPlay style = {{width: "300px"}} />  }
                            </div>
                        </div>
                            
                        <div>{ isReceiveingCall && (<button onClick={declineCall}>Decline</button>)}</div>
                        <div>{ isReceiveingCall && (<button onClick={answerCall}>Answer</button>)}</div>
                        <div>{ inCall ? (<button onClick={leaveCallSent}>Leave</button>) : null}</div>
                        <div>{ isCalling ? (<button onClick={leaveCallSooner}>Cancel</button>) : null}</div>
                        <div>{(<button onClick={() => callUser(selectedFriend.userName)}>Call</button>)}</div>
                        <div></div>
                        <div>
                            <div>
                            {messages.length > messageIndex && (
      <button onClick={handleLoadMoreMessages}>Load More</button>
    )}
                            {visibleMessages && visibleMessages.map((message, index) => message.image ? (<div>
                            {message.image && <img key = {message.id} src={message.message} alt="Received Image" />}
                        </div>) : (
  <div key={index}>
    <p>{message.message}</p>
  </div>
))}
    {visibleMessages.map((message, index) =>
                message.image ? (
                    message.blured ? (

                        <div key={message.id}>
                    { 
                      <img src={message.message} alt="Received Image" />
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
 
                            <form onSubmit={handleMessageSubmit}>
                                <input type="text" value={message} onChange={handleMessageChange} />
                                <button type="submit">Send</button>
                            </form>
                        </div>
                        
                        
                        <input type="file" onChange={handleImageChange} />
                        <button onClick={handleSendImage}>Send Image</button>
                    </div>

                ) : (
                    <div className="no-friend-selected">Select a friend to start a conversation</div>
                )}
            </div>
        </div>
    );
};

export default Chat;