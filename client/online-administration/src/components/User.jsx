import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import UserContext from '../UserContext';
import ChatContext from '../ChatContext';
import onlineContext from '../onlineContext';
import { Link } from 'react-router-dom';
import CHAT from "../assets/CHAT.png"
import replace from "../assets/replace.jpg"
import rubyn from "../assets/RUBYn.png"
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
import chatButton from "../assets/chatButton.png"
import noLike from "../assets/noLike.png"
import redLike from "../assets/redLike.png"
import profile2 from "../assets/profile2.png"
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
const User = ({ User }) => {
  const { user, setUser } = useContext(UserContext)
  const { online, setOnlline } = useContext(onlineContext)
  const token = localStorage.getItem("token")
  const { chatOpened, setChatOpened, setChatWith } = useContext(ChatContext)
  const handleImageError = (event) => {
    event.target.src = './123.jpg'; // Replace 'placeholder.jpg' with the path to your placeholder image
  };

  const addUser = async () => {

    await fetch(`${import.meta.env.VITE_SERVER_URL}/user/addFriend`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ user: User.userName })
    }).then((response) => response.json())
      .then((data) => {
        console.log("data", data)
        // Access the user information from the response data
        const { friendList } = data.data;
        console.log("data", friendList)
        setUser({ ...user, friendList: friendList })
        setChatOpened(true)
        console.log("userASDASDASDASDASDSADASD", user)
        // Do something with the user information
      })
      .catch((error) => {
        // Handle any errors
        console.error('Error fetching data:', error);
      });


    const absoluteDivStyle = {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#ff0000',
    };

  }
  return (
    <div className='relative flex flex-col w-full h-72 mx-auto sm:h-72'>

      <div className={`relative flex flex-col mx-auto rounded-2xl border-solid text-white w-full h-full text-center items-center sm:h-full ${User.subscription?.name === 'Ruby'
          ? 'border-x-4 border-red-400 border-b-4 border-b-red-500'
          : User.subscription?.name === 'Diamond'
            ? 'border-x-4 border-blue-400 border-b-4 border-b-blue-500'
            : User.subscription?.name === 'Silver'
              ? 'border-x-4 border-gray-200 border-b-4 border-b-gray-300'
              : User.subscription?.name === 'Gold'
                ? 'border-x-4 border-yellow-300 border-b-4 border-b-yellow-400'
                : 'border-2 border-white'
        }`} style={{
          background: User.mainImage ? `url(${User.mainImage.url})` : `url(${replace})`, backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover', backgroundPosition: 'center',
        }}>
        <div className='flex flex-col w-3/4 absolute bottom-5 justify-center items-center'>
          <div className='h-1/5 w-full bg-indigo-900 rounded-full flex flex-row w-full justify-center items-center text-center  p-px'>
            <div className='flex mx-auto italic '>{User.userName}</div>
            <div className='flex mx-auto italic '>{User.age}y</div>
          </div>
          <div className='relative flex flex-row mt-2 w-full justify-between'>
            <button className='relative flex rounded-full p-1 bg-transparent'><Link className='text-white w-12 h-12 items-center justify-center' to={`/users/${User.userName}`}>

              <img className='text-white w-12 h-12' src={profile2} />
            </Link>
            </button>
            <button className='relative flex rounded-full p-1 bg-transparent ' onClick={() => addUser()}><img className="w-12 h-12" src={chatButton} /></button>
              {online && online.some(s => s === User.userName) && (<div className=" absolute top-2 right-2  bg-green-500 rounded-full w-4 h-4"></div>)}
          </div>
        </div>
      </div>

      {User.subscription?.name === 'Gold' && <div className='absolute flex flex-row items-center justify-between w-full h-16 -bottom-6 left-1/2' style={{ transform: 'translateX(-50%)' }}>
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
      {User.subscription?.name === 'Silver' && <div className='absolute flex flex-row items-center justify-between w-12 h-12 -bottom-3 left-1/2' style={{
        background: `url(${Silverlips})`, backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover', backgroundPosition: 'center', transform: 'translateX(-50%)'
      }}>
      </div>
      }
      {User.subscription?.name === 'Diamond' && <div className='absolute flex flex-row items-center justify-center w-full h-16 -bottom-6 left-1/2' style={{ transform: 'translateX(-50%)' }}>
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
      {User.subscription?.name === 'Ruby' && <div className='absolute flex flex-row items-center justify-center w-full h-16 -bottom-6 left-1/2' style={{ transform: 'translateX(-50%)' }}>
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
        <div className='flex w-12 h-12' style={{
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
    </div>
  );
}

export default User
