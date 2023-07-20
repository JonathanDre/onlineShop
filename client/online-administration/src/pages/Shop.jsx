import ItemComponent from "./../components/Item"
import axios from "axios"
import React, { useState, useEffect, useContext } from 'react';
import ChatContext from "../ChatContext";
const Shop = () => {
    const [data, setData] = useState([]);
  const {chatOpened, inCall} = useContext(ChatContext)
  
        useEffect( () => {
            const fetchData = async () => {
            const token = localStorage.getItem('token');
            // Make a GET request to the API endpoint
            await axios.get(`${import.meta.env.VITE_SERVER_URL}/subscriptions/shop`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              })
                .then(response => {
                    // Extract the data from the response
                    const responseData = response.data;
                    setData(responseData.items);
                    console.log("response", responseData)
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
              }
            fetchData()
        }, []);
    
        return (<>

        {!chatOpened && !inCall &&
          <div className="min-h-screen flex flex-col items-center" style={{ background: 'linear-gradient(180deg, #000025 0%, #31019A 100%)' }}>
              <div className="grid grid-cols-2 gap-4 my-10 w-4/5 justify-center text-center items-center">
                {data.map(item => (
                  <ItemComponent item = {item} key = {item.id}/>
                  ))}
            </div>
          </div>
                }
                  </>

          );
}
export default Shop;