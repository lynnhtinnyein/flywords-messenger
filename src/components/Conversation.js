import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import useDeviceDetect from "../hooks/useDeviceDetect";

const Conversation = ({
    socket,
    currentUser,
    currentChannelId,
    showDrawer,
    setShowDrawer,
    joinChannel,
    joinedChannels,
    setJoinedChannels
}) => {
    const { isMobile } = useDeviceDetect();

    const messagesScreenRef = useRef(null);
    const [messagesByChannel, setMessagesByChannel] = useState([]); // obj array
    const [listeningChannels, setListeningChannels] = useState([]); // simple array
    const [showJoindedUsers, setShowJoinedUsers] = useState(false);
    
    //input
    const [messageInput, setMessageInput] = useState("");

    useEffect(() => {
        if (socket && joinedChannels.length !== 0) {
            setListeningChannels((prev) => {
                const newListeningChannels = [];
                joinedChannels.forEach( channel => {
                    if ( !prev.includes(channel.id) && channel.joinedUsers.find( e => e.id === currentUser.id) ) {
                        listen(channel);
                        newListeningChannels.push(channel.id);
                    }
                });
                return [...prev, ...newListeningChannels];
            });
        }
    }, [socket, joinedChannels]);

    //computed
        const messagesToDisplay = useMemo(() => {
            const targetChannelMessages = messagesByChannel.find(
                (e) => e.channelId === currentChannelId
            )?.messages;
            return targetChannelMessages || [];
        }, [currentChannelId, messagesByChannel]);

        const joinedUsers = useMemo( () => {
            const channel = joinedChannels.find( e => e.id === currentChannelId )
            const users = channel ? channel.joinedUsers : [];
            return users;
        }, [currentChannelId, joinedChannels]);

        const hasLeft = useMemo( () => {
            return !joinedUsers.map( e => e.id ).includes(currentUser.id);
        }, [joinedUsers]);

    //methods        
        const listen = (channel) => {

            const setNewMessage = (message) => {
                setMessagesByChannel((prev) => {
                    const newSet = [...prev];
                    const targetChannelIndex = newSet.findIndex((e) => e.channelId === channel.id);
                    if (targetChannelIndex !== -1) {
                        newSet[targetChannelIndex].messages.push(message);
                    } else {
                        newSet.push({
                            channelId: channel.id,
                            messages: [message]
                        });
                    }
                    return newSet;
                });
            }
            
            socket.on("receivedMessage" + channel.id, setNewMessage);

            socket.on("userJoined" + channel.id, (data) => {
                if(currentUser.id !== data.joinedUser.id){
                    setNewMessage(data.message);
                    setJoinedChannels( prev => {
                        const newSet = [...prev];
                        const targetChannelIndex = newSet.findIndex( e => e.id === channel.id );
                        channel.joinedUsers = [...channel.joinedUsers, data.joinedUser];
                        newSet[targetChannelIndex] = channel;
                        return newSet;
                    });
                }
            });
            
            socket.on("channelDisconnected" + channel.id, (data) => {

                if(currentUser.id === data.leftUserId){
                    socket.off("receivedMessage" + channel.id, setNewMessage);

                    setListeningChannels((prev) => {
                        return prev.filter( e => e !== channel.id);
                    });
                }

                setNewMessage(data.message); //show in conversation that user is disconnected
                setJoinedChannels( prev => {
                    const newSet = [...prev];
                    const targetChannelIndex = newSet.findIndex( e => e.id === channel.id );
                    channel.joinedUsers = channel.joinedUsers.filter( e => e.id !== data.leftUserId );
                    newSet[targetChannelIndex] = channel;
                    return newSet;
                });
            });
        };
    
        const sendMessage = () => {
            if (messageInput !== "") {
                socket.emit("sendMessage" + currentChannelId, {
                    text: messageInput,
                    sentBy: currentUser,
                });
                setMessageInput('');
                setTimeout(() => {
                    if (messagesScreenRef.current) {
                        console.log(messagesScreenRef.current.scrollTop, messagesScreenRef.current.scrollHeight)
                        messagesScreenRef.current.scrollTop = messagesScreenRef.current.scrollHeight;
                    }
                }, 200);
            }
        };

        const copyToClipboard = () => {
            navigator.clipboard.writeText(currentChannelId);
        };

        const handleKeyPress = (event) => {
            if (event.key === "Enter") {
                sendMessage();
            }
        }

    return (
        <>
            { currentChannelId ? (
                <div className="flex flex-1 flex-col h-screen">
                    {/* header */}
                    <div className="flex flex-row items-center justify-center bg-white py-3 px-3 space-x-2 border-b border-b-gray-400">
                        <div className="flex flex-1">
                            {isMobile && (
                                <button
                                    onClick={() => setShowDrawer(!showDrawer)}
                                >
                                    <i className="fa-solid text-lg fa-bars-staggered"></i>
                                </button>
                            )}
                        </div>
                        <div className="flex flex-1 flex-row items-center justify-center space-x-2">
                            <span className="font-bold">{currentChannelId}</span>
                            <button
                                className="bg-gray-200 px-2 rounded-full hover:bg-gray-300 active:bg-gray-400"
                                onClick={copyToClipboard}
                            >
                                <i className="fa-regular text-gray-700 fa-copy"></i>
                            </button>
                        </div>
                        <div className="flex flex-1 items-center justify-end">
                            <button 
                                className="relative mr-3"
                                onClick={ () => setShowJoinedUsers(!showJoindedUsers)}
                            >
                                <i className="fa-solid fa-user"></i>
                                <span className="absolute bottom-3 left-2 font-bold bg-red-500 text-xs rounded-full text-white px-1 border-2 border-white">
                                    { joinedUsers.length }
                                </span>
                            </button>
                            { showJoindedUsers && (
                                <div className="flex flex-col absolute top-10 space-y-2 opacity-80 bg-zinc-700 border border-gray-300 rounded py-2 px-3">
                                    { joinedUsers.length === 0 ? (
                                        <span className="text-xs text-white">
                                            No One Joined
                                        </span>
                                    ) : (
                                        joinedUsers.map( (user, index) => 
                                            <span key={index} className="text-xs text-white">
                                                { user.name }
                                            </span>
                                        )
                                    )}
                                </div>
                                
                            )}
                        </div>
                    </div>

                    { hasLeft && 
                        <div className="flex flex-row items-center justify-center bg-red-200 py-2 space-x-1">
                            <span className="text-xs">
                                You've left from this chat because of inactivity.
                            </span>
                            <span
                                className="text-xs cursor-pointer underline" 
                                onClick={ () => joinChannel(currentChannelId) }
                            >
                                ReJoin
                            </span>
                        </div>
                    }

                    {/* messages screen */}
                    <div 
                        ref={messagesScreenRef}
                        className="flex flex-1 flex-col overflow-y-auto h-screen py-5 scroll-smooth"
                    >
                        <div className="flex flex-1">
                            {/* just a trick:: to make msgs justify at the end, cuz justify-end is not working properly with scrollview */}
                        </div>

                        {messagesToDisplay.map((message, index) => (
                            message.sentBy.name === 'server' ? (
                                <div 
                                    key={index}
                                    className="flex flex-row justify-center my-2"
                                >
                                    <span className="text-xs text-gray-400">
                                        {message.text}
                                    </span>
                                </div>
                            ) : (
                                <div
                                    key={index}
                                    className={`flex flex-row my-2 mx-3 
                                        ${
                                            message.sentBy.id === currentUser.id
                                                ? "justify-end"
                                                : "justify-start"
                                        }`}
                                >
                                    <div className="flex flex-col">
                                        <span
                                            className={`text-xs mx-1 mb-1 text-gray-600 ${
                                                message.sentBy.id === currentUser.id
                                                    ? "self-end"
                                                    : "self-start"
                                            }`}
                                        >
                                            {message.sentBy.id === currentUser.id
                                                ? "You"
                                                : message.sentBy.name}
                                        </span>
                                        <div
                                            className={`bg-green-100 px-2 pb-2 pt-1 rounded-xl border border-black break-words max-w-sm 
                                                ${
                                                    message.sentBy.id === currentUser.id
                                                        ? "bg-green-100"
                                                        : "bg-white"
                                                }`}
                                        >
                                            <span className="text-xs break-words">
                                                {message.text}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>

                    {/* input */}
                    <div className="flex flex-row items-center justify-center bg-white p-3 space-x-2 border-t border-t-gray-400">
                        <input
                            type="text"
                            placeholder="Message..."
                            className="flex flex-1 border border-black text-xs rounded-full px-4 py-3"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyUp={handleKeyPress}
                        />

                        <button
                            className="bg-green-300 hover:bg-green-400 active:bg-green-500 py-2 px-3 rounded-full shadow"
                            onClick={sendMessage}
                        >
                            <i className="fa-solid fa-paper-plane text-xl mr-1"></i>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-1 flex-col h-screen">
                    {/* header */}
                    <div className="flex flex-row items-center justify-center bg-white py-3 px-3 space-x-2 border-b border-b-gray-400">
                        <div className="flex flex-1">
                            {isMobile && (
                                <button
                                    onClick={() => setShowDrawer(!showDrawer)}
                                >
                                    <i className="fa-solid text-lg fa-bars-staggered"></i>
                                </button>
                            )}
                        </div>
                        <div className="flex flex-1 flex-row items-center justify-center space-x-2">
                            <span className="font-bold">Welcome</span>
                        </div>
                        <div className="flex-1">
                            {/* empty */}
                        </div>
                    </div>

                    <div className="flex flex-1 flex-col items-center justify-center h-screen space-y-7">
                        <i className="fa-regular fa-comments text-9xl text-gray-300"></i>
                        <span className="text-gray-400">Create or Join a Chat Room</span>
                    </div>
                </div>
            )}
        </>
    );
};

export default memo(Conversation);
