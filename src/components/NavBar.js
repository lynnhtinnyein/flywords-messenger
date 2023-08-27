import { memo, useEffect, useState } from "react";
import useDeviceDetect from "../hooks/useDeviceDetect";

const NavBar = ({ 
    socket,
    currentUser,
    showDrawer, 
    setShowDrawer, 
    createChannel,
    joinedChannels,
    setJoinedChannels,
    joinChannel,
    currentChannelId,
    setCurrentChannelId
}) => {

    const { isMobile } = useDeviceDetect();

    const [showJoinChannelInput, setShowJoinChannelInput] = useState(false);
    const [joinChannelInput, setJoinChannelInput] = useState('');
    
    useEffect( () => {
        setShowDrawer(!isMobile);
    }, [isMobile]);
    
    //methods
    const leaveChannel = (channelId) => {
        if(window.confirm('Leave this Room?')){

            setJoinedChannels( prev => {
                return prev.filter( e => e.id !== channelId);
            });

            if(channelId === currentChannelId){
                setCurrentChannelId(null);
            }
            socket.emit('unsubscribe', { 
                id: channelId,
                requestedBy: currentUser
            })
        }
    }

    const handleKeyPress = (event) => {
        if (event.key === "Enter") {
            joinChannel(joinChannelInput);
        }
    }

    return (
        <div
            className={`absolute flex flex-col w-80 bg-white bottom-0 top-0 shadow-xl transition-all duration-300 
            ${showDrawer ? "left-0" : "-left-80"}`}
        >

            {/* first row */}
            <div className="flex flex-row items-center justify-between p-3 border-b border-b-gray-300">
                <span className="font-bold italic">FlyWords Messenger</span>

                { isMobile && (
                    <button
                        className="border border-black px-3 py-1 rounded active:bg-gray-300"
                        onClick={() => setShowDrawer(!showDrawer)}
                    >
                        <i className="fa-solid fa-angles-left"></i>
                    </button>
                )}
            </div>

            {/* second row */}
            <div className="flex flex-col border-b border-b-gray-300 p-3">
                <div className="flex flex-row items-center justify-between space-x-2">
                    <div className="flex-1">
                        <button
                            className="flex flex-row items-center justify-center border border-black rounded space-x-1 px-2 py-1 bg-green-200 w-full"
                            onClick={createChannel}
                        >
                            <i className="fa-solid fa-plus text-xs"></i>
                            <span className="text-xs">Create New Room</span>
                        </button>
                    </div>
                    <div className="flex-1">
                        <button
                            className="flex flex-row items-center justify-center border border-black rounded space-x-1 px-2 py-1 bg-blue-200 w-full"
                            onClick={() =>
                                setShowJoinChannelInput(!showJoinChannelInput)
                            }
                        >
                            <i className="fa-solid fa-link text-xs"></i>
                            <span className="text-xs">Join Chat Room</span>
                        </button>
                    </div>
                </div>

                <div
                    className={`overflow-hidden transition-all duration-200 ${
                        showJoinChannelInput ? "max-h-12" : "max-h-0"
                    }`}
                >
                    <div className="flex flex-row border border-black rounded mt-2">
                        <input
                            type="text"
                            placeholder="Enter Room ID"
                            className="flex-1 rounded px-2 text-xs"
                            value={joinChannelInput}
                            onChange={(e) =>
                                setJoinChannelInput(e.target.value)
                            }
                            onKeyUp={handleKeyPress}
                        />
                        <button
                            className="bg-green-300 rounded pb-1 m-1 hover:bg-green-400 active:bg-green-500"
                            onClick={() => joinChannel(joinChannelInput)}
                        >
                            <span className="text-xs px-3">Join</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* third row */}
            <div className="flex-1 overflow-y-auto max-h-screen">
                {joinedChannels.map((channel, index) => (
                    <div
                        key={index}
                        className={channel.id === currentChannelId ? 'bg-gray-200' : ''}
                    >
                        <div className="flex flex-row border-b border-b-gray-200 justify-between items-center py-2">
                            <div
                                className="flex-1 flex-col space-y-1 px-4 cursor-pointer"
                                onClick={() => {
                                    setCurrentChannelId(channel.id);
                                    isMobile && setShowDrawer(false);
                                }}
                            >
                                <div>
                                    <span className="text-gray-500 text-sm font-bold mr-2">
                                        Room
                                    </span>
                                    <span className="font-bold text-sm">
                                        {channel.id}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-400">
                                        Created By - { channel.createdBy.id === currentUser.id
                                            ? 'You'
                                            : channel.createdBy.name
                                        }
                                    </span>
                                </div>
                            </div>
                            <button
                                className="p-5"
                                onClick={() => leaveChannel(channel.id)}
                            >
                                <i className="fa-solid fa-x text-xs text-gray-400"></i>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default memo(NavBar);
