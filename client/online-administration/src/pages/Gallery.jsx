import React, { useState, useEffect, useContext } from 'react';
import UserContext from "../UserContext";
import ChatContext from "../ChatContext";
import { NotificationContext } from "../NotificationContext";

const Gallery = () => {
    const token = localStorage.getItem("token")
    const { chatOpened, inCall } = useContext(ChatContext)
    const { user } = useContext(UserContext)

    return (
        <>
            {user && user.photos ? (
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