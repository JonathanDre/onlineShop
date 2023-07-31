import { useEffect, useState, useContext } from "react"
import PhotoUploadForm from "../components/PhotoUpload";
import { storage } from './../../firebaseConnect.js';
import { ref, uploadBytes, listAll, getDownloadURL, deleteObject } from "firebase/storage"
import UserContext from "../UserContext";
import ImageContext from "../ImageContext";
import { Link } from 'react-router-dom'
import ImageDeleteButton from './../components/ImageDeleteButton';
import Cupidon from '../assets/cupid1.png'
import Kiss from '../assets/kiss1.png'
import Chocolate from '../assets/chocolate.png'
import Flowers from '../assets/bouquet1.png'
import Keys from '../assets/love-key1.png'
import Ring from '../assets/ring.png'
import Strawberry from '../assets/strawberry1.png'
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import AddAPhotoOutlinedIcon from '@mui/icons-material/AddAPhotoOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditIcon from '@mui/icons-material/Edit';
import replacement from "../assets/replace.jpg"
import ChatContext from "../ChatContext";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
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
import { useNavigate } from 'react-router-dom';
export default function Profile() {

  const navigate = useNavigate()
  const { user, setUser } = useContext(UserContext)
  const { chatOpened, setChatOpened, inCall } = useContext(ChatContext)
  const { imageContext, setImageContext } = useContext(ImageContext)
  const [image, setImage] = useState(null)
  const token = localStorage.getItem('token');
  const [displayForm, setDisplayForm] = useState(false);
  const [imageList, setImageList] = useState([]);
  const [userImageList, setUserImageList] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [mainImage, setMainImage] = useState(null)
  const [isEditing, setIsEditing] = useState(false);
  const [newDescription, setNewDescription] = useState(null);
  const [newEyeColor, setNewEyeColor] = useState(null);
  const [newBody, setNewBody] = useState(null);
  const [newHair, setNewHair] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const [formData, setFormData] = useState({
    description: "",
    eyeColor: "",
    bodyType: "",
    hairColor: ""
  });

  const myMap = new Map([
    ['Cupidon', Cupidon],
    ['Kiss', Kiss],
    ['Chocolate', Chocolate],
    ['Flowers', Flowers],
    ['Keys', Keys],
    ['Ring', Ring],
    ['Strawberry', Strawberry]
  ]);
  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setNewDescription("");
  };

  const handleSubmit = async () => {
    // Send the new description to the server
    // ...
    const newData = {
      description: newDescription,
      eyeColor: newEyeColor,
      body: newBody,
      hairColor: newHair
    };
    await fetch(`${import.meta.env.VITE_SERVER_URL}/user/updateDescription`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newData)
    }).then(res => res.json()).then(data => {

      setUser({ ...user, ...newData });
      // Reset editing state and new description
      setIsEditing(false);
      setNewDescription(null);
      setNewEyeColor(null);
      setNewBody(null);
      setNewHair(null);
    }).catch(err => {
      console.log(err)
    })

    // Update the user description in the frontend state

  };

  // ...
  const handleSelectImage = (image) => {
    setSelectedImage(image);
    setConfirming(true)
  };

  const handleConfirmSelection = async () => {
    if (selectedImage) {
      try {
        await fetch(`${import.meta.env.VITE_SERVER_URL}/user/setMainPhoto`, {
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
            setConfirming(false)
          });
      } catch (error) {
        console.error('Error setting main photo:', error);
      }
    }
  };
  const handleCancelConfirm = () => {
    setConfirming(false)
  }

  useEffect(() => {
    if (user && user.mainImage.id) {
      setMainImage(user.mainImage)
    }
  }, [user])
  const handleImageDelete = async (id) => {
    // Remove the deleted image from the imageList state

    await fetch(`${import.meta.env.VITE_SERVER_URL}/user/deleteUserPhoto`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id: id })
    }).then(res => res.json())
      .then(async (data) => {
        console.log(data)
        setUser({ ...user, images: data.images })
        setImageList((prevImageList) =>
          prevImageList.filter((image) => image.id !== id)
        );
      })
    console.log("imageLisasdasdsadasdasdt", imageList)
  };
  const getImageReferenceForDeletion = (path) => {
    return ref(storage, `${user.email}/${path}`)
  }

  const fetchData = async () => {
    // Make a request to the server, including the token in the headers
    await fetch(`${import.meta.env.VITE_SERVER_URL}/user/about`, {
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
  }, [])

  const updateUserInfo = async () => {
    setImage(null)
    let data
    if (!user.mainImage.id) {
      data = {
        image: image,
        main: true
      }
    } else {
      data = {
        image: image,
        main: false
      }
    }
    await fetch(`${import.meta.env.VITE_SERVER_URL}/user/updateUser`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data)
    }).then(res => res.json())
      .then(data => {
        console.log(data)
        if (data.mainImage) {
          setUser({ ...user, mainImage: data.mainImage })
        } else {
          setUser({ ...user, images: data.images })
        }
      }).catch((err) => {
        console.log("error", err)
      })
  }

  useEffect(() => {
    if (image) {
      updateUserInfo()
    }
  }, [image])

  useEffect(() => {
    if (user && user.images && user.images.length > 0) {
      setImageList(user.images);

    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setNewBody(user.body)
      setNewHair(user.hairColor)
      setNewEyeColor(user.eyeColor)
      setNewDescription(user.description)
    }
  }, [user])

  function openFullscreen(imageUrl) {
    console.log("chatOpened", chatOpened)
    setImageContext(imageUrl)
    setTimeout(() => {

      console.log("imageCOntext", imageContext)
    }, 10000)
    // Add a click event listener to close the fullscreen view

  }
  useEffect(() => {
    setChatOpened(false)
  }, [])
  function closeImage() {
    console.log(imageContext)
    setImageContext(null)
  }

  return (<>
    {imageContext && <div className="absolute flex flex-col bg-slate-900 items-center justify-center w-full h-full">
      <TransformWrapper >
        <TransformComponent >
          <img className="flex w-full h-full object-contain" draggable="false" src={imageContext} alt="Received Image" />
        </TransformComponent>
      </TransformWrapper>
      <div className="fixed top-5 right-5"><button className="bg-transparent border border-white text-white text-xl" onClick={() => closeImage()}>Close</button></div>
    </div>}
    {
      !chatOpened && !imageContext && !inCall && user && (
        <div className="container m-auto min-w-full min-h-full text-white flex flex-col items-center justify-center" style={{ background: 'linear-gradient(180deg, #000025 0%, #31019A 100%)' }}>
          <div className="flex w-4/5 justify-center items-center min-h-screen flex-col sm:w-2/3 md:flex-row md:items-center">
            <div className="flex w-full relative flex-col p-5 my-5 items-center justify-center rounded-2xl " style={{
              background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100%25\' height=\'100%25\' viewBox=\'0 0 533 366\' fill=\'none\'%3E%3Cpath d=\'M0 30C0 13.4315 13.4315 0 30 0H503C519.569 0 533 13.4315 533 30V336C533 352.569 519.569 366 503 366H30C13.4315 366 0 352.569 0 336V30Z\' fill=\'url(%23paint0_linear_353_105)\' fill-opacity=\'0.8\'/%3E%3Cdefs%3E%3ClinearGradient id=\'paint0_linear_353_105\' x1=\'167.007\' y1=\'565.656\' x2=\'141.019\' y2=\'-106.015\' gradientUnits=\'userSpaceOnUse\'%3E%3Cstop stop-color=\'%23362759\'/%3E%3Cstop offset=\'1\' stop-color=\'%235601F4\' stop-opacity=\'0\'/%3E%3C/linearGradient%3E%3C/defs%3E%3C/svg%3E")',
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
            }}>
              {/*<img className="flex w-3/5 mx-auto rounded-2xl " src={user.mainImage.url} key={user.mainImage.id} alt="/" ></img>
          <Image
            className="flex w-3/5 mx-auto rounded-2xl"
               src={user.mainImage.url}
               alt="/"
               style={{
                 position: 'absolute',
                 top: 0,
                 left: 0,
                 right: 0,
                 bottom: 0,
                 height: '100%',
                 width: '100%',
                 objectFit: 'cover',
               }}
             />
          */
              }

              <div className="flex w-4/5 flex-col mb-5 ">
                {user && (
                  <div className="relative flex w-3/5 mx-auto rounded-2xl"><img draggable="false" className={`flex w-full mx-auto rounded-2xl ${user.subscription?.name === 'Ruby'
                    ? 'border-x-4 border-red-400 border-b-4 border-b-red-500'
                    : user.subscription?.name === 'Diamond'
                      ? 'border-x-4 border-blue-400 border-b-4 border-b-blue-500'
                      : user.subscription?.name === 'Silver'
                        ? 'border-x-4 border-gray-200 border-b-4 border-b-gray-300'
                        : user.subscription?.name === 'Gold'
                          ? 'border-x-4 border-yellow-300 border-b-4 border-b-yellow-400'
                          : 'border-2 border-white'
                    }`} src={user.mainImage.url || replacement} key={user.mainImage.id} alt="/" />
                    {user.subscription?.name === 'Gold' && <div className='absolute flex flex-row items-center justify-between w-full h-16 -bottom-6 left-1/2' style={{ transform: 'translateX(-50%)' }}>
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
                    {user.subscription?.name === 'Silver' && <div className='absolute flex flex-row items-center justify-between w-12 h-12 -bottom-5 left-1/2' style={{
                      background: `url(${Silverlips})`, backgroundRepeat: 'no-repeat',
                      backgroundSize: 'cover', backgroundPosition: 'center', transform: 'translateX(-50%)'
                    }}>
                    </div>
                    }
                    {user.subscription?.name === 'Diamond' && <div className='absolute flex flex-row items-center justify-center w-full h-16 -bottom-8 left-1/2' style={{ transform: 'translateX(-50%)' }}>
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
                    {user.subscription?.name === 'Ruby' && <div className='absolute flex flex-row items-center justify-center w-full h-16 -bottom-8 left-1/2' style={{ transform: 'translateX(-50%)' }}>
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
              </div>
              {!isEditing && <div className="flex flex-row justify-between w-2/3 border-b border-gray-300 mb-2">
                <div>
                  <p className="mb-1">Age</p>
                </div>
                <div>
                  {user.age}
                </div>
              </div>}
              {!isEditing && <div className="flex flex-row justify-between w-2/3 border-b border-gray-300 mb-2">
                <div>
                  <p className="mb-1">Gender</p>
                </div>
                <div>
                  {user.gender}
                </div>
              </div>}
              {!isEditing && <div className="flex flex-row justify-between w-2/3 border-b border-gray-300 mb-2">
                <div>
                  <p className="mb-1">My Eyes</p>
                </div>
                <div>
                  {user.eyeColor ? user.eyeColor : ""}
                </div>
              </div>}
              {!isEditing && <div className="flex flex-row justify-between w-2/3 border-b border-gray-300 mb-2">
                <div>
                  <p className="mb-1">My Hair</p>
                </div>
                <div>
                  {user.hairColor ? user.hairColor : ""}
                </div>
              </div>}
              {!isEditing && <div className="flex flex-row justify-between w-2/3 border-b border-gray-300 mb-2">
                <div>
                  <p className="mb-1">Body</p>
                </div>
                <div>
                  {user.body ? user.body : ""}
                </div>
              </div>}
              {isEditing &&
                <div className="flex flex-row justify-between w-2/3 border-b border-gray-300 mb-2">
                  <div>
                    <p className="mb-1">Age</p>
                  </div>
                  <div>
                    {user.age}
                  </div>
                </div>}
              {isEditing &&
                <div className="flex flex-row justify-between w-2/3 border-b border-gray-300 mb-2">
                  <div>
                    <p className="mb-1">Gender</p>
                  </div>
                  <div>
                    {user.gender}
                  </div>
                </div>}
              {isEditing &&
                <div className="flex flex-row justify-between w-2/3 border-b border-gray-300 mb-2">
                  <div>
                    <p className="mb-1">My Eyes</p>
                  </div>
                  <input
                    className="flex w-1/2 h-1/2 bg-transparent border-2 border-white rounded-2xl"
                    type="text"
                    value={newEyeColor}
                    onChange={(e) => setNewEyeColor(e.target.value)}
                  />
                </div>}
              {isEditing &&
                <div className="flex flex-row justify-between w-2/3 border-b border-gray-300 mb-2 text-center items-center">
                  <div>
                    <p className="mb-1">My Hair</p>
                  </div>
                  <input
                    className="flex w-1/2 h-1/2 bg-transparent border-2 border-white rounded-2xl text-center items-center"
                    type="text"
                    value={newHair}
                    onChange={(e) => setNewHair(e.target.value)}
                  />
                </div>}
              {isEditing &&
                <div className="flex flex-row justify-between w-2/3 border-b border-gray-300 mb-2">
                  <div>
                    <p className="mb-1">Body</p>
                  </div>
                  <input
                    className="flex w-1/2 h-1/2 bg-transparent border-2 border-white rounded-2xl text-center items-center"
                    type="text"
                    value={newBody}
                    onChange={(e) => setNewBody(e.target.value)}
                  />
                </div>}

              {isEditing &&
                <div className="flex flex-row justify-center items-center">
                  <button className="bottom-2 m-3 rounded-2xl border-solid border-2 border-indigo-100 bg-transparent" onClick={() => handleSubmit()}>Submit</button>
                  <button className="bottom-2 m-3 rounded-2xl border-solid border-2 border-indigo-100 bg-transparent" onClick={() => handleCancelClick()}>Cancel</button>
                </div>}

              {!isEditing &&
                <EditNoteOutlinedIcon fontSize="large" className="absolute top-2 right-2 opacity-25 rounded-2xl bg-transparent hover:opacity-100 cursor-pointer" onClick={() => handleEditClick()} />
              }
            </div>
            <div>
              {displayForm && (<div className="flex flex-col items-center justify-center w-full my-3">
                <PhotoUploadForm user={user}
                  setImage={setImage} />
              </div>
              )}
            </div>
            <div className="flex flex-col w-full p-4 items-center justify-center">
            {!isEditing && <AddAPhotoOutlinedIcon fontSize="large" className="flex items-center justify-center rounded-2xl cursor-pointer bg-transparent" onClick={() => toggleForm()} />}
              <div className="grid grid-cols-2 gap-8 mt-5 md:order-first md:grid md:grid-cols-2">
                {imageList.map((image) =>
                (
                  <div className="flex flex-col mx-2 relative  text-center">
                    <img draggable="false" className="w-40 h-52 rounded-2xl" src={image.url} key={image.id} />
                    <ImageDeleteButton user={user} id={image.id} onDelete={() => handleImageDelete(image.id)} />
                    <EditIcon fontSize="medium" className="absolute left-2 bottom-3 opacity-50 hover:opacity-100 w-1/3 h-1/4 text-center p-0 " onClick={() => handleSelectImage(image)} />
                  </div>
                )
                )}
              </div>
              {selectedImage && selectedImage !== null && confirming &&
                <div className="flex flex-col py-2 w-3/5 bg-indigo-900 rounded-2xl items-center justify-center fixed top-1/2 ">
                  <p className="py-2 w-full text-center text-red-600 z-20">Set this image as main?</p>
                  <div className="flex flex-row mb-2 w-full items justify-center text-red-600">
                    <button className="mx-auto text-center items-center justify-center" onClick={() => handleConfirmSelection()}>Yes</button>
                    <button className="mx-auto text-center items-center justify-center" onClick={() => handleCancelConfirm()}>No</button>
                  </div>
                </div>
              }

              <div className="relative flex w-full flex-wrap text-black mt-5 text-white items-center justify-center pt-2 md:p-4">
                {!isEditing && <p className=" min-h-content w-full break-words text-center justify-center p-4 text-md xl:text-xl 2xl:text-xl 2xl:p-7" style={{
                  background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100%25\' height=\'100%25\' viewBox=\'0 0 533 366\' fill=\'none\'%3E%3Cpath d=\'M0 30C0 13.4315 13.4315 0 30 0H503C519.569 0 533 13.4315 533 30V336C533 352.569 519.569 366 503 366H30C13.4315 366 0 352.569 0 336V30Z\' fill=\'url(%23paint0_linear_353_105)\' fill-opacity=\'0.8\'/%3E%3Cdefs%3E%3ClinearGradient id=\'paint0_linear_353_105\' x1=\'167.007\' y1=\'565.656\' x2=\'141.019\' y2=\'-106.015\' gradientUnits=\'userSpaceOnUse\'%3E%3Cstop stop-color=\'%23362759\'/%3E%3Cstop offset=\'1\' stop-color=\'%235601F4\' stop-opacity=\'0\'/%3E%3C/linearGradient%3E%3C/defs%3E%3C/svg%3E")',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: 'cover',
                }}>{user.description === "" ? "No description yet" : user.description}</p>}
                {!isEditing &&
                  <EditNoteOutlinedIcon fontSize="large" className="absolute top-1 right-2 opacity-25 rounded-2xl bg-transparent hover:opacity-100 cursor-pointer" onClick={() => handleEditClick()} />
                }
              </div>
              <div className="flex w-full flex-wrap text-black mt-5 text-white items-center justify-center pt-2 md:w-1/2 md:p-4">
                {isEditing &&
                  <textarea className="ml-2 scrollbar border-2 border-red-300 rounded-3xl w-full break-words text-center justify-center p-4 text-lg xl:text-xl 2xl:text-2xl 2xl:p-7 2xl:text-3xl" style={{
                    background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100%25\' height=\'100%25\' viewBox=\'0 0 533 366\' fill=\'none\'%3E%3Cpath d=\'M0 30C0 13.4315 13.4315 0 30 0H503C519.569 0 533 13.4315 533 30V336C533 352.569 519.569 366 503 366H30C13.4315 366 0 352.569 0 336V30Z\' fill=\'url(%23paint0_linear_353_105)\' fill-opacity=\'0.8\'/%3E%3Cdefs%3E%3ClinearGradient id=\'paint0_linear_353_105\' x1=\'167.007\' y1=\'565.656\' x2=\'141.019\' y2=\'-106.015\' gradientUnits=\'userSpaceOnUse\'%3E%3Cstop stop-color=\'%23362759\'/%3E%3Cstop offset=\'1\' stop-color=\'%235601F4\' stop-opacity=\'0\'/%3E%3C/linearGradient%3E%3C/defs%3E%3C/svg%3E")',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    whiteSpace: 'pre-wrap', // Add this line to enable word wrapping
                    resize: 'none',
                  }}
                    rows={5}
                    type="text"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                  />
                }
                {isEditing && <button className="bottom-2 m-3 rounded-2xl border-solid border-2 border-indigo-100 bg-transparent" onClick={() => handleSubmit()}>Submit</button>}
              </div>
            </div>

          </div>
          <div className='flex flex-col w-4/5 m-5 h-full mx-auto items-center justify-center sm:w-2/3' style={{
            background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100%25\' height=\'100%25\' viewBox=\'0 0 533 366\' fill=\'none\'%3E%3Cpath d=\'M0 30C0 13.4315 13.4315 0 30 0H503C519.569 0 533 13.4315 533 30V336C533 352.569 519.569 366 503 366H30C13.4315 366 0 352.569 0 336V30Z\' fill=\'url(%23paint0_linear_353_105)\' fill-opacity=\'0.8\'/%3E%3Cdefs%3E%3ClinearGradient id=\'paint0_linear_353_105\' x1=\'167.007\' y1=\'565.656\' x2=\'141.019\' y2=\'-106.015\' gradientUnits=\'userSpaceOnUse\'%3E%3Cstop stop-color=\'%23362759\'/%3E%3Cstop offset=\'1\' stop-color=\'%235601F4\' stop-opacity=\'0\'/%3E%3C/linearGradient%3E%3C/defs%3E%3C/svg%3E")',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
          }}>
            <h1 className='items-center text-white text-xl my-4'>Received gifts</h1>
            {//visibleGifts.length > 0 && (<button className='items-center text-white text-xl mb-4' onClick={handleLoadMoreGifts}>Load More</button>)}
            }
            {user && user.gifts.map(gift => (
              <div className=' flex flex-row m-2 h-10 w-full items-center justify-center'>
                <img className=' h-full w-10 mr-5 rounded-full ' draggable="false" src={gift.from.image.url} />
                <div className='mx-4'><Link className='text-white' to={`/users/${gift.from.username}`}>{gift.from.username}</Link></div>
                <img className='h-full ml-3 w-10 mr-5 rounded-full' draggable="false" src={myMap.get(gift.gift.Name)} />
              </div>
            ))}
          </div>
        </div>)}
  </>
  );
}
