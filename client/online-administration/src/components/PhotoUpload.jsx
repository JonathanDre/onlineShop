import React, { useState, useEffect } from 'react';
import { storage } from './../../firebaseConnect.js';
import { ref, uploadBytes, listAll, getDownloadURL, deleteObject  } from "firebase/storage"
import { v4 as uuidv4 } from 'uuid';


const PhotoUploadForm = ({ user, imageList, setImageList, handleImageDelete }) => {
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

                    setImageList((prev) => [...prev, { id: id, url }])
                })
        })
        }
    };

    const updateUserInfo = async () => {
        console.log("imageList", imageList)
        await fetch(`http://localhost:3000/user/updateUser`,{
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            urls: imageList,
                            mainUrl: imageList[0]
                        })
                    }).then((response)=>{
                        console.log(response)
                    }).catch((err)=>{
                        console.log("error", err)
                    })
    }

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
        <div>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload</button>
            {urlState && null}
        </div>
    );
};

export default PhotoUploadForm;