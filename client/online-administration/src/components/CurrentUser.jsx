import React, { useEffect, useState } from 'react';

const CurrentUser = () => {
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("token")
  useEffect(() => {
    // Fetch the user data
    const fetchData = async () => {
    await fetch(`${import.meta.env.VITE_SERVER_URL}/user/currentuser`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      },
    })
      .then(response => response.json())
      .then(data => {
        const user = data.user;
        setUser(user);
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
      });
    }
    fetchData()
  }, []);

  return (
    <div>
      {user && <span>Welcome, {user.firstName}!</span>}
    </div>
  );
};

export default CurrentUser;