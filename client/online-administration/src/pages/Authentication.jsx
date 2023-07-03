import React, { useState, useEffect }  from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const Authentication = ({setIsAuthenticated, setIsLoggedIn, setUser}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    userName: '',
    email: '',
    password: '',
    password_confirmation: '',
    age: '',
    gender: '',
    eyeColor: '',
    hairColor: '',
    body: '',
    description: '',
    country: '',
    city: '',
    invitee: ''
  });

  const { myUserData } = useParams();
console.log(myUserData)
  //myUserData !== null && myUserData !== undefined ? setFormData({...formData, invitee: myUserData}) : console.log("no params") 
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
       const res = await axios({  
            method: 'post',  
            url: 'http://localhost:3000/auth/signup',  
            data: {...formData, invitee: myUserData ? myUserData : ""} 
          });
          localStorage.setItem("token", res.data.token);  
          setIsAuthenticated(true)
          setIsLoggedIn(true)
          localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("isAuthenticated", "true");
        const user = res.data.message
          setUser(user)
    } catch (err) {
      console.log(err.response.data.errors);
    }
  };

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
      setIsLoggedIn(true);
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <form onSubmit={handleSubmit}>
      <label>
        First Name:
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
        />
      </label>
      <br />
      <label>
        Last Name:
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
        />
      </label>
      <br />
      <label>
        User Name:
        <input
          type="text"
          name="userName"
          value={formData.userName}
          onChange={handleChange}
        />
      </label>
      <br />
      <label>
        Email:
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
      </label>
      <br />
      <label>
        Password:
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
        />
      </label>
      <br />
      <label>
        Password Confirmation:
        <input
          type="password"
          name="password_confirmation"
          value={formData.password_confirmation}
          onChange={handleChange}
        />
      </label>
      <br />
      <label>
        Age:
        <input
          type="number"
          name="age"
          value={formData.age}
          onChange={handleChange}
        />
      </label>
      <br />
      <label>
        Gender
        <input
          type="text"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
        />
      </label>
      <br />
      <label>
        Eye color:
        <input
          type="text"
          name="eyeColor"
          value={formData.eyeColor}
          onChange={handleChange}
        />
      </label>
      <br />
      <label>
        Hair color:
        <input
          type="text"
          name="hairColor"
          value={formData.hairColor}
          onChange={handleChange}
        />
      </label>
      <br />
      <label>
        Body type:
        <input
          type="text"
          name="body"
          value={formData.body}
          onChange={handleChange}
        />
      </label>
      <br />
      <label>
        Description:
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
      </label>
      <br />
      <label>
        Country:
        <input
          type="text"
          name="country"
          value={formData.country}
          onChange={handleChange}
        />
      </label>
      <br />
      <label>
        City:
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleChange}
        />
      </label>
      <br />
      <button type="submit">Register</button>
    </form>
  );
};

export default Authentication;