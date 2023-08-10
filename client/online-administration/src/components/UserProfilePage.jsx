import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import Window from './Window';
import { Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import SocketContext from '../SocketConetxt';
import UserContext from '../UserContext';
import ImageContext from '../ImageContext';
import Socket from "../Socket"
import Cupidon from '../assets/cupid1.png'
import Kiss from '../assets/kiss1.png'
import Chocolate from '../assets/chocolate.png'
import Flowers from '../assets/bouquet1.png'
import Keys from '../assets/love-key1.png'
import Ring from '../assets/ring.png'
import Strawberry from '../assets/strawberry1.png'
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import FavoriteOutlinedIcon from '@mui/icons-material/FavoriteOutlined';
import CHAT from "../assets/CHAT.png"
import ChatContext from "../ChatContext";
import replacement from "../assets/replace.jpg"
import sendGift from "../assets/sendGift.png"
import chatButton from "../assets/chatButton.png"
import noLike from "../assets/noLike.png"
import redLike from "../assets/redLike.png"
import Error from "../components/Error"
import Lock from "../assets/Lock.png"
import lipsGold from "../assets/lipsGold.png"
import Silverlips from "../assets/Silverlips.png"
import goldlight from "../assets/goldlight.png"
import goldlight1 from "../assets/goldlight1.png"
import diamond1 from "../assets/diamond1.png"
import diamond2 from "../assets/diamond2.png"
import diamondlips from "../assets/diamondlips.png"
import crystal1 from "../assets/crystal1.png"
import crystal2 from "../assets/crystal2.png"
import crystal3 from "../assets/crystal3.png"
import crystal4 from "../assets/crystal4.png"
import rubylips from "../assets/rubylips.png"
import rubylight from "../assets/rubylight.png"
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
const UserProfilePage = () => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [unblockedImage, setUnblockedImage] = useState(null)
  const [purchased, setPurchased] = useState(false)
  const token = localStorage.getItem("token")
  const { userId } = useParams();
  const [otherUser, setOtherUser] = useState(null);
  const { socket, setSocket } = useContext(SocketContext)
  const [liked, setLiked] = useState(false)
  const { user, setUser } = useContext(UserContext)
  const [showGifts, setShowGifts] = useState(false)
  const [visibleGifts, setVisibleGifts] = useState([])
  const [index, setIndex] = useState(5)
  const [userLiked, setUserLiked] = useState(false)
  const [error, setError] = useState(null)
  const [newIndex, setNewIndex] = useState(null)
  const { imageContext, setImageContext } = useContext(ImageContext)
  const { chatOpened, inChat, inCall, setChatOpened, chatOpenedAfterRedirect, setChatOpenedAfterRedirect } = useContext(ChatContext)

  const navigate = useNavigate()
  const myMap = new Map([
    ['Cupidon', Cupidon],
    ['Kiss', Kiss],
    ['Chocolate', Chocolate],
    ['Flowers', Flowers],
    ['Keys', Keys],
    ['Ring', Ring],
    ['Strawberry', Strawberry]
  ]);
  console.log("newIndex", newIndex)

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

  const giveLike = async () => {
    try {
      console.log(token)
      const url = `http://localhost:3000/users/updateLike`;
      console.log('Fetch URL:', url);
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/user/updateLike`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      }).then(response => {
        console.log("response from fetchUser", response)
        if (socket) {
          setUserLiked(true)
          setUser({ ...user, usersLiked: [...user.usersLiked, userId] })
          socket.emit("liked", ({ userId, myId: user.userName }))
          console.log("liked to:", userId)
          console.log("liked by:", user.userName)
        }
      }).catch(err => {
        console.log(err)
      });
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    if (user && otherUser) {
      const index = user.photos.findIndex(f => f.from === otherUser.userName)
      if (index !== -1) {
        setNewIndex(index)
      }
      else {
        console.log("index", index)
        setNewIndex(-1)
      }
    }
  }, [user,otherUser])

  const unLike = async () => {
    await fetch(`${import.meta.env.VITE_SERVER_URL}/user/removeLike`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ userId })
    }).then(response => response.json()
      .then((data) => {
        setUser({ ...user, usersLiked: user.usersLiked.filter(f => f !== userId) })
        setUserLiked(false)
      }).catch(error => {
        console.log(error)
      })
    )
  }

  useEffect(() => {
    if (user) {
      if (user.usersLiked.some(obj => obj === userId)) {
        setUserLiked(true)
      } else {
        setUserLiked(false)
      }
    }
  }, [user])


  const fetchUser = async () => {

    try {
      const url = `http://localhost:3000/users/${userId}`;
      console.log('Fetch URL:', url);
      await fetch(`${import.meta.env.VITE_SERVER_URL}/user/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        }
      }).then(res => res.json())
        .then(data => {

          console.log("userData", data)
          setOtherUser(data);
        }).catch(err => {
          setError("User doesnt exist")
        })
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleLoadMoreGifts = () => {
    setIndex((prevIndex) => Math.max(0, prevIndex + 5));
  };

  useEffect(() => {
    if (otherUser && otherUser.gifts > 0) {
      const startIndex = Math.max(0, otherUser.gifts.length - index);

      if (otherUser.gifts.length < index) {
        setVisibleGifts(otherUser.gifts.slice(otherUser.gifts.length - 1));
        console.log("setVisibleGifts", visibleGifts)

      } else {

        console.log("setVisibleemessages", messages)
        setVisibleGifts(otherUser.gifts.slice(startIndex));
      }
    }
  }, [otherUser, index]);


  const closeGifts = () => {
    setShowGifts(false)
  }

  const showTheGifts = () => {
    setShowGifts(true)
  }
  const addUser = async () => {

    await fetch(`${import.meta.env.VITE_SERVER_URL}/user/addFriend`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ user: otherUser.userName })
    }).then((response) => response.json())
      .then((data) => {
        console.log("data", data)
        // Access the user information from the response data
        const { friendList, calls } = data.data;
        console.log("data", friendList)
        setUser({ ...user, friendList: friendList, calls: calls })
        setChatOpened(true)
        socket.emit("addedFriend", otherUser.userName)
        console.log("userASDASDASDASDASDSADASD", user)
        // Do something with the user information
      })
      .catch((error) => {
        // Handle any errors
        console.error('Error fetching data:', error);
      });

  }

  useEffect(() => {
    setChatOpened(false)
  }, [])
  const handleUnblock = (message) => {
    if (user.tokens < 50) {
      setError("You need 50 tokens to unlock")
      setTimeout(()=> {
        navigate("/shop")
        
      },3000)

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
  console.log("showConfirmation", showConfirmation)
  console.log("unblockedImage", unblockedImage)
  console.log("purchased", purchased)

  useEffect(() => {
    if (showConfirmation && unblockedImage && purchased) {
      handleImageUnblock(unblockedImage)
    }
  }, [showConfirmation, unblockedImage, purchased])

  const handleImageUnblock = async (image) => {
    await fetch(`${import.meta.env.VITE_SERVER_URL}/user/updateUnlockPhotoUser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ id: image.id, url: image.url, price: 50, from: otherUser.userName })
    }).then(response => response.json()) // Parse the response as JSON
      .then(data => {
        if (data.errors) {
          setError(data.errors)
          return
        }
        if (data.photo) {
          console.log(data)
          const newPhotos = [data.photo, ...user.photos]
          setUser({ ...user, photos: newPhotos, tokens: user.tokens - 50 })
          setShowConfirmation(false)
          setUnblockedImage(null)
          setPurchased(false)
          return
        }
        if (data.data) {
          console.log(data)
          setUser({ ...user, photos: data.data.photos, tokens: data.data.tokens })
          setShowConfirmation(false)
          setUnblockedImage(null)
          setPurchased(false)
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }

  useEffect(() => {

    fetchUser();
  }, [userId]);

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
        setError(null)
      }, 3000);
    }
  })
  useEffect(() => {
    if (chatOpenedAfterRedirect) {
      setChatOpened(false)
      setChatOpenedAfterRedirect(true)
    }
  }, [chatOpenedAfterRedirect])

  if (!otherUser) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {error && <div className='fixed left-1/2 top-1/2 w-30 h-20 bg-black text-red-500 z-10' style={{ transform: 'translateX(-50%)' }}><Error error={error} /></div>}
      {imageContext && <div className=" flex flex-col bg-slate-900 items-center justify-center max-w-screen max-h-screen">
                <TransformWrapper >
                    <TransformComponent >
                        <img className="flex max-w-screen max-h-screen object-contain" src={imageContext} alt="Received Image" />
                    </TransformComponent>
                </TransformWrapper>
                <div className="fixed top-5 right-5"><button className="bg-transparent border border-white text-white text-xl" onClick={() => closeImage()}>Close</button></div>
            </div>}
      {user && otherUser && !chatOpened && !imageContext && !inCall && (
        <div className="container relative text-white m-auto min-w-full flex flex-col min-h-full items-center justify-center bg-gradient-to-b from-blue-700 to-indigo-900" style={{ background: 'linear-gradient(180deg, #000025 0%, #31019A 100%)' }}>

          <div className='flex w-4/5 min-h-screen flex-col sm:w-2/3 md:flex-row md:justify-center'>
            <div className='flex w-full relative flex-col p-5 my-5 items-center justify-center rounded-2xl' style={{
              background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100%25\' height=\'100%25\' viewBox=\'0 0 533 366\' fill=\'none\'%3E%3Cpath d=\'M0 30C0 13.4315 13.4315 0 30 0H503C519.569 0 533 13.4315 533 30V336C533 352.569 519.569 366 503 366H30C13.4315 366 0 352.569 0 336V30Z\' fill=\'url(%23paint0_linear_353_105)\' fill-opacity=\'0.8\'/%3E%3Cdefs%3E%3ClinearGradient id=\'paint0_linear_353_105\' x1=\'167.007\' y1=\'565.656\' x2=\'141.019\' y2=\'-106.015\' gradientUnits=\'userSpaceOnUse\'%3E%3Cstop stop-color=\'%23362759\'/%3E%3Cstop offset=\'1\' stop-color=\'%235601F4\' stop-opacity=\'0\'/%3E%3C/linearGradient%3E%3C/defs%3E%3C/svg%3E")',
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
            }} >
              {otherUser && (
                <div className="relative flex w-3/5 mx-auto rounded-2xl"><img draggable="false" className={`flex w-full mx-auto rounded-2xl ${otherUser.subscription?.name === 'Ruby'
                  ? 'border-x-4 border-red-400 border-b-4 border-b-red-500'
                  : otherUser.subscription?.name === 'Diamond'
                    ? 'border-x-4 border-blue-400 border-b-4 border-b-blue-500'
                    : otherUser.subscription?.name === 'Silver'
                      ? 'border-x-4 border-gray-200 border-b-4 border-b-gray-300'
                      : otherUser.subscription?.name === 'Gold'
                        ? 'border-x-4 border-yellow-300 border-b-4 border-b-yellow-400'
                        : 'border-2 border-white'
                  }`} src={otherUser.mainImage.url || replacement} key={otherUser.mainImage.id} alt="/" />
                  {otherUser.subscription?.name === 'Gold' && <div className='absolute flex flex-row items-center justify-between w-full h-16 -bottom-6 left-1/2' style={{ transform: 'translateX(-50%)' }}>
                    <div className='flex w-8 h-16' style={{
                      background: `url(${goldlight})`, backgroundRepeat: 'no-repeat',
                      backgroundSize: 'cover', backgroundPosition: 'center'
                    }}></div>
                    <div className='flex w-12 h-12' style={{
                      background: `url(${lipsGold})`, backgroundRepeat: 'no-repeat',
                      backgroundSize: 'cover', backgroundPosition: 'center'
                    }}></div>
                    <div className='flex w-8 h-16' style={{
                      background: `url(${goldlight1})`, backgroundRepeat: 'no-repeat',
                      backgroundSize: 'cover', backgroundPosition: 'center',
                    }}></div>
                  </div>
                  }
                  {otherUser.subscription?.name === 'Silver' && <div className='absolute flex flex-row items-center justify-between w-12 h-12 -bottom-5 left-1/2' style={{
                    background: `url(${Silverlips})`, backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover', backgroundPosition: 'center', transform: 'translateX(-50%)'
                  }}>
                  </div>
                  }
                  {otherUser.subscription?.name === 'Diamond' && <div className='absolute flex flex-row items-center justify-center w-full h-16 -bottom-8 left-1/2' style={{ transform: 'translateX(-50%)' }}>
                    <div className='flex w-8 h-8 mr-2' style={{
                      background: `url(${diamond1})`, backgroundRepeat: 'no-repeat',
                      backgroundSize: 'cover', backgroundPosition: 'center'
                    }}></div>
                    <div className='flex w-12 h-12' style={{
                      background: `url(${diamondlips})`, backgroundRepeat: 'no-repeat',
                      backgroundSize: 'cover', backgroundPosition: 'center'
                    }}></div>
                    <div className='flex w-8 h-8 ml-2' style={{
                      background: `url(${diamond2})`, backgroundRepeat: 'no-repeat',
                      backgroundSize: 'cover', backgroundPosition: 'center',
                    }}></div>
                  </div>
                  }
                  {otherUser.subscription?.name === 'Ruby' && <div className='absolute flex flex-row items-center justify-center w-full h-16 -bottom-8 left-1/2' style={{ transform: 'translateX(-50%)' }}>
                    <div className=' flex w-4 h-4 mr-2' style={{
                      background: `url(${crystal1})`, backgroundRepeat: 'no-repeat',
                      backgroundSize: 'cover', backgroundPosition: 'center'
                    }}>

                    </div>
                    <div className='relative flex w-6 h-6 mr-2' style={{
                      background: `url(${crystal2})`, backgroundRepeat: 'no-repeat',
                      backgroundSize: 'cover', backgroundPosition: 'center'
                    }}>
                      <div className='absolute flex -top-2 w-full h-full' style={{
                        background: `url(${rubylight})`, backgroundRepeat: 'no-repeat',
                        backgroundSize: 'cover', backgroundPosition: 'center'
                      }}></div>

                    </div>
                    <div className='flex w-10 h-10' style={{
                      background: `url(${rubylips})`, backgroundRepeat: 'no-repeat',
                      backgroundSize: 'cover', backgroundPosition: 'center'
                    }}></div>
                    <div className='flex w-6 h-6 ml-2' style={{
                      background: `url(${crystal3})`, backgroundRepeat: 'no-repeat',
                      backgroundSize: 'cover', backgroundPosition: 'center',
                    }}></div>
                    <div className='relative flex w-4 h-4 ml-2' style={{
                      background: `url(${crystal4})`, backgroundRepeat: 'no-repeat',
                      backgroundSize: 'cover', backgroundPosition: 'center',
                    }}>
                      <div className='absolute flex -bottom-1 w-full h-full' style={{
                        background: `url(${rubylight})`, backgroundRepeat: 'no-repeat',
                        backgroundSize: 'cover', backgroundPosition: 'center'
                      }}></div>
                    </div>
                  </div>}
                </div>)}
              <div className=' flex flex-row justify-center w-2/3 border-b border-gray-300 mb-2 mt-4'>
                <div>
                  {otherUser.userName}
                </div>
              </div>
              <div className="flex flex-row justify-between w-2/3 border-b border-gray-300 mb-2">
                <div>
                  <p className="mb-1">Age</p>
                </div>
                <div>
                  {otherUser.age}
                </div>
              </div>
              <div className="flex flex-row justify-between w-2/3 border-b border-gray-300 mb-2">
                <div>
                  <p className="mb-1">My Eyes</p>
                </div>
                <div>
                  {otherUser.eyeColor}
                </div>
              </div>
              <div className="flex flex-row justify-between w-2/3 border-b border-gray-300 mb-2">
                <div>
                  <p className="mb-1">My Hair</p>
                </div>
                <div>
                  {otherUser.hairColor}
                </div>
              </div>
              <div className="flex flex-row justify-between w-2/3 border-b border-gray-300 mb-2">
                <div>
                  <p className="mb-1">My Body</p>
                </div>
                <div>
                  {otherUser.body}
                </div>
              </div>
              <div className='  flex flex-row h-1/5 mx-auto w-full items-center justify-center'>
                {!userLiked && (<div className='  flex w-1/2 justify-center'><img draggable="false" src={noLike} className='flex rounded-2xl text-white bg-transparent cursor-pointer w-12 h-12' onClick={() =>giveLike()} /></div>)}
                {userLiked && (<div className='  flex w-1/2 justify-center'><img draggable="false" src={redLike} className='flex text-red-500 rounded-2xl bg-transparent cursor-pointer w-12 h-12' onClick={() => unLike()} /></div>)}
                <div className='flex w-1/2 items-center justify-center'><button className='flex  text-white rounded-2xl bg-transparent' onClick={() => addUser()}><img draggable="false" className="w-12 h-12" src={chatButton} /></button></div>
              </div>
            </div>

            <div className='flex flex-col w-full p-4 items-center justify-center'>
              <div className=' flex flex-col mt-5 order-last md:order-first md:grid md:grid-cols-2'>{otherUser.images.map(image =>
                <div className='grid-cols-1 gap-8'>{user.photos.length !== 0  && newIndex > -1 && newIndex !== null &&  user.photos[newIndex].images.some(s => s.id === image.id) ? (
                  <div className='flex flex-col mx-2 relative text-center my-3'>
                    <img draggable="false" className='w-40 h-52 rounded-2xl' src={image.url} alt="User Image" onClick={() => openFullscreen(image.url)} />
                  </div>
                ) : (
                  <div className='relative flex flex-col mx-2 relative text-center my-3'>
                    <img draggable="false" className='w-40 h-52  rounded-2xl' style={{ filter: 'blur(20px)' }} src={image.url} alt="Blocked Image" />
                    <img draggable="false" className="absolute top-1/2 left-1/2 w-1/2 h-20" src={Lock} style={{ transform: 'translateX(-50%) translateY(-50%)' }} onClick={() => handleUnblock(image)} />
                  </div>
                )}</div>
              )}</div>

              <div className=' relative flex w-full flex-wrap text-black mt-5 text-white items-center justify-center pt-2 md:p-4 '>
                {otherUser.description && (<p className='  min-h-content w-full break-words text-center justify-center p-4 text-md xl:text-xl 2xl:text-xl 2xl:p-7' style={{
                  background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100%25\' height=\'100%25\' viewBox=\'0 0 533 366\' fill=\'none\'%3E%3Cpath d=\'M0 30C0 13.4315 13.4315 0 30 0H503C519.569 0 533 13.4315 533 30V336C533 352.569 519.569 366 503 366H30C13.4315 366 0 352.569 0 336V30Z\' fill=\'url(%23paint0_linear_353_105)\' fill-opacity=\'0.8\'/%3E%3Cdefs%3E%3ClinearGradient id=\'paint0_linear_353_105\' x1=\'167.007\' y1=\'565.656\' x2=\'141.019\' y2=\'-106.015\' gradientUnits=\'userSpaceOnUse\'%3E%3Cstop stop-color=\'%23362759\'/%3E%3Cstop offset=\'1\' stop-color=\'%235601F4\' stop-opacity=\'0\'/%3E%3C/linearGradient%3E%3C/defs%3E%3C/svg%3E")',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: 'cover',
                }}>
                  <div className='text-lg mb-3 text-red-400'>About me</div>{otherUser.description}</p>)}
              </div>


            </div>
          </div>

          <div className='fixed bottom-1/2 flex h-1/5 flex-row items-center justify-center '>
            <div className='relative flex flex-col items-center'>{showConfirmation && (
              <div className="fixed top-1/3 left-1/2 flex flex-col w-2/3 items-center text-center bg-gradient-to-b from-red-500 to-fuchsia-700 z-20 rounded-2xl p-1 xl:w-1/4" style={{ transform: 'translateX(-50%)' }}>
                <p className=" italic text-white font-serif">Are you sure you want to unlock the picture?</p>
                <div className="flex flex-row items-center justify-center my-2">
                  <button className="text-white cursor-pointer mr-2 bg-transparent rounded-2xl border-solid border-2 border-indigo-100" onClick={() => handleConfirmUnblock()}>Yes</button>
                  <button className="text-white cursor-pointer ml-2 bg-transparent rounded-2xl border-solid border-2 border-indigo-100" onClick={() => handleCancelUnblock()}>No</button>
                </div>
              </div>
            )}
            </div>
          </div>
          <div className='flex flex-row items-center justify-center w-2/3 hover:scale-125 duration-75 cursor-pointer md:w-1/2 xl:w-1/4 2xl:w-1/5 '>{!showGifts && (<img src={sendGift} draggable="false" className=' flex justify-center items-center text-red-500 bg-transparent rounded-2xl  ' onClick={() =>showTheGifts()} />)}</div>
          <div className='flex w-2/3 md:w-1/2 items-center justify-center'>{showGifts && (<Window setError={setError} otherUser={otherUser} setOtherUser={setOtherUser} target={otherUser.userName} onClose={closeGifts} />)}</div>
          <div className='flex flex-col w-4/5 m-5 mb-16 h-full mx-auto items-center justify-center sm:w-2/3 xl:w-1/2 2xl:w-1/3' style={{
            background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100%25\' height=\'100%25\' viewBox=\'0 0 533 366\' fill=\'none\'%3E%3Cpath d=\'M0 30C0 13.4315 13.4315 0 30 0H503C519.569 0 533 13.4315 533 30V336C533 352.569 519.569 366 503 366H30C13.4315 366 0 352.569 0 336V30Z\' fill=\'url(%23paint0_linear_353_105)\' fill-opacity=\'0.8\'/%3E%3Cdefs%3E%3ClinearGradient id=\'paint0_linear_353_105\' x1=\'167.007\' y1=\'565.656\' x2=\'141.019\' y2=\'-106.015\' gradientUnits=\'userSpaceOnUse\'%3E%3Cstop stop-color=\'%23362759\'/%3E%3Cstop offset=\'1\' stop-color=\'%235601F4\' stop-opacity=\'0\'/%3E%3C/linearGradient%3E%3C/defs%3E%3C/svg%3E")',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover'
          }}>
            <h1 className='items-center text-white text-xl my-4'>Received gifts</h1>
            {visibleGifts.length > 0 && (<button className='items-center text-white text-xl mb-4' onClick={() =>handleLoadMoreGifts()}>Load More</button>)}

            {otherUser && otherUser.gifts.map(gift => (
              <div className=' flex flex-row m-2 h-10 w-full items-center justify-center xl:h-16'>
                <img className=' h-full w-10 mr-5 rounded-full xl:w-16' src={gift.from.image.url} />
                <div className='mx-4'><Link className='text-white xl:text-xl' to={`/users/${gift.from.username}`}>{gift.from.username}</Link></div>
                <img className='h-full ml-3 w-10 mr-5 rounded-full  xl:w-16' src={myMap.get(gift.gift.Name)} />
              </div>

            ))}
          </div>
        </div>)}
    </>
  );
};

export default UserProfilePage;
