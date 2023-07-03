import ItemComponent from "./../components/Item"
import axios from "axios"
import React, { useState, useEffect } from 'react';

const Shop = () => {
    const [data, setData] = useState([]);

        useEffect( () => {
            const fetchData = async () => {
            const token = localStorage.getItem('token');
            // Make a GET request to the API endpoint
            await axios.get('http://localhost:3000/subscriptions/shop', {
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
    
        return (
            <div>
              {/* Display the fetched data */}
              {data.map(item => (
                <ItemComponent item = {item} key = {item.id}/>
              ))}
            </div>
          );
}
export default Shop;