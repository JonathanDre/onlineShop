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

    console.log(user.photos)

    useEffect(() => {
        setChatOpened(false)
    }, [])
    return (
        <div className='flex flex-col w-full min-h-screen items-center justify-center bg-indigo-900'>
            {imageContext && <div className=" flex flex-col bg-slate-900 items-center justify-center max-w-screen max-h-screen">
                <TransformWrapper >
                    <TransformComponent >
                        <img className="flex max-w-screen max-h-screen object-contain" src={imageContext} alt="Received Image" />
                    </TransformComponent>
                </TransformWrapper>
                <div className="fixed top-5 right-5"><button className="bg-transparent border border-white text-white text-xl" onClick={() => closeImage()}>Close</button></div>
            </div>}
            {user && user.photos && user.photos.length > 0 && !chatOpened && !imageContext && !inCall && (
                <div className="top-0 left-0 flex flex-col w-full h-full items-center justify-center my-10" style={{ background: 'linear-gradient(180deg, #000025 0%, #31019A 100%)' }}>
                    <div className='flex items-center justify-center w-full p-3 h-full'><p className='mx-auto text-2xl text-red-500 flex items-center text-center'>Unlocked photos</p></div>
                    <div className="grid  grid-cols-3 w-4/5 gap-8 my-5">
                        {user.photos.map((album) => (
                            <>
                            {album.images.map((image) => (
                                    <img className="w-full rounded-2xl h-full" src={image.url} key={image.id} onClick={() => openFullscreen(image.url)} />
                                ))}
                            </>
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
export default Gallery