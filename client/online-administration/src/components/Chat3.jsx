import React, { useEffect, useState, useContext, useRef, useCallback } from "react";
import UserContext from './../UserContext';
//import Peer from 'simple-peer'
import SocketContext from "../SocketConetxt";
import MessageNotifContext from "../MessageNotifContext";
import ImageContext from "../ImageContext";
import ChatContext from "../ChatContext";
import CHAT from "../assets/CHAT.png"
import CloseIcon from '@mui/icons-material/Close';
import girl1 from "../assets/girl1.png"
import { storage } from './../../firebaseConnect.js';
import { deleteObject, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { v4 as uuidv4 } from 'uuid';
import ImageIcon from '@mui/icons-material/Image';
import SendIcon from '@mui/icons-material/Send';
import replace from "../assets/replace.jpg"
import Lock from "../assets/Lock.png"
import MicNoneIcon from '@mui/icons-material/MicNone';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import PhoneEnabledOutlinedIcon from '@mui/icons-material/PhoneEnabledOutlined';
import Error from "../components/Error"
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import onlineContext from '../onlineContext';
import { Peer } from "peerjs";
import { selectClasses } from "@mui/material";
const Chat3 = () => {
    const [wantsToSendImage, setWantstoSendImage] = useState(false)
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [unblockedImage, setUnblockedImage] = useState(null)
    const [purchased, setPurchased] = useState(false)
    const { socket } = useContext(SocketContext)
    const token = localStorage.getItem("token")
    const [selectedFriend, setSelectedFriend] = useState({})
    const [friendList, setFriendList] = useState([])
    const { user, setUser } = useContext(UserContext);
    const { messagesNotif, setMessagesNotif } = useContext(MessageNotifContext);
    const [messages, setMessages] = useState([])
    const [visibleMessages, setVisibleMessages] = useState([]);
    const [messageIndex, setMessageIndex] = useState(5);
    const { chatOpened, setChatOpened, chatOpenedAfterRedirect, setChatOpenedAfterRedirect, chatWith, setChatWith, inCall, setInCall, isReceiveingCall, setIsReceiveingCall, isCalling, setIsCalling } = useContext(ChatContext)
    const [message, setMessage] = useState('');
    const [isCallRejected, setIsCallRejected] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [receivedImage, setReceivedImage] = useState(null);
    const [sending, setSending] = useState(false);
    const myVideo = useRef(null)
    const userVideo = useRef(null)
    const connectionRef = useRef(null)
    const { online, setOnline } = useContext(onlineContext)

    const navigate = useNavigate()

    const [timer, setTimer] = useState(null)
    const { imageContext, setImageContext } = useContext(ImageContext)
    //const [isCalling, setIsCalling] = useState(false)
    const [stream, setStream] = useState(null);
    const [caller, setCaller] = useState("");
    const [callerSignal, setCallerSignal] = useState("");
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [name, setName] = useState("");
    const [inChat, setInChat] = useState(false)
    const [isCameraEnabled, setIsCameraEnabled] = useState(false);
    const [isMicEnabled, setIsMicEnabled] = useState(true);
    const [isAnotherCameraEnabled, setIsAnotherCameraEnabled] = useState(false);
    const [isAnotherMicEnabled, setIsAnotherMicEnabled] = useState(true);
    const [error, setError] = useState("")
    const [userToCall, setUserToCall] = useState(null)
    const [myId, setMyId] = useState(null)
    const [offline, setOffline] = useState(false)
    const peerRef = useRef()

console.log("stream", stream)
    /////////////////video CHAT functionality

    /*useEffect(() => {
        const peer = new Peer()

        peer.on('open', (id) => {
            setMyId(id)
        })
        peerRef.current = peer
    }, [])*/
    useEffect(() => {
        if (timer) {
            clearTimeout(timer); // Clear previous timer
        }

        if (isReceiveingCall && caller) {
            const newTimer = setTimeout(() => {
                declineAuto();
            }, 30000); // Set timer for 30 seconds
            setTimer(newTimer);
        }
    }, [isReceiveingCall, caller])

    const declineAuto = () => {
        setIsReceiveingCall(false)
        socket.emit("declined", { to: caller })
        setCaller(null)
    }

    useEffect(() => {
        socket.on("getId", (data) => {

            if (inCall || isReceiveingCall) {
                socket.emit("declined", { to: data.to })
                return
            }
            console.log("getId socket")
            const peer = new Peer()
            setCaller(data.caller)

            peer.on('open', (id) => {
                setMyId(id)
                setIsReceiveingCall(true)

            })
            peerRef.current = peer
        })
        socket.on('disconnect', () => {
            console.log("socket disconnected")
        });

        socket.on("returnId", (data) => {
            console.log("returnId  socket")
            console.log("id", data.id)
            setUserToCall(data.id)
            callUser(data.id)
            setIsCalling(false)
        })

        socket.on("cancelCall", () => {
            setIsReceiveingCall(false)
            setCaller(null)
        })

        socket.on("declined", () => {
            setIsCalling(false)
            //add timeout to restore to false 
            setIsCallRejected(true)
        })

        socket.on("leaveCall", () => {
            console.log("leaveCall")
            leaveCallReceived()
        })

        return () => {
            socket.off('leaveCall');
            socket.off('getId');
            socket.off('returnId');
            socket.off('declined');
            socket.off('cancelCall');
            socket.disconnect()
        };
    }, [])
    ///////////////////////////////////////////


    useEffect(() => {
        if (peerRef.current) {
            peerRef.current.on("call", (call) => {
                console.log("callAnswered")
                navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(async (stream) => {
                    setStream(stream)
                    call.answer(stream)
                    console.log("callAnswered")
                    call.on("stream", (remoteStream) => {
                        console.log("callAnswered")
                        setInCall(true);
                        setTimeout(() => {
                            userVideo.current.srcObject = remoteStream
                            myVideo.current.srcObject = stream
                        }, 2000);
                    })
                },
                    (err) => {
                        console.error(`The following error occurred: ${err.name}`);
                    },
                );
                console.log("getUserMedia not supported");
            })
            // if in Call do this 
        }
    }, [peerRef.current])

    const leaveCallSooner = () => {
        setInCall(false)
        setIsCalling(false)
        socket.emit("cancelCall", (selectedFriend.userName))

        if (stream) {
            stopCameraStream(stream)
        }
        //window.location.reload()
    }

    const leaveCallSent = () => {
        if (myVideo.current) {

            myVideo.current.srcObject = null
        }
        if (userVideo.current) {

            userVideo.current.srcObject = null
        }
        if (caller !== "" && caller !== null) {
            socket.emit("leaveCall", (caller))
        } else {
            socket.emit("leaveCall", (selectedFriend.userName))

        }
        if (stream) {
            stopCameraStream(stream)
        }
        // Reset callAccepted state
        setCaller(null); // Reset caller state
        setInCall(false)
    }

    const leaveCallReceived = () => {
        console.log("leaveCall received")
        console.log("stream", stream)
        if (myVideo.current) {

            myVideo.current.srcObject = null
        }
        if (userVideo.current) {

            userVideo.current.srcObject = null
        }
        if (stream) {
            stopCameraStream(stream)
        }
        // Reset callAccepted state
        setCaller(null); // Reset caller state
        setInCall(false)
    }

    const callUser = (userToCall) => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(async (stream) => {
            setStream(stream)
            console.log("calling user")
            const call = peerRef.current.call(userToCall, stream)

            call.on('stream', (remoteStream) => {
                setInCall(true);
                setTimeout(() => {
                    console.log("received stream after call User")
                    userVideo.current.srcObject = remoteStream
                    myVideo.current.srcObject = stream
                }, 2000);
            })
        })
    }

    //cameraa
    const enableMic = () => {
        if (caller && caller !== "" && caller !== null) {
            socket.emit("micOn", caller)
            setIsMicEnabled((prev) => !prev);
        } else
            if (selectedFriend && selectedFriend.userName) {
                socket.emit("micOn", selectedFriend.userName)
                setIsMicEnabled((prev) => !prev);
            }
    };
    const disableMic = () => {
        if (caller && caller !== "" && caller !== null) {
            socket.emit("micOff", caller)
            setIsMicEnabled(false);
        } else
            if (selectedFriend && selectedFriend.userName) {
                socket.emit("micOff", selectedFriend.userName)
                setIsMicEnabled(false);
            }
    };

    const enableCamera = () => {
        if (caller && caller !== "" && caller !== null) {
            socket.emit("cameraOn", caller)
            setIsCameraEnabled(true);
        } else
            if (selectedFriend && selectedFriend.userName) {
                socket.emit("cameraOn", selectedFriend.userName)
                setIsCameraEnabled(true);
            }
    };
    const disableCamera = () => {
        if (caller && caller !== "" && caller !== null) {
            socket.emit("cameraOff", caller)
            setIsCameraEnabled(false);
        } else
            if (selectedFriend && selectedFriend.userName) {
                socket.emit("cameraOff", selectedFriend.userName)
                setIsCameraEnabled(false);
            }
            else {
                console.log("nothiiiing")
            }
    };

    const exchangeId = (userId) => {
        console.log("emited get id")
        const peer = new Peer()

        peer.on('open', (id) => {
            setMyId(id)
            setIsCalling(true)
            socket.emit('getId', { myId: id, user: user.userName, to: userId })
        })
        peerRef.current = peer
    }

    useEffect(() => {
        if (isCallRejected) {
            setTimeout(() => {
                setIsCallRejected(false)
            }, 3000)
        }
    }, [isCallRejected])

    const stopCameraStream = (stream) => {
        console.log("stream", stream)
        const tracks = stream.getTracks();
        tracks.forEach((track) => {
            track.stop();
        });
        setStream(null)
    };

    /*useEffect(()=>{
if (stream && !inCall){
          stream.getTracks().forEach(track => track.stop());
          
          setStream(null)
}
    }, [stream, inCall])*/

    useEffect(() => {

        // Event listeners for socket events
        setName(user.userName)
        socket.on('receiveImage', ({ message, from, at, image, id, blured, downloadLink }) => {
            setReceivedImage(message);
            setMessages((prevMessages) => [...prevMessages, { message: message, from: from, id: id, at: at, image: image, blured: blured, downloadLink: downloadLink }])
        });
        socket.on("chatInitiated", (message) => {
            console.log(message);
        })

        socket.on("cameraOn", () => {
            setIsAnotherCameraEnabled(true)
console.log("stream", stream)
        })
        socket.on("cameraOff", () => {
            setIsAnotherCameraEnabled(false)
        })
        socket.on("micOn", () => {
            setIsAnotherMicEnabled(true)
        })
        socket.on("micOff", () => {
            setIsAnotherMicEnabled(false)
        })

        socket.on('privateMessage', ({ message, userName }) => {
            // console.log(user.friendList)
            const friendIndex = user.friendList.findIndex(f => f.userName === userName)
            const newestUser = user
            newestUser.friendList[friendIndex].messages.push(message)
            setUser(newestUser)
            setMessages((prevMessages) => [...prevMessages, message]);
        });
        socket.on('message', (message) => {
            console.log(message)
        });
        return () => {
            socket.off('receiveImage');
            socket.off('chatInitiated');
            socket.off('privateMessage');
            socket.off('message');
            socket.off('cameraOn');
            socket.off('cameraOff');
            socket.off('micOn');
            socket.off('micOff');
        };
        // Clean up the socket connection when the component is unmounted
        ;

    }, []);

    const acceptCall = () => {
        //isReceiveingCalling true
        //caller true
        socket.emit("returnId", { to: caller, id: myId })
        setIsReceiveingCall(false)
        setCallAccepted(true)
    }
    const declineCall = () => {
        //callAccepted false
        //caller true
        socket.emit("declined", { to: caller })
        setIsReceiveingCall(false)
    }


    const handleImageChange = (event) => {
        const file = event.target.files[0];
        setSelectedImage(file);
    };

    const handleSendImage = () => {
        if (selectedImage) {
            if (user.tokens < 5) {
                setWantstoSendImage(false)
                setError("You need 5 tokens to send")
                setTimeout(() => {
                    navigate("/shop")
                }, 3000)
                return
            }
            setSending(true)
            setWantstoSendImage(false)
            const randomNumber = Math.floor(Math.random() * 10000000000000001);
            const timestamp = Date.now()
            const date = new Date(timestamp)
            const firebaseDate = date.toISOString()

            const id = uuidv4()
            const imageRef = ref(storage, `${user.email}/${id}`)
            uploadBytes(imageRef, selectedImage).then(async (snapshot) => {
                getDownloadURL(snapshot.ref).then(async (url) => {
                    const downloadLink = document.createElement('a');
                    downloadLink.href = url;
                    downloadLink.download = 'image.jpg'; // Set the desired filename for the downloaded image
                    downloadLink.textContent = 'Download Image';
                    const filtered = user.friendList.filter(f => f.userName === selectedFriend.userName)
                    const notFiltered = user.friendList.filter(f => f.userName !== selectedFriend.userName)
                    setUser({ ...user, friendList: [{ ...filtered[0], messages: [...messages, { message: message, from: "me", at: firebaseDate }] }, ...notFiltered], tokens: user.tokens - 5 })
                    setMessages((prevMessages) => [...prevMessages, { message: url, from: "me", at: firebaseDate, image: true, blured: false }])
                    socket.emit('sendImage', { data: url, friend: selectedFriend, id: id, downloadLink: downloadLink.outerHTML });
                    setSending(false)

                }).catch(err => {
                    setSending(false)
                    setError("Couldn't send photo")
                })
            })


        }
    };

    const handleMessageChange = (e) => {
        setMessage(e.target.value);
    };

    const handleMessageSubmit = (e) => {

        e.preventDefault();
        if (user.tokens < 5) {
            setError("Need 5 tokens!")
            setTimeout(() => {
                navigate("/shop")
            }, 3000);
            // Call the navigate function to redirect to a different route
            return
        }
        if (selectedFriend) {
            socket.emit('privateMessage', {
                friend: selectedFriend,
                message: message
            });
            const timestamp = Date.now()
            const date = new Date(timestamp)
            const firebaseDate = date.toISOString()
            const filtered = user.friendList.filter(f => f.userName === selectedFriend.userName)
            const notFiltered = user.friendList.filter(f => f.userName !== selectedFriend.userName)
            setUser({ ...user, friendList: [{ ...filtered[0], messages: [...messages, { message: message, from: "me", at: firebaseDate }] }, ...notFiltered], tokens: user.tokens - 5 })
            setMessages((prevMessages) => [...prevMessages, { message: message, from: "me", at: firebaseDate }]);
            setMessage('');
        } else {
            console.log("no friend selected")// Handle sending message to general chat or display an error message
        }
    };

    useEffect(() => {
        if (messages && messages.length > 0) {
            const startIndex = Math.max(0, messages.length - messageIndex);
            if (startIndex > 0 && messages.length < messageIndex) {
                setVisibleMessages(messages.slice(messages.length - 1));
            } else if (startIndex === 0) {
                setVisibleMessages(messages);
            } else {
                setVisibleMessages(messages.slice(startIndex));
            }
        } else {
            setVisibleMessages([])
        }
    }, [selectedFriend, messages, messageIndex, messageIndex]);

    const handleLoadMoreMessages = () => {
        setMessageIndex((prevIndex) => Math.max(0, prevIndex + 5));
    };

    const fetchSelectedFriend = useCallback(async () => {

        await fetch(`${import.meta.env.VITE_SERVER_URL}/user/currentuser`, {
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

    const handleFriendClick = async (friend) => {
        if (selectedFriend && selectedFriend.email === friend.email) {
            setSelectedFriend({});
            setMessages([])
            setVisibleMessages([])
            setMessageIndex(5)
        } else {
            setSelectedFriend(friend);
            setMessageIndex(5)
            await fetch(`${import.meta.env.VITE_SERVER_URL}/user/updateList`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ friend: friend.userName })
            }).then(async (response) => {
                updateFriendList(friend)
                const friendInfo = friendList.find((Friend) => Friend.email === friend.email);
                await fetchSelectedFriend();
                setMessages(friendInfo.messages);
                socket.emit('startChat', friend);
            }).catch((err) => {
            })
        }
    }

    const handleSetMessageSeen = async (friend) => {
        await fetch(`${import.meta.env.VITE_SERVER_URL}/user/updateMessageNotif`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name: friend.userName })
        }).then((response) => {
            const newMessages = messagesNotif.filter(f => f !== friend.userName)
            setMessagesNotif(newMessages)
            handleFriendClick(friend)
        }).catch((err) => {
        })
    }

    useEffect(() => {
        if (messagesNotif.some(s => s === selectedFriend.userName)) {
            messagesNotif.filter(f => f !== selectedFriend.userName)
        }
    }, [selectedFriend])

    const howMany = (name) => {
        const filtererd = messagesNotif.filter(f => f === name)
        const nr = filtererd.length
        return nr
    }


    useEffect(() => {
        if (user && user.friendList && user.friendList.length > 0) {
            setFriendList(user.friendList)
        }
    }, [user])
    const imageStyle = {
        filter: 'blur(7px)',
    };

    const toggleChat = () => {
        if (chatOpened === true) {
            setChatOpened(prev => !prev)
            setSelectedFriend({})

        } else {
            setChatOpenedAfterRedirect(false)
            setChatOpened(prev => !prev)
        }

    }

    const handleUnblock = (message) => {
        if (user.tokens < 50) {
            setError("You need 50 tokens to unlock")
            setTimeout(() => {
                navigate("/shop")
            }, 3000);
            setChatOpened(false)
            return
        }
        setShowConfirmation(true)
        setUnblockedImage(message)
    }
    const handleConfirmUnblock = () => {
        setPurchased(true) // Call the logout handler passed from the parent component
    };
    const handleCancelUnblock = () => {
        setShowConfirmation(false);
    };

    useEffect(() => {
        if (showConfirmation && unblockedImage && purchased) {
            unblockImage(unblockedImage)
        }
    }, [showConfirmation, unblockedImage, purchased])

    const unblockImage = async (message) => {

        await fetch(`${import.meta.env.VITE_SERVER_URL}/user/updateUnlockPhotoUser`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ id: message.id, price: 50, from: selectedFriend.userName, url: message.url })
        }).then(response => response.json()) // Parse the response as JSON
            .then(async data => {
                if (data.errors) {
                    setError(data.errors)
                    setShowConfirmation(false)
                    setUnblockedImage(null)
                    setPurchased(false)
                    return
                }
                if (data.photo) {
                    const newPhotos = [data.photo, ...user.photos]
                    setUser({ ...user, photos: newPhotos, tokens: user.tokens - 50 })
                    setShowConfirmation(false)
                    setUnblockedImage(null)
                    setPurchased(false)
                    return
                }
                if (data.data) {
                    setUser({ ...user, photos: data.data.photos, tokens: data.data.tokens })
                    setShowConfirmation(false)
                    setUnblockedImage(null)
                    setPurchased(false)
                }
                const updatedMessages = visibleMessages.map(msg => {
                    if (msg.id === data.id) {
                        return { ...msg, blured: false };
                    }
                    return msg;
                });
                await fetchSelectedFriend()
                setVisibleMessages(updatedMessages);
                setShowConfirmation(false)
                setUnblockedImage(null)
                setPurchased(false)
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
        // Handle click event for blurred images
        // Perform any other actions you want
    };

    const formatFireDate = (firebaseDate) => {
        const date = new Date(firebaseDate);

        // Extract the hour and minute from the Date object
        let hour = date.getHours();
        if (hour < 10) {
            hour = `0${hour}`
        }
        let minute = date.getMinutes();
        if (minute < 10) {
            minute = `0${minute}`
        }
        return `${hour}:${minute}`
    }

    const updateFriendList = (friend) => {
        // Move the user to the top of the user list
        const updatedFriendList = [friend, ...friendList.filter(f => f.userName !== friend.userName)];
        setFriendList(updatedFriendList);
    };

    let list = ["onixapple"]
    const remove = () => {
        list = []
    }

    function openFullscreen(imageUrl) {
        setImageContext(imageUrl)
        setTimeout(() => {

        }, 10000)
        // Add a click event listener to close the fullscreen view

    }
    function closeImage() {
        setImageContext(null)
    }

    useEffect(() => {
        if (error) {
            setTimeout(() => {
                setError("");
            }, 1000);
        }
    }, [error])

    useEffect(() => {
        const chatContainer = document.getElementById('chat-container');
        if (messages && chatContainer) {
            chatContainer.scrollTo(0, chatContainer.scrollHeight);
        }
    }, [messages]);

    function setChatAfterRedir() {
        setChatOpenedAfterRedirect(true)
    }

    return (
        <>
            {/*inCall && (
                <div className=" relative w-screen h-screen flex flex-col justify-center items-center bg-black">

                    <div className="flex video h-full w-full ">
                        {callAccepted && !callEnded ? <video className="w-full h-full" muted={!isAnotherMicEnabled} playsInline ref={userVideo} autoPlay={true} style={{ display: isAnotherCameraEnabled ? 'block' : 'none' }} /> : null}
                    </div>
                    <div className="flex fixed left-1/4 top-2 video h-1/5 w-1/5" style={{ transform: 'translateX(-50%)' }}>
                        {callAccepted && !callEnded && (
                            <>
                                <video className="w-full h-full"
                                    playsInline
                                    muted
                                    ref={myVideo}
                                    autoPlay
                                    style={{ display: isCameraEnabled ? 'block' : 'none' }}
                                />
                            </>
                        )}
                    </div>




                    <div className="fixed right-5 bottom-10 flex flex-col justify-center items-center" >
                        <div className="flex">{inCall && callAccepted && !isMicEnabled && (<MicNoneIcon fontSize="large" className="bg-transparent text-red-500 cursor-pointer rounded-2xl my-3" onClick={() => enableMic()} />)}</div>
                        <div className="flex">{inCall && callAccepted && isMicEnabled && (<MicNoneIcon fontSize="large" className="bg-transparent text-white  cursor-pointer rounded-2xl my-3" onClick={() => disableMic()} />)}</div>
                        <div className="flex">{inCall && callAccepted && !isCameraEnabled && (<CameraAltOutlinedIcon fontSize="large" className="bg-transparent cursor-pointer text-red-500 my-3 rounded-2xl" onClick={() => enableCamera()} />)}</div>
                        <div className="flex">{inCall && callAccepted && isCameraEnabled && (<CameraAltOutlinedIcon fontSize="large" className="bg-transparent cursor-pointer text-white my-3 rounded-2xl" onClick={() => disableCamera()} />)}</div>
                        
                        
                    </div>
                </div>)
            */
            }



            {isReceiveingCall && caller !== "" && myId &&
                <div className="fixed top-20 rounded-2xl items-center text-center justify-center left-1/2 bg-black z-10" style={{ transform: 'translateX(-50%)' }}>
                    <div className="flex flex-col items-center justify-center ">
                        <p className="flex my-1">{caller} is calling</p>
                        <div className="flex flex-row justify-center items-center">
                            {isReceiveingCall && (<button className="mx-3 bg-transparent rounded-2xl text-green-500" onClick={() => acceptCall()}>Answer</button>)}
                            {isReceiveingCall && (<button className="mx-3 bg-transparent rounded-2xl text-red-500" onClick={() => declineCall()}>Decline</button>)}
                        </div>
                    </div>
                </div>}
            {isCalling && selectedFriend && (<div className="relative flex items-center justify-center">
                <p className="fixed top-1/2 left-1/2" style={{ transform: 'translateX(-50%)' }}>Calling {selectedFriend.userName}</p>
                <button className="bg-transparent text-red-500 rounded-2xl" onClick={() => leaveCallSooner()}>Cancel</button>
            </div>)}
            {inCall && stream &&
                <div className="relative w-full h-screen flex flex-col justify-center items-center bg-black">
                    <div className="flex fixed left-1/4 top-2 video h-1/5 w-1/5 z-20" style={{ transform: 'translateX(-50%)' }}>
                        <video className="w-full h-full"
                            playsInline
                            muted
                            ref={myVideo}
                            autoPlay
                            style={{ display: isCameraEnabled ? 'block' : 'none' }}
                        />
                    </div>
                    <video className="w-full h-full" playsInline
                        ref={userVideo}
                        autoPlay
                        muted={!isAnotherMicEnabled}
                        style={{ display: isAnotherCameraEnabled ? 'block' : 'none' }} />

                    <div className="fixed right-5 bottom-10 flex flex-col justify-center items-center" >
                        <div className="flex"><button className="bg-transparent text-red-500 rounded-2xl" onClick={() => leaveCallSent()}>Leave</button></div>
                        <div className="flex">{!isMicEnabled && (<MicNoneIcon fontSize="large" className="bg-transparent text-red-500 cursor-pointer rounded-2xl my-3" onClick={() => enableMic()} />)}</div>
                        <div className="flex">{isMicEnabled && (<MicNoneIcon fontSize="large" className="bg-transparent text-white  cursor-pointer rounded-2xl my-3" onClick={() => disableMic()} />)}</div>
                        <div className="flex">{!isCameraEnabled && (<CameraAltOutlinedIcon fontSize="large" className="bg-transparent cursor-pointer text-red-500 my-3 rounded-2xl" onClick={() => enableCamera()} />)}</div>
                        <div className="flex">{isCameraEnabled && (<CameraAltOutlinedIcon fontSize="large" className="bg-transparent cursor-pointer text-white my-3 rounded-2xl" onClick={() => disableCamera()} />)}</div>
                        <div>{isCalling ? (<button className="bg-transparent text-red-500 rounded-2xl" onClick={() => leaveCallSooner()}>Cancel</button>) : null}</div>
                    </div>
                </div>
            }

            {!chatOpened && !inCall && !isCalling && friendList.length > 0 && <button className="chat-button bg-transparent text-black fixed right-5 bottom-1/4" onClick={() => toggleChat()}><img draggable="false" className="w-10 h-10" src={CHAT} />{messagesNotif && messagesNotif.length > 0 && (<div className=" absolute top-2 right-2 bg-red-500 rounded-full w-2 h-2 xl:w-4 xl:h-4"></div>)}</button>}
            {imageContext && <div className=" flex flex-col bg-slate-900 items-center justify-center max-w-screen max-h-screen">
                <TransformWrapper >
                    <TransformComponent >
                        <img className="flex max-w-screen max-h-screen object-contain" src={imageContext} alt="Received Image" />
                    </TransformComponent>
                </TransformWrapper>
                <div className="fixed top-5 right-5"><button className="bg-transparent border border-white text-white text-xl" onClick={() => closeImage()}>Close</button></div>
            </div>}
            {chatOpened && !imageContext && !isCalling && !inCall && !chatOpenedAfterRedirect && (
                <div className=" chat mt-10 text-black h-full w-full fixed bg-white top-0 border-2 border-white flex flex-row">
                    {error && (<div className='fixed left-1/2 top-1/2 w-30 h-20 bg-black text-red-500 z-10' style={{ transform: 'translateX(-50%)' }}><Error error={error} /></div>)}
                    {sending && !error && (<div className='fixed top-1/2 left-1/2 w-20 h-10 bg-black p-4 rounded-2xl z-10' style={{ transform: 'translateX(-50%)' }}><Error error={"Sending ..."} /></div>)}

                    { //chatOpened && <button className="chat-button text-black fixed right-5 bottom-1/4" onClick={toggleChat}>Close</button>
                    }
                    {friendList && friendList.length > 0 ? (
                        <>
                            <div className="chat-users h-full pb-10 bg-slate-900 flex-end text-black w-1/4 overflow-y-auto ">
                                {friendList.map((user, index) => (messagesNotif && messagesNotif.length > 0 && messagesNotif.some(s => s === user.userName)) ? (
                                    <div onClick={() => handleSetMessageSeen(user)}
                                        className={`relative flex flex-col friend border border-slate-900 items-center justify-center text-black m-2 rounded-2xl ${index % 2 === 0 ? 'bg-gradient-to-b from-pink-500 to-violet-800' : 'bg-gradient-to-b from-cyan-500 to-indigo-700'
                                            }`}
                                        style={{ backgroundColor: "9A099E" }}>
                                        <div className="relative h-12 rounded-full w-12 my-1">

                                            <div className=" absolute flex items-center justify-center -bottom-1 right-0 text-white bg-red-500 rounded-full w-4 h-4 xl:w-4 xl:h-4">{howMany(user.userName)}</div>
                                            <img draggable="false" className=" h-12 rounded-full w-12 my-1" src={user.mainImage?.url || replace} />
                                        </div>
                                        <p className="text-white flex-wrap italic">
                                            {user.userName}
                                        </p>
                                        {online.length > 0 && online.some(s => s === user.userName) && (<div className=" absolute top-2 right-2 bg-green-500 rounded-full w-2 h-2 xl:w-4 xl:h-4"></div>)}
                                    </div>
                                ) : (
                                    <div onClick={() => handleFriendClick(user)}
                                        className={`relative flex flex-col friend border border-slate-900 items-center justify-center text-black m-2 rounded-2xl  ${index % 2 === 0 ? 'bg-gradient-to-b from-pink-500 to-violet-800' : 'bg-gradient-to-b from-cyan-500 to-indigo-600'
                                            }`}
                                        style={{ backgroundColor: "#9A099E" }}>
                                        <img draggable="false" className="h-12 rounded-full w-12 my-1" src={user.mainImage?.url || replace} />
                                        <p className="text-white flex-wrap italic">
                                            {user.userName}
                                        </p>
                                        {online.length > 0 && online.some(s => s === user.userName) && (<div className=" absolute top-2 right-2  bg-green-500 rounded-full w-2 h-2 xl:w-4 xl:h-4"></div>)}
                                    </div>
                                )
                                )}
                            </div>


                            <div className="relative flex flex-col justify-center bg-slate-900 items-center h-full w-3/4 text-black">
                                <div className="absolute top-0 flex  flex-col border-b border-b-white items-center justify-center w-full place-self-start">
                                    {selectedFriend && selectedFriend.email && (
                                        <div className="flex flex-row justify-center w-full items-center text-center">
                                            <div className="flex flex-1 ml-2" ><Link className="text-white italic " to={`/users/${selectedFriend.userName}`}><button className="p-0 m-0 bg-transparent text-white italic" onClick={() => setChatAfterRedir()}>{selectedFriend.userName}</button></Link></div>
                                            {selectedFriend !== null && selectedFriend.email && !inCall && (<PhoneEnabledOutlinedIcon fontSize="large" className=" mx-3 w-10 h-10 bg-transparent text-center text-green-500 items-center justify-center" onClick={() => exchangeId(selectedFriend.userName)} />)}
                                            {chatOpened && <div className=" mx-3 justify-center items-center text-center cursor-pointer"> <CloseIcon className="chat-button text-white" fontSize="large" onClick={() => toggleChat()} /></div>}
                                        </div>)}
                                    {!selectedFriend.hasOwnProperty("email") && chatOpened && <div className=" mx-3 justify-center items-center text-center cursor-pointer"> <CloseIcon className="chat-button text-white" fontSize="large" onClick={() => toggleChat()} /></div>}
                                </div>
                                <div className="flex flex-col items-center w-full h-4/5  p-2 justify-end chat-messages text-black overflow-y-auto">
                                    {selectedFriend && selectedFriend.email && (
                                        <div className=" relative flex flex-col items-center w-full p-2 chat-messages text-black overflow-y-auto" id="chat-container">
                                            {messages && visibleMessages && messages.length > messageIndex && <div className="w-full flex justify-center">
                                                <MoreHorizIcon className="cursor-pointer" onClick={() => handleLoadMoreMessages()} />
                                            </div>}
                                            {messages && visibleMessages && visibleMessages.map((message, index) =>
                                                message.image ? (
                                                    message.blured ? (

                                                        <div className={`${message.from === "friend" ? " relative w-28 h-28 flex flex-col  self-start text-center  items-center mx-2 my-1 rounded-2xl" : "relative w-28 h-28 flex flex-col self-end text-center items-center mx-2 my-1 rounded-2xl"}`}>
                                                            <img draggable="false" className="absolute top-1/3 left-1/2 w-1/2 h-1/2 z-10" src={Lock} style={{ transform: 'translateX(-50%)' }} onClick={() => handleUnblock(message)} />
                                                            <p className="flex w-full text-white text-sm text-center items-center justify-center bg-transparent">{formatFireDate(message.at)}</p>
                                                            <img draggable="false" className="flex h-24 w-24 rounded-2xl" style={imageStyle} src={message.message} alt="Received Image" />
                                                        </div>
                                                    ) : (<div className={`${message.from === "friend" ? "w-28 h-28 flex flex-col self-start text-center items-center mx-2 my-1 rounded-2xl" : "w-28 h-28 flex flex-col self-end text-center items-center mx-2 my-1 rounded-2xl"}`}>

                                                        <p className="flex w-full text-white text-sm text-center items-center justify-center bg-transparent">{formatFireDate(message.at)}</p>
                                                        <img draggable="false" className="h-24 w-24 rounded-2xl" onClick={() => openFullscreen(message.message)} src={message.message} alt="Received Image" />

                                                    </div>)
                                                ) : (
                                                    <div className={`${message.from === "friend" ? "flex flex-col w-1/2 self-start items-center text-center items-center mx-2 my-1" : "flex w-1/2  flex-col items-center self-end text-center items-center mx-2 my-1 "}`}>
                                                        {message.from === "friend" ?
                                                            (<div className="flex flex-col w-full  h-full justify-start items-center">
                                                                <p className="flex w-full text-white text-sm text-center items-center justify-center bg-transparent">{formatFireDate(message.at)}</p>
                                                                <div className="flex flex-row w-full  h-full justify-start items-center">
                                                                    <img draggable="false" className=" flex h-10 w-10 rounded-full " src={`${selectedFriend.mainImage.url || replace}`} />
                                                                    <p className=" bg-blue-200 w-full m-2 p-2 rounded-2xl  min-h-content w-full break-words ">{message.message}</p>
                                                                </div>
                                                            </div>) :
                                                            (<div className=" flex flex-col w-full h-full justify-end items-center">
                                                                <p className="flex w-full text-white text-sm text-center items-center justify-center bg-transparent">{formatFireDate(message.at)}</p>
                                                                <div className=" flex flex-row w-full  h-full justify-end items-center">
                                                                    <p className="bg-indigo-500 w-full m-2 p-2 rounded-2xl  min-h-content w-full break-words">{message.message}</p>
                                                                    <img draggable="false" className=" flex h-10 w-10 rounded-full" src={`${user.mainImage?.url || replace}`} />
                                                                </div>
                                                            </div>)}
                                                    </div>
                                                ))}



                                            {showConfirmation && (
                                                <div className="fixed top-1/3 left-1/2 flex flex-col w-2/3 items-center text-center bg-gradient-to-b from-red-500 to-fuchsia-700 z-20 rounded-2xl p-1" style={{ transform: 'translateX(-50%)' }}>
                                                    <p className=" italic text-white font-serif">Are you sure you want to unlock picture? It will cost 50 tokens.</p>
                                                    <div className="flex flex-row items-center justify-center my-2">
                                                        <button className="text-white cursor-pointer mr-2 bg-transparent rounded-2xl border-solid border-2 border-indigo-100" onClick={() => handleConfirmUnblock()}>Yes</button>
                                                        <button className="text-white cursor-pointer ml-2 bg-transparent rounded-2xl border-solid border-2 border-indigo-100" onClick={() => handleCancelUnblock()}>No</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className=" flex flex-col items-center p-2  mb-5 w-full ">
                                    {!selectedFriend && !wantsToSendImage && <p>Please select friend to start a conversation</p>}
                                    {selectedFriend && selectedFriend.email &&
                                        <div className="flex flex-col items-center justify-center w-full text-center">
                                            {!wantsToSendImage && <form className="flex flex-row w-4/5 items-center justify-center" onSubmit={handleMessageSubmit}>
                                                <input className="flex-grow border border-black rounded-2xl w-2/3 mr-2 bg-white" value={message} onChange={handleMessageChange} />
                                                <div className="flex flex-row flex-1 w-1/3 items-center diplsay-center">
                                                    <button className="flex cursor-pointer m-1 p-0 items-center display-center" type="submit" >
                                                        <SendIcon fontSize="small" className="cursor-pointer text-white p-0" />
                                                    </button>
                                                    <button className="flex cursor-pointer m-1 p-0 items-center display-center bg-black">
                                                        <ImageIcon className="flex text-white " fontSize="small" onClick={() => { setWantstoSendImage((prev) => !prev) }} />
                                                    </button>
                                                </div>
                                            </form>}
                                        </div>}
                                    {wantsToSendImage && selectedFriend &&
                                        (<div className="flex flex-row w-4/5 items-center justify-center">
                                            <input className="flex-grow border border-black rounded-2xl w-2/3 mr-2" type="file" onChange={handleImageChange} />
                                            <div className="flex flex-row flex-1 w-1/3 items-center diplsay-center">
                                                <button className="flex cursor-pointer m-1 p-0 items-center display-center bg-transparent" onClick={() => handleSendImage()}><SendIcon className="cursor-pointer text-white" /></button>
                                                <button className="flex cursor-pointer m-1 p-0 items-center display-center bg-transparent" onClick={() => { setWantstoSendImage((prev) => !prev) }}>
                                                    <CloseIcon className="text-white" fontSize="medium" />
                                                </button>
                                            </div>
                                        </div>)}
                                </div>
                            </div>


                        </>
                    ) : (
                        <>
                            <div className="chat">
                                <div className="chat-users"></div>
                                <div className="chat-messages-section">
                                    <div className="chat-messages">

                                    </div>
                                    <div className="send-message">

                                        <div className="send-image">

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div >
            )}
            {/*(list.some(s => s === user.userName)) ? (
                                <div
                                    key={user.userName}
                                    className={`friend ${selectedFriend && selectedFriend.email === user.email ? "active" : ""
                                        }`}
                                >
                                    <button onClick={remove}>Remove</button>
                                    <button onClick={() => handleFriendClick(user)}>Go</button>
                                    {user.userName}
                                </div>
                            ) : (
                                <div
                                    key={user.userName}
                                    className={`friend ${selectedFriend && selectedFriend.email === user.email ? "active" : ""
                                        }`}
                                >
                                    <button onClick={() => handleFriendClick(user)}>DontGo</button>
                                    {user.userName}
                                </div>
                            )*/}
        </>
    )
}

export default Chat3;