import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Logo from "../assets/Logo.png"
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
const Authentication = ({ setIsAuthenticated, setIsLoggedIn, setUser }) => {
  const [value, setValue] = useState('male');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    userName: '',
    email: '',
    password: '',
    password_confirmation: '',
    age: '',
    gender: 'male',
    eyeColor: '',
    hairColor: '',
    body: '',
    description: '',
    country: '',
    city: '',
    invitee: '',
    notifications: []
  });
  const [terms, setTerms] = useState(false)
  const [error, setError] = useState(null)
  const [passError, setPassError] = useState(null)
  const [showLogin, setShowLogin] = useState(false);

  const handleValueChange = (event) => {

    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
    setValue(event.target.value)

  };

  const { myUserData } = useParams();
  console.log(myUserData)
  console.log(value)
  //myUserData !== null && myUserData !== undefined ? setFormData({...formData, invitee: myUserData}) : console.log("no params") 

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(()=> {
    formData.age > 10 && formData.age < 18 ? setFormData({
      ...formData,
      ["age"]: 18,
    }): null;
  },[formData.age])

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (terms) {
      try {
        console.log(formData)
        await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/signup`, {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...formData, invitee: myUserData ? myUserData : "" })
        }).then(res => res.json())
          .then(data => {
            console.log("data", data)
            if (data.error) {
              setError(data.error)
              return
            }
            if (data.passwordCheck) {
              setPassError(data.passwordCheck)
              return
            }
            localStorage.setItem("token", data.token);
            setIsAuthenticated(true)
            setIsLoggedIn(true)
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("isAuthenticated", "true");
            const user = data.message
            setUser(user)
          })
      } catch (err) {
        console.log(err.response.data.errors);
      }
    } else {
      setError("Make sure the terms are accepted")
      return
    }
  };

  const handleYesClick = () => {
    setShowLogin(true);
  };

  const handleNoClick = () => {
    window.location.href = 'https://www.google.com';
  };

  const acceptTerms = () => {
    setTerms((prev) => !prev)
  }

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
      setIsLoggedIn(true);
      setIsAuthenticated(true);
    }
  }, []);
  //flex flex-row items-center justify-center w-4/5 mx-auto 
  return (<div className=' flex h-full w-full items-center justify-center bg-[url("./assets/girl1.png")] bg-cover bg-center bg-no-repeat'>
    
      {!showLogin ? (
        <div className='w-screen h-screen flex flex-col items-center justify-center'>
          <div className='flex flex-col ' style={{
            background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100%25\' height=\'100%25\' viewBox=\'0 0 533 366\' fill=\'none\'%3E%3Cpath d=\'M0 30C0 13.4315 13.4315 0 30 0H503C519.569 0 533 13.4315 533 30V336C533 352.569 519.569 366 503 366H30C13.4315 366 0 352.569 0 336V30Z\' fill=\'url(%23paint0_linear_353_105)\' fill-opacity=\'0.8\'/%3E%3Cdefs%3E%3ClinearGradient id=\'paint0_linear_353_105\' x1=\'167.007\' y1=\'565.656\' x2=\'141.019\' y2=\'-106.015\' gradientUnits=\'userSpaceOnUse\'%3E%3Cstop stop-color=\'%23362759\'/%3E%3Cstop offset=\'1\' stop-color=\'%235601F4\' stop-opacity=\'0\'/%3E%3C/linearGradient%3E%3C/defs%3E%3C/svg%3E")',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
          }}>
          <p className='text-white text-xl italic'>Are you 18 years old or older?</p>
          <div className='flex flex-row items-center justify-around my-2'>
          <button className='bg-transparent text-white border border-blue-200 rounded-2xl' onClick={() => handleYesClick()}>Yes</button>
          <button className='bg-transparent text-white border border-blue-200 rounded-2xl' onClick={() => handleNoClick()}>No</button>
          </div>
          </div>
        </div>
      ) : (
        <div>
    <div className="container relative px-4 flex flex-col items-center justify-center min-h-screen max-w-max m-auto ">
      <form className="flex flex-col mx-auto mt-10 items-center justify-center bg-gradient-to-br from-purple-600 to-transparent rounded-2xl px-8 pb-8 max-h-max w-full" onSubmit={handleSubmit}>
        <div className='container flex absolute flex-col top-0 right-1/2 bg-transparent min-w-min max-w-max min-h-min max-h-max' style={{ transform: 'translateX(-50%)' }}><img className='w-25 h-20' src={Logo} /></div>
        <div className='text-white text-center font-bold text-xl mt-7 mb-3'>Get started</div>
        <div className='text-white text-center mb-3'>Register to get started finding your partner!</div>
        <div className='lg:max-w-lg  xl:flex xl:flex-wrap xl: w-4/5'>
          <div className='mb-2 sm:max-lg:w-4/5 sm:max-lg:m-auto xl:w-1/2  xl:p-2'>
            {/* Your content here */}

            <label className="lg:w-full block text-white text-sm font-bold pb-2 p-1 ">
              First Name:
            </label>
            <div className='block items-center mx-auto lg:w-full ' style={{ borderColor: 'linear-gradient(180deg, #1CD8E1 0%, #1CD8E1 100%)' }}>
              <input
                className='w-full text-center p-1 border-solid border-2 rounded-2xl border-indigo-600 bg-transparent text-white placeholder:text-white xl:w-full 2xl:w-full'
                type="text"
                name="firstName"
                placeholder="Enter your First Name"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className='mb-2 sm:max-lg:w-4/5 sm:max-lg:m-auto xl:w-1/2  xl:p-2 '>
            <label className="lg:w-full block text-white text-sm font-bold pb-2 p-1">
              Last Name:
            </label>
            <div className='block items-center mx-auto lg:w-full'>
              <input
                className='w-full text-center p-1 border-solid border-2 rounded-2xl border-indigo-600 bg-transparent text-white placeholder:text-white xl:w-full 2xl:w-full'
                type="text"
                name="lastName"
                placeholder="Enter your Last Name"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
        <div className='flex flex-col text justify-center w-4/5 mx-auto'>
          <label className='flex text-white text-sm font-bold pb-2 p-1 '>
            User Name:
          </label>
          <div className='flex w-full items-center justify-center mx-auto'>
            <input
              className='p-1 w-full text-center border-solid border-2 rounded-2xl border-indigo-600 bg-transparent text-white placeholder:text-white '
              type="text"
              name="userName"
              placeholder="Enter your Username"
              value={formData.userName}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className='flex flex-col justify-center w-4/5 mx-auto'>
          <label className='flex text-white text-sm font-bold pb-2 p-1 '>
            Email:
          </label>
          <div className='block items-center justify-center w-full mx-auto'>
            <input
              className='p-1 w-full text-center border-solid border-2 rounded-2xl border-indigo-600 bg-transparent text-white placeholder:text-white mx-auto'
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className='p-1 lg:max-w-lg  xl:flex xl:flex-wrap xl: w-4/5'>
          <div className='mb-2 sm:max-lg:w-full sm:max-lg:m-auto xl:w-1/2  xl:p-2'>
            <label className='lg:w-full block text-white text-sm font-bold pb-2 p-1 '>
              Password:
            </label>
            <div className='block w-full items-center mx-auto lg:w-full'>
              <input
                className='w-full p-1 text-center border-solid border-2 rounded-2xl border-indigo-600 bg-transparent text-white placeholder:text-white '
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className='mb-2 sm:max-lg:w-4/5 sm:max-lg:m-auto xl:w-1/2  xl:p-2 '>
            <label className="lg:w-full block text-white text-sm font-bold pb-2 p-1" >
              P-Confirm:
            </label>
            <div className='block items-center mx-auto lg:w-full'>
              <input
                className='w-full p-1 text-center border-solid border-2 rounded-2xl border-indigo-600 bg-transparent text-white placeholder:text-white xl:w-full 2xl:w-full'
                type="password"
                placeholder="Password confirmation"
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
              />
            </div>
          </div>
          {passError && <div className='passwordErro'> {passError}</div>}
        </div>
        <div className='lg:max-w-lg  xl:flex xl:flex-wrap xl: w-4/5'>
          <div className='mb-2 sm:max-lg:w-4/5 sm:max-lg:m-auto xl:w-1/2  xl:p-2'>
            <label className='w-full block text-white text-sm font-bold pb-2 p-1 '>
              Age:
            </label>
            <div className='block items-center mx-auto lg:w-full '>
              <input
                className='w-full p-1 text-center border-solid border-2 rounded-2xl border-indigo-600 bg-transparent text-white placeholder:text-white xl:w-full 2xl:w-full'
                type="number"
                name="age"
                placeholder="Enter your age"
                value={formData.age}
                onChange={handleChange}
                min={18}
              />
            </div>
          </div>
          <div className='mb-2 sm:max-lg:w-4/5 sm:max-lg:m-auto xl:w-1/2  xl:p-2'>
            <label className='lg:w-full block text-white text-sm font-bold pb-2 p-1'>
              Gender
            </label>
            <div className='block items-center mx-auto lg:w-full'>
              <select className='p-1 border-solid text-center text-white border-2 rounded-2xl border-indigo-600 bg-transparent text-black placeholder:text-white w-full' name="gender" value={value} onChange={handleValueChange}>
                <option className='bg-transparent text-black p-1 border-solid border-2 rounded-2xl border-indigo-600 bg-transparent text-black placeholder:text-white' name="gender" value="male">Male</option>
                <option className='bg-transparent text-black p-1 border-solid border-2 rounded-2xl border-indigo-600 bg-transparent text-black placeholder:text-white' name="gender" value="female">Female</option>
              </select>
            </div>
          </div>
        </div>
        <div className=' lg:max-w-xl  xl:flex xl:flex-wrap xl: w-4/5'>
          <div className='mb-2 sm:max-lg:w-4/5 sm:max-lg:m-auto xl:w-1/2  xl:p-2'>
            <label className='lg:w-full block text-white text-sm font-bold pb-2 p-1 '>
              Country:
            </label>
            <div className='block items-center mx-auto lg:w-full '>
              <input
                className='w-full text-center p-1 border-solid border-2 rounded-2xl border-indigo-600 bg-transparent text-white placeholder:text-white xl:w-full 2xl:w-full'
                type="text"
                name="country"
                placeholder="Enter your country"
                value={formData.country}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className='mb-2 sm:max-lg:w-4/5 sm:max-lg:m-auto xl:w-1/2  xl:p-2'>
            <label className='lg:w-full block text-white text-sm font-bold pb-2 p-1'>
              City:
            </label>
            <div className='block items-center mx-auto lg:w-full'>
              <input
                className='w-full text-center p-1 border-solid border-2 rounded-2xl border-indigo-600 bg-transparent text-white placeholder:text-white xl:w-full 2xl:w-full'
                type="text"
                name="city"
                placeholder="Enter your city"
                value={formData.city}
                onChange={handleChange}
              />
            </div>
          </div>

        </div>
        {error && <div className='block mx-auto w-4/5 text-center '>{error}</div>}
        <br />
        <div className='block items-center justify-center text-center mx-auto w-4/5'>
          <label className='block justify-center'>
            <input type="checkbox" name="terms" value={terms} onChange={acceptTerms} />
            I agree to the <Link to="/termsAndConditions">Terms and conditions</Link>
          </label>
          <button className='mt-3 block mx-auto border-solid border-2 rounded-2xl border-indigo-600 bg-transparent ' type="submit">Register</button>
        </div>
        <div className='flex flex-row w-4/5 mt-5 mx-auto justify-evenly items-center'>
          <div className='block w-1/2 mx-auto'>
            Already have an account?
          </div>
          <Link className='block ml-10 text-center justify-center ' to="/login"><button className='text-center bg-purple-700 justify-center text-white  rounded-full'>Login</button></Link>
        </div>
      </form>
    </div>
        
    </div>
      )}
  </div>
  );
};

export default Authentication;