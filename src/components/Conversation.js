import React, { memo, useEffect, useMemo, useState } from "react";
import useDeviceDetect from "../hooks/useDeviceDetect";

const Conversation = ({
    socket,
    currentChannel,
    showDrawer,
    setShowDrawer,
    joinedChannels,
    currentUser,
}) => {
    const { isMobile } = useDeviceDetect();

    const [messagesByChannel, setMessagesByChannel] = useState([]); // obj array
    const [subscribedChannels, setSubscribedChannels] = useState([]); // simple array
    const [deletedChannels, setDeletedChannels] = useState([]); // simple array

    //input
    const [messageInput, setMessageInput] = useState("");

    useEffect(() => {
        if (socket && joinedChannels.length !== 0) {
            setSubscribedChannels((prevSubscribedChannels) => {
                const newSubscribedChannels = [];

                joinedChannels.forEach((channel) => {
                    if (!prevSubscribedChannels.includes(channel.name)) {
                        subscribe(channel);
                        newSubscribedChannels.push(channel.name);
                    }
                });

                return [...prevSubscribedChannels, ...newSubscribedChannels];
            });
        }
    }, [socket, joinedChannels]);

    //computed
    const messagesToDisplay = useMemo(() => {
        const targetMessages = messagesByChannel.find(
            (e) => e.channelName === currentChannel
        )?.messages;
        return targetMessages || [];
    }, [currentChannel, messagesByChannel]);

    //methods
    const subscribe = (channel) => {
        socket.on("receivedMessage" + channel.name, (newMessage) => {
            setMessagesByChannel((prev) => {
                const targetChannel = prev.find(
                    (e) => e.channelName === channel.name
                );
                const otherChannels = prev.filter(
                    (e) => e.channelName !== channel.name
                );

                const newMessages = targetChannel
                    ? [...targetChannel.messages, newMessage]
                    : [newMessage];

                return [
                    ...otherChannels,
                    {
                        channelName: channel.name,
                        messages: newMessages,
                    },
                ];
            });
        });

        socket.on("channelDeleted" + channel.name, () => {
            setDeletedChannels((prev) => [...prev, channel.name]);
        });

        socket.on("joinedUser" + channel.name, () => {
            //fix
            // setDeletedChannels((prev) => [...prev, channel.name]);
        });
    };

    const sendMessage = () => {
        if (messageInput !== "" && !deletedChannels.includes(currentChannel)) {
            socket.emit("sendMessage" + currentChannel, {
                text: messageInput,
                sentBy: currentUser,
            });
            setMessageInput('');
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(currentChannel);
    };

    return (
        <>
            { currentChannel ? (
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
                            <span className="font-bold">{currentChannel}</span>
                            <button
                                className="bg-gray-200 px-2 rounded-full hover:bg-gray-300 active:bg-gray-400"
                                onClick={copyToClipboard}
                            >
                                <i className="fa-regular text-gray-700 fa-copy"></i>
                            </button>
                        </div>
                        <div className="flex flex-1 items-center justify-end">
                            <button className="mr-3">
                                <i className="fa-solid fa-user"></i>
                                <span className="absolute top-1 right-3 font-bold bg-red-500 text-xs rounded-full text-white px-1 border-2 border-white">
                                    2
                                </span>
                            </button>
                        </div>
                    </div>

                    {deletedChannels.includes(currentChannel) && (
                        <div className="flex flex-row items-center justify-center bg-red-200 py-2">
                            <span className="text-xs">
                                This Chat Room is no longer available!
                            </span>
                        </div>
                    )}

                    {/* messages screen */}
                    <div className="flex flex-1 flex-col overflow-y-auto h-screen py-5">
                        <div className="flex flex-1">
                            {/* just a trick:: to make msgs justify at the end, cuz justify-end is not working properly with scrollview */}
                        </div>

                        {messagesToDisplay.map((message, index) => (
                            <div
                                key={index}
                                className={`flex flex-row my-2 mx-3 
                                    ${
                                        message.sentBy === currentUser
                                            ? "justify-end"
                                            : "justify-start"
                                    }`}
                            >
                                <div className="flex flex-col">
                                    <span
                                        className={`text-xs mx-1 mb-1 text-gray-600 ${
                                            message.sentBy === currentUser
                                                ? "self-end"
                                                : "self-start"
                                        }`}
                                    >
                                        {message.sentBy === currentUser
                                            ? "You"
                                            : message.sentBy}
                                    </span>
                                    <div
                                        className={`bg-green-100 px-2 pb-2 pt-1 rounded-xl border border-black break-words max-w-sm 
                                            ${
                                                message.sentBy === currentUser
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
