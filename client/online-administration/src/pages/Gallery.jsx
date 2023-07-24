import React, { useState, useEffect, useContext } from 'react';
import UserContext from "../UserContext";
import ChatContext from "../ChatContext";
import { NotificationContext } from "../NotificationContext";
import ImageContext from "../ImageContext";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const Gallery = () => {
    const token = localStorage.getItem("token")
    const { user } = useContext(UserContext)
    const { imageContext, setImageContext } = useContext(ImageContext)
    const { chatOpened, setChatOpened, chatOpenedAfterRedirect, setChatOpenedAfterRedirect, chatWith, setChatWith, inCall, setInCall, isReceiveingCall, setIsReceiveingCall, isCalling, setIsCalling } = useContext(ChatContext)
    function openFullscreen(imageUrl) {
        console.log("chatOpened", chatOpened)
        console.log("imageUrl", imageUrl)
        setImageContext(imageUrl)
        // Add a click event listener to close the fullscreen view

    }
    function closeImage() {
        setImageContext(null)
    }

    useEffect(()=> {
        setChatOpened(false)
      },[])
    return (
        <>
            {imageContext && <div className="absolute flex flex-col bg-slate-900 items-center justify-center w-full h-full">
                <TransformWrapper >
                    <TransformComponent >
                        <img className="flex w-full h-full object-contain" src={imageContext} alt="Received Image" />
                    </TransformComponent>
                </TransformWrapper>
                <div className="fixed top-5 right-5"><button className="bg-transparent border border-white text-white text-xl" onClick={closeImage}>Close</button></div>
            </div>}
            {user && user.photos && !chatOpened && !imageContext && !inCall ? (
                <div className="flex flex-col full items-center justify-center my-10" style={{ background: 'linear-gradient(180deg, #000025 0%, #31019A 100%)' }}>
                    <div className='flex items-center justify-center w-full p-3'><p className='mx-auto text-2xl text-red-500 flex items-center text-center'>Unlocked photos</p></div>
                    <div className="grid  grid-cols-2 w-4/5 gap-8 my-5">
                        {user.photos.map((image) =>
                        (
                            <div className="flex flex-col mx-2 relative  text-center">
                                <img className="w-full rounded-2xl h-full" src={image.url} key={image.id} onClick={() => openFullscreen(image.url)} />
                            </div>
                        )
                        )}
                    </div>
                </div>
            ) : (<div><p>You did not purchase any photos yet.</p></div>)}
        </>
    )
}
export default Gallery