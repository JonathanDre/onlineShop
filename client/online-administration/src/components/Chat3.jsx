import React, { useEffect, useState, useContext, useRef, useCallback } from "react";
import UserContext from './../UserContext';
import Peer from 'simple-peer'
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
import MicNoneIcon from '@mui/icons-material/MicNone';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import PhoneEnabledOutlinedIcon from '@mui/icons-material/PhoneEnabledOutlined';
import Error from "../components/Error"
import { Link } from "react-router-dom";
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
    const myVideo = useRef(null)
    const userVideo = useRef(null)
    const connectionRef = useRef(null)
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


    /////////////////video CHAT functionality
    useEffect(() => {
        if (timer) {
            clearTimeout(timer); // Clear previous timer
        }

        if (selectedFriend && isCalling) {
            const newTimer = setTimeout(() => {
                declineAuto();
            }, 30000); // Set timer for 30 seconds
            setTimer(newTimer);
        }
    }, [isCalling, selectedFriend])





    useEffect(() => {
        if (socket) {

            socket.on("callUser", (data) => {
                console.log("data", data)

                if (inChat) {
                    socket.emit("declined", (data.from))
                } else {

                    setCallAccepted(false);
                    setIsCallRejected(false)
                    setIsReceiveingCall(true)
                    setCaller(data.from)
                    setCallerSignal(data.signal)
                }
            })

            socket.on("cameraOn", () => {
                console.log("cameraOnbefore", isAnotherCameraEnabled)
                setIsAnotherCameraEnabled(true)
                console.log("cameraafter", isAnotherCameraEnabled)
            })
            socket.on("cameraOff", () => {
                console.log("cameraOFFbefore", isAnotherCameraEnabled)
                setIsAnotherCameraEnabled(false)
                console.log("cameraAfter", isAnotherCameraEnabled)
            })
            socket.on("micOn", () => {
                console.log("micOnBefore", isAnotherMicEnabled)
                setIsAnotherMicEnabled(true)
                console.log("micOn", isAnotherMicEnabled)
            })
            socket.on("micOff", () => {
                console.log("micOff", isAnotherMicEnabled)
                setIsAnotherMicEnabled(false)
                console.log("micOffAfter", isAnotherMicEnabled)
            })

            socket.on("autodecline", () => {
                setIsCallRejected(true)
                setIsReceiveingCall(false)
                setCallEnded(true)
                setCaller("")
                setCallerSignal("")
                setCallAccepted(false);
                if (connectionRef.current) {
                    connectionRef.current.destroy();
                }
            })

            socket.on("leaveCall", () => {
                // If the user is in a call and receives a leaveCall event,
                // it means the other participant has left the call,
                // so we need to leave the call as well

                leaveCallReceived();

            });

            socket.on("declined", () => {
                setIsCallRejected(true)
                setCallEnded(true)
                setCallAccepted(false)
                setIsCalling(false)
                setInCall(false)
                if (connectionRef.current) {

                    console.log("connection destroyed")
                }



            })

            socket.on("cancelCall", () => {
                setIsCallRejected(true)
                setCallEnded(true)
                setIsReceiveingCall(false)
                setCallAccepted(false)
                setIsCalling(false)
            })
            return () => {
                socket.off('cancelCall');
                socket.off('declined');
                socket.off('leaveCall');
                socket.off('autodecline');
                socket.off('callUser');
                socket.off('micOn');
                socket.off('micOff');
                socket.off('cameraOn');
                socket.off('cameraOff');

            };
        }
    }, [socket, inChat])
    const callUser = (id) => {

        if (user.tokens < 50) {
            setError("Not enought tokens!")
            return
        }
        setCallAccepted(false)
        setCallEnded(false)
        setIsCallRejected(false)
        setInCall(true)


        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream1) => {
            setStream(stream1)
            console.log("stream", stream)
            console.log("stream1 in callUser", stream1)
            const peer = new Peer({
                initiator: true,
                trickle: false,
                stream: stream1

            })
            console.log("peer in callUser", peer)

            peer.on("signal", (data) => {
                console.log("there is a signal and the user To Call is :", id)
                socket.emit("callUser", {
                    userToCall: id,
                    signalData: data,
                    from: user.userName,
                    name: name
                })
                setIsCalling(true)
            })
            peer.on('close', () => { console.log('peer closed'); socket.off("callAccepted"); });
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
                setUser({ ...user, tokens: user.tokens - 50 })

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
    }

    const declineCall = () => {
        setIsCallRejected(true)
        socket.emit("declined", (caller), (error) => {
            console.log("error", error)
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

        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream1) => {
            setStream(stream1)

            console.log("stream", stream)
            const peer = new Peer({
                initiator: false,
                trickle: false,
                stream: stream1

            })

            peer.on("signal", (data) => {
                console.log("caller", caller)
                socket.emit("answerCall", { signal: data, to: caller })
                setInChat(true)
                setInCall(true)
            })
            peer.on('close', () => { console.log('peer closed');socket.off('callUser'); });
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

    useEffect(() => {
        if (stream && isCallRejected) {

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
        socket.emit("cancelCall", (selectedFriend.userName))
        console.log("selectedFriend", selectedFriend)
        setIsCallRejected(true)
        setCallEnded(true);
        setInChat(false)
        setCallAccepted(false); // Reset callAccepted state
        setCaller(""); // Reset caller state
        setCallerSignal("");
        if (connectionRef.current) {
            connectionRef.current.destroy();
        }
        setInCall(false)
        //window.location.reload()
    }

    const leaveCallSent = () => {
        console.log("myVideo", myVideo)
        console.log("userVideo", userVideo)
        myVideo.current.srcObject = null; // Clear local video display
        userVideo.current.srcObject = null;
        if (caller !== "" && caller !== null) {
            socket.emit("leaveCall", (caller))
        } else {
            socket.emit("leaveCall", (selectedFriend.userName))

        }
        setCallEnded(true);
        setInChat(false)
        setIsCallRejected(true)
        //connectionRef.current.destroy();
        setCallAccepted(false); // Reset callAccepted state
        setCaller(""); // Reset caller state
        setCallerSignal(""); // Reset callerSignal state
        setIsAnotherMicEnabled(true)
        setIsAnotherCameraEnabled(false)
        setIsMicEnabled(true)
        setIsCameraEnabled(false)
        if (connectionRef.current) {
            connectionRef.current.destroy();
        }
        setInCall(false)

        //window.location.reload()isMicEnabled

    }
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

    const leaveCallReceived = () => {
        console.log("myVideo", myVideo)
        console.log("userVideo", userVideo)
        console.log("leffffffft")
        myVideo.current.srcObject = null; // Clear local video display
        userVideo.current.srcObject = null;
        // connectionRef.current.destroy();
        setCallEnded(true);
        setInChat(false)
        setCallAccepted(false); // Reset callAccepted state
        setIsCallRejected(true)
        setCallerSignal(""); // Reset callerSignal state
        setIsAnotherMicEnabled(true)
        setIsAnotherCameraEnabled(false)
        setIsMicEnabled(true)
        setIsCameraEnabled(false)
        if (connectionRef.current) {
            connectionRef.current.destroy();
        }
        setCaller(""); // Reset caller state
        setInCall(false)
        //window.location.reload()

    }



    ///////////////////////////////////////////



    useEffect(() => {


        if (user && socket) {

            // Event listeners for socket events
            setName(user.userName)
            socket.on('receiveImage', ({ message, from, at, image, id, blured, downloadLink }) => {
                setReceivedImage(message);
                setMessages((prevMessages) => [...prevMessages, { message: message, from: from, id: id, at: at, image: image, blured: blured, downloadLink: downloadLink }])
                console.log("receivedImage", receivedImage)
            });
            socket.on("chatInitiated", (message) => {
                console.log(message);
            })

            socket.on('privateMessage', ({ message, userName }) => {
                // console.log(user.friendList)

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
                socket.off('privateMessage');
                socket.off('message');
            };
            // Clean up the socket connection when the component is unmounted
            ;
        }

    }, [socket, user]);


    const handleImageChange = (event) => {
        const file = event.target.files[0];
        setSelectedImage(file);
    };

    const handleSendImage = () => {
        if (selectedImage) {
            if (user.tokens < 5) {
                setWantstoSendImage(false)
                setError("Not enought tokens!")
                return
            }
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
                    setMessages((prevMessages) => [...prevMessages, { message: url, from: "me", at: firebaseDate, image: true, blured: false }])
                    socket.emit('sendImage', { data: url, friend: selectedFriend, id: id, downloadLink: downloadLink.outerHTML });
                    setWantstoSendImage(false)
                    setUser({ ...user, tokens: user.tokens - 5 })
                }).catch(err => {
                    console.log(err)
                })
            })


        }
    };

    const handleMessageChange = (e) => {
        setMessage(e.target.value);
    };

    const handleMessageSubmit = (e) => {
        if (user.tokens < 5) {
            setError("Not enought tokens!")
            setMessage('');
            return
        }
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
            setMessages((prevMessages) => [...prevMessages, { message: message, from: "me", at: firebaseDate }]);
            setMessage('');
            setUser({ ...user, tokens: user.tokens - 5 })
        } else {
            console.log("no friend selected")// Handle sending message to general chat or display an error message
        }
    };

    useEffect(() => {
        if (messages && messages.length > 0) {
            console.log("messages", messages)
            const startIndex = Math.max(0, messages.length - messageIndex);
            console.log("startIndex", startIndex)
            console.log("messageIndex", messageIndex)
            if (startIndex > 0 && messages.length < messageIndex) {
                setVisibleMessages(messages.slice(messages.length - 1));
                console.log("setVisibleemessages", messages)
            } else if (startIndex === 0) {
                console.log("setVisibleemessages", messages)
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
            setSelectedFriend(null);
            setMessages([])
            setVisibleMessages([])
            setMessageIndex(5)
        } else {
            console.log(selectedFriend)
            console.log("messages", messages)
            console.log("visiblemessages", visibleMessages)
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
                console.log(response)
                const friendInfo = friendList.find((Friend) => Friend.email === friend.email);
                console.log("friendInfo", friendInfo)
                await fetchSelectedFriend();
                setMessages(friendInfo.messages);
                console.log("messages", messages)
                console.log("visiblemessages", visibleMessages)
                socket.emit('startChat', friend);
            }).catch((err) => {
                console.log("error", err)
            })
        }
    }

    const handleSetMessageSeen = async (friend) => {
        console.log("executing sec")
        console.log("friend")
        await fetch(`${import.meta.env.VITE_SERVER_URL}/user/updateMessageNotif`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name: friend.userName })
        }).then((response) => {
            console.log(response)
            const newMessages = messagesNotif.filter(f => f !== friend.userName)
            setMessagesNotif(newMessages)
            handleFriendClick(friend)
        }).catch((err) => {
            console.log("error", err)
        })
    }

    useEffect(() => {
        if (user && user.friendList && user.friendList.length > 0) {
            setFriendList(user.friendList)
        }
        console.log("userList", user.friendList)
    }, [user])
    const imageStyle = {
        filter: 'blur(20px)',
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
        if (user.tokens < 50) {
            setError("Not enought tokens")
            setShowConfirmation(false)
            setUnblockedImage(null)
            setPurchased(false)
            return
        }
        await fetch(`${import.meta.env.VITE_SERVER_URL}/user/updateUnlockPhoto`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ id: message.id, price: 50, from: selectedFriend.userName })
        }).then(response => response.json()) // Parse the response as JSON
            .then(async data => {
                console.log(data)
                if (data.errors) {
                    console.log("in the error")
                    setError(data.errors)
                    setShowConfirmation(false)
                    setUnblockedImage(null)
                    setPurchased(false)
                    console.log("error", error)
                    return
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
        console.log('Image clicked:', message.id);
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
        console.log("chatOpened", chatOpened)
        setImageContext(imageUrl)
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
            console.log('Chat container height:', chatContainer.scrollHeight);
            console.log('Chat container client height:', chatContainer.clientHeight);
            chatContainer.scrollTo(0, chatContainer.scrollHeight);
        }
    }, [messages]);

    function setChatAfterRedir() {
        setChatOpenedAfterRedirect(true)
    }

    return (
        <>
            {inCall && (
                <div className="w-screen h-screen flex flex-col justify-center items-center bg-black">
                    {callAccepted && !callEnded && (
                        <div className="video fixed bottom-10 left-1/2" style={{ transform: 'translateX(-50%)' }}>
                            {<video playsInline muted ref={myVideo} autoPlay style={{ display: isCameraEnabled ? 'block' : 'none' }} />}
                        </div>
                    )}
                    <div className="video">
                        {callAccepted && !callEnded ? <video muted={!isAnotherMicEnabled} playsInline ref={userVideo} autoPlay style={{ display: isAnotherCameraEnabled ? 'block' : 'none' }} /> : null}
                    </div>
                    <div className="fixed right-5 bottom-10 flex flex-col justify-center items-center" >
                        <div className="flex">{inCall && callAccepted && !isMicEnabled && (<MicNoneIcon fontSize="large" className="bg-transparent text-red-500 cursor-pointer rounded-2xl my-3" onClick={enableMic} />)}</div>
                        <div className="flex">{inCall && callAccepted && isMicEnabled && (<MicNoneIcon fontSize="large" className="bg-transparent text-white  cursor-pointer rounded-2xl my-3" onClick={disableMic} />)}</div>
                        <div className="flex">{inCall && callAccepted && !isCameraEnabled && (<CameraAltOutlinedIcon fontSize="large" className="bg-transparent cursor-pointer text-red-500 my-3 rounded-2xl" onClick={enableCamera} />)}</div>
                        <div className="flex">{inCall && callAccepted && isCameraEnabled && (<CameraAltOutlinedIcon fontSize="large" className="bg-transparent cursor-pointer text-white my-3 rounded-2xl" onClick={disableCamera} />)}</div>
                        <div className="flex">{inCall && callAccepted && (<button className="bg-transparent text-red-500 rounded-2xl" onClick={leaveCallSent}>Leave</button>)}</div>
                        <div>{isCalling ? (<button className="bg-transparent text-red-500 rounded-2xl" onClick={leaveCallSooner}>Cancel</button>) : null}</div>
                    </div>
                </div>)}



            {isReceiveingCall && caller !== "" &&
                <div className="fixed top-20 rounded-2xl items-center text-center justify-center left-1/2 bg-black z-10" style={{ transform: 'translateX(-50%)' }}>
                    <div className="flex flex-col items-center justify-center ">
                        <p className="flex my-1">{caller} is calling</p>
                        <div className="flex flex-row justify-center items-center">
                            {isReceiveingCall && (<button className="mx-3 bg-transparent rounded-2xl text-green-500" onClick={answerCall}>Answer</button>)}
                            {isReceiveingCall && (<button className="mx-3 bg-transparent rounded-2xl text-red-500" onClick={declineCall}>Decline</button>)}
                        </div>
                    </div>
                </div>}
            {!chatOpened && !inCall && <button className="chat-button bg-transparent text-black fixed right-5 bottom-1/4" onClick={toggleChat}><img className="w-10 h-10" src={CHAT} /></button>}
            {imageContext && chatOpened && <div className="absolute top-0 w-full h-full">
                <TransformWrapper>
                    <TransformComponent>
                        <img className="w-screen h-screen" src={imageContext} alt="Received Image" />
                    </TransformComponent>
                </TransformWrapper>
                <div className="fixed top-5 right-5"><button className="bg-transparent border border-black text-black text-xl" onClick={closeImage}>Close</button></div>
            </div>}
            {chatOpened && !imageContext && !inCall && !chatOpenedAfterRedirect && (
                <div className=" chat mt-10 text-black h-full w-full fixed bg-white top-0 border-2 border-white flex flex-row">
                    {error && (<div className='fixed top-1/2 left-1/2 bg-black p-4 rounded-2xl z-10' style={{ transform: 'translateX(-50%)' }}><Error error={error} /></div>)}

                    { //chatOpened && <button className="chat-button text-black fixed right-5 bottom-1/4" onClick={toggleChat}>Close</button>
                    }
                    {friendList && friendList.length > 0 ? (
                        <>
                            <div className="chat-users h-full bg-slate-900 flex-end text-black w-1/4 ">
                                {friendList.map((user, index) => (messagesNotif && messagesNotif.length > 0 && messagesNotif.some(s => s === user.userName)) ? (
                                    <div onClick={() => handleSetMessageSeen(user)}
                                        className={`relative flex flex-col friend border border-slate-900 items-center justify-center text-black p-2 ${index % 2 === 0 ? 'bg-gradient-to-b from-cyan-500 to-cyan-700' : 'bg-gradient-to-b from-blue-700 to-indigo-900'
                                            }`}
                                    >
                                        <img className="h-12 rounded-full w-12 my-1" src={user.mainImage.url || replace} />
                                        <p className="text-white">
                                            {user.userName}
                                        </p>
                                        <div className=" absolute top-2 right-2 bg-red-500 rounded-full w-2 h-2"></div>
                                    </div>
                                ) : (
                                    <div onClick={() => handleFriendClick(user)}
                                        className={`relative flex flex-col friend border border-slate-900 items-center justify-center text-black p-2 ${index % 2 === 0 ? 'bg-gradient-to-b from-cyan-500 to-cyan-700' : 'bg-gradient-to-b from-blue-700 to-indigo-900'
                                            }`}
                                    >
                                        <img className="h-12 rounded-full w-12 my-1" src={user.mainImage.url || replace} />
                                        <p className="text-white">
                                            {user.userName}
                                        </p>
                                    </div>
                                )
                                )}
                            </div>


                            <div className="relative flex flex-col justify-center bg-slate-900 items-center h-full w-3/4 text-black">
                                <div className="absolute top-0 flex myw-2 flex-col border-b border-b-white items-center justify-center w-full place-self-start">
                                    {selectedFriend && selectedFriend.email && (
                                        <div className="flex flex-row justify-center w-full items-center text-center">
                                            <div className="flex flex-1 ml-2" onClick={() => setChatAfterRedir()}><Link className="" to={`/users/${selectedFriend.userName}`}>{selectedFriend.userName}</Link></div>
                                            {selectedFriend !== null && selectedFriend.email && !inCall && (<PhoneEnabledOutlinedIcon fontSize="large" className=" mx-3 w-10 h-10 bg-transparent text-center text-green-500 items-center justify-center" onClick={() => callUser(selectedFriend.userName)} />)}
                                            {chatOpened && <div className=" mx-3 justify-center items-center text-center cursor-pointer"> <CloseIcon className="chat-button text-white" fontSize="large" onClick={toggleChat} /></div>}
                                        </div>)}
                                    {!selectedFriend && selectedFriend !== "" && chatOpened && <div className=" mx-3 justify-center items-center text-center cursor-pointer"> <CloseIcon className="chat-button text-white" fontSize="large" onClick={toggleChat} /></div>}
                                </div>
                                <div className="flex flex-col items-center w-full h-4/5 max-h-fit p-2 justify-end chat-messages text-black overflow-y-auto">
                                    {selectedFriend && selectedFriend.email && (
                                        <div className=" relative flex flex-col items-center w-full p-2 chat-messages text-black overflow-y-auto" id="chat-container">
                                            {messages && visibleMessages && messages.length > messageIndex && <div className="w-full flex justify-center">
                                                <MoreHorizIcon className="cursor-pointer" onClick={handleLoadMoreMessages} />
                                            </div>}
                                            {messages && visibleMessages && visibleMessages.map((message, index) =>
                                                message.image ? (
                                                    message.blured ? (

                                                        <div className={`${message.from === "friend" ? "w-28 h-28 flex flex-col self-start text-center items-center mx-2 my-1 rounded-2xl" : "w-28 h-28 flex flex-col self-end text-center items-center mx-2 my-1 rounded-2xl"}`}>

                                                            <p className="flex w-full text-white text-sm text-center items-center justify-center bg-transparent">{formatFireDate(message.at)}</p>
                                                            <img className="h-full w-full" style={imageStyle} onClick={() => handleUnblock(message)} src={message.message} alt="Received Image" />
                                                        </div>
                                                    ) : (<div className={`${message.from === "friend" ? "w-28 h-28 flex flex-col self-start text-center items-center mx-2 my-1 rounded-2xl" : "w-28 h-28 flex flex-col self-end text-center items-center mx-2 my-1 rounded-2xl"}`}>

                                                        <p className="flex w-full text-white text-sm text-center items-center justify-center bg-transparent">{formatFireDate(message.at)}</p>
                                                        <img className="h-full w-full rounded-2xl" onClick={() => openFullscreen(message.message)} src={message.message} alt="Received Image" />

                                                    </div>)
                                                ) : (
                                                    <div className={`${message.from === "friend" ? "flex flex-col w-1/2 self-start items-center text-center items-center mx-2 my-1" : "flex w-1/2  flex-col items-center self-end text-center items-center mx-2 my-1 "}`}>
                                                        {message.from === "friend" ?
                                                            (<div className="flex flex-col w-full  h-full justify-start items-center">
                                                                <p className="flex w-full text-white text-sm text-center items-center justify-center bg-transparent">{formatFireDate(message.at)}</p>
                                                                <div className="flex flex-row w-full  h-full justify-start items-center">
                                                                    <img className=" flex h-10 w-10 rounded-full " src={`${selectedFriend.mainImage.url || replace}`} />
                                                                    <p className=" bg-blue-200 w-full m-2 p-2 rounded-2xl  min-h-content w-full break-words ">{message.message}</p>
                                                                </div>
                                                            </div>) :
                                                            (<div className=" flex flex-col w-full h-full justify-end items-center">
                                                                <p className="flex w-full text-white text-sm text-center items-center justify-center bg-transparent">{formatFireDate(message.at)}</p>
                                                                <div className=" flex flex-row w-full  h-full justify-end items-center">
                                                                    <p className="bg-indigo-500 w-full m-2 p-2 rounded-2xl  min-h-content w-full break-words">{message.message}</p>
                                                                    <img className=" flex h-10 w-10 rounded-full" src={`${user.mainImage.url || replace}`} />
                                                                </div>
                                                            </div>)}
                                                    </div>
                                                ))}



                                            {showConfirmation && (
                                                <div className="fixed top-1/3 left-1/2 flex flex-col w-2/3 items-center text-center bg-black rounded-2xl p-1" style={{ transform: 'translateX(-50%)' }}>
                                                    <p className="text-xl text-red-500">Are you sure you want to unlock picture?</p>
                                                    <div className="flex flex-row items-center justify-center my-2">
                                                        <button className="mx-2 rounded-2xl bg-transprent text-green-500" onClick={handleConfirmUnblock}>Yes</button>
                                                        <button className="mx-2 rounded-2xl bg-transprent text-red-500" onClick={handleCancelUnblock}>No</button>
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
                                                <input className="flex-grow border border-black rounded-2xl w-2/3 mr-2" value={message} onChange={handleMessageChange} />
                                                <div className="flex flex-row flex-1 w-1/3 items-center diplsay-center">
                                                    <button className="flex cursor-pointer m-1 p-0 items-center display-center" type="submit" >
                                                        <SendIcon fontSize="small" className="cursor-pointer text-white p-0" />
                                                    </button>
                                                    <button className="flex cursor-pointer m-1 p-0 items-center display-center">
                                                        <ImageIcon className="flex " fontSize="small" onClick={() => { setWantstoSendImage((prev) => !prev) }} />
                                                    </button>

                                                </div>
                                            </form>}
                                        </div>}
                                    {wantsToSendImage && selectedFriend &&
                                        (<div className="flex flex-row w-4/5 items-center justify-center">
                                            <input className="flex-grow border border-black rounded-2xl w-2/3 mr-2" type="file" onChange={handleImageChange} />
                                            <div className="flex flex-row flex-1 w-1/3 items-center diplsay-center">
                                                <button className="flex cursor-pointer m-1 p-0 items-center display-center bg-transparent" onClick={handleSendImage}><SendIcon className="cursor-pointer text-white" /></button>
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