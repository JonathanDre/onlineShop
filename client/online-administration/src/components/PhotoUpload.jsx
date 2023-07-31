import React, { useState, useEffect } from 'react';
import { storage } from './../../firebaseConnect.js';
import { ref, uploadBytes, listAll, getDownloadURL, deleteObject  } from "firebase/storage"
import { v4 as uuidv4 } from 'uuid';


const PhotoUploadForm = ({ user, setImage}) => {
    const [photo, setPhoto] = useState(null);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [urlState, setUrlState] = useState(false)
    const [renderCount, setRenderCount] = useState(0);

    const token = localStorage.getItem("token")
    const imageListRef = ref(storage, `${user.email}`)
    

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setPhoto(selectedFile);
    };

    /*const listImages = async () => {
        try {
            console.log("use EFEEEEEECT")
            const response = await listAll(imageListRef)
            console.log("response",response)
            const urls = await Promise.all(
                response.items.map((item) => getDownloadURL(item))
            );
            console.log("urls", urls)
            const images = response.items.map((item) => ({
                id: item.name, // Use the image name as the ID
                url: urls.find((url) => url.includes(item.name)), // Find the corresponding URL based on the image name
              }));
            setImageList(images);
            
            setRenderCount((prevCount) => prevCount + 1);
            
        } catch (error) {
            console.error('Error fetching images:', error);
        }
    }*/

    const handleUpload = async () => {
        if (photo) {
            const id = uuidv4()
            const imageRef = ref(storage, `${user.email}/${id}`)
            uploadBytes(imageRef, photo).then( async (snapshot) =>  {
                getDownloadURL(snapshot.ref).then(async (url) => {

                    setImage({ id: id, url })
                })
        })
        }
    };

   

    /*useEffect(() => {
        // Render only three times
        if (renderCount < 3) {
          listImages();
        }
        if(imageList.length > 0) {
            updateUserInfo();
        }
        console.log(imageList);
      }, [renderCount, imageList]);*/

    return (
        <>
            <input className='border-2 bg-transparent text-white' type="file" onChange={handleFileChange} />
            <button className='border-2 bg-transparent border-white mt-3' onClick={() => handleUpload()}>Upload</button>
        </>
    );
};

export default PhotoUploadForm;