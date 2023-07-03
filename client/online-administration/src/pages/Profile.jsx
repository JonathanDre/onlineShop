import { useEffect, useState, useContext } from "react"
import PhotoUploadForm from "../components/PhotoUpload";
import { storage } from './../../firebaseConnect.js';
import { ref, uploadBytes, listAll, getDownloadURL, deleteObject  } from "firebase/storage"
import UserContext from "../UserContext";
import ImageDeleteButton from './../components/ImageDeleteButton';
export default function Profile() {

    const {user, setUser} = useContext(UserContext)
    const token = localStorage.getItem('token');
    const [displayForm, setDisplayForm] = useState(false);
    const [imageList, setImageList] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [mainImage, setMainImage] = useState(null)
    

    const handleSelectImage = (image) => {
        setSelectedImage(image);
      };

      const handleConfirmSelection = async () => {
        if (selectedImage) {
          try {
            await fetch("http://localhost:3000/user/setMainPhoto", {
              method: "POST",
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ id: selectedImage.id })
            }).then(res => res.JSON)
              .then(async (data) => {
                console.log(data);
                // Update the mainUrl in the user object
                await fetchData();
              });
          } catch (error) {
            console.error('Error setting main photo:', error);
          }
        }
      };

      useEffect(()=> {
        if(user.mainImage.id){
            setMainImage(user.mainImage)
        }
      },[user])
    const handleImageDelete = async (id) => {
        // Remove the deleted image from the imageList state
        
        await fetch("http://localhost:3000/user/deleteUserPhoto", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({id: id})
        }).then(res => res.JSON)
        .then((data) => {
            console.log(data)
        })
        try {
            // Delete the image from storage
            const imageRef = getImageReferenceForDeletion(id);
            await deleteObject(imageRef);
            console.log("Image deleted successfully");
            
        } catch (error) {
            console.error('Error deleting image:', error);
        }
        setImageList((prevImageList) =>
        prevImageList.filter((image) => image.id !== id)
      );
        console.log("imageLisasdasdsadasdasdt", imageList)
      };
    const getImageReferenceForDeletion = (path) => {
        return ref(storage,`${user.email}/${path}`)
    }

    const fetchData = async () => {
        // Make a request to the server, including the token in the headers
        await fetch('http://localhost:3000/user/about', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => response.json())
            .then((data) => {
                // Access the user information from the response data
                const user = data.user;
                setUser(user)
                setMainImage(user.mainImage)
                console.log("userASDASDASDASDASDSADASD", user)
                // Do something with the user information
            })
            .catch((error) => {
                // Handle any errors
                console.error('Error fetching data:', error);
            });
    }
    const toggleForm = () => {
        setDisplayForm((prev) => !prev)
    }
    useEffect(() => {
        fetchData()
    },[])

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

    useEffect(()=> {
        if(imageList){
            updateUserInfo()
        }
    },[imageList])

    useEffect(() => {
        if (user && user.images && user.images.length > 0 && imageList.length == 0) {
          setImageList(user.images);
        }
      }, [user]);
    useEffect(() => {
        fetchData()
        console.log("user", user)
    },[imageList])
    
    return (
        <div>
          <h1>Profile</h1>
          <div>{user && user.mainImage && (<img src = {user.mainImage.url} key = {user.mainImage.id} ></img>)}</div>
          <button onClick={toggleForm}>toggle</button>
          <div>
          {imageList.map((image) => 
                 ( 
                <div> 
                    <img src={image.url} key={image.id} />
                    <ImageDeleteButton user = {user} id = {image.id} onDelete = {()=> handleImageDelete(image.id)}/> 
                    <button onClick={() => handleSelectImage(image)}>Select</button>
                </div>
                )
            )}
          </div>
          <div>
          {displayForm && (
              <PhotoUploadForm user={user} imageList={imageList}
              setImageList={setImageList} />
              )}
              </div>
              <div>
        <button onClick={handleConfirmSelection}>Confirm Selection</button>
      </div>
        </div>
      );
}