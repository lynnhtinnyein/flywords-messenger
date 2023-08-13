import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import io from "socket.io-client";
import Welcome from "./components/Welcome";

const App = () => {
    const [socket, setSocket] = useState(null);

    const [showDrawer, setShowDrawer] = useState(false);
    const [showJoinChannelInput, setShowJoinChannelInput] = useState(false);

    //inputes
    const [joinChannelInput, setJoinChannelInput] = useState('');
    const [messageInput, setMessageInput] = useState('');

    const [currentUser, setCurrentUser] = useState(null);
    const [currentChannel, setCurrentChannel] = useState(null); 
    const [joinedChannels, setJoinedChannels] = useState([]); // single value array
    const [messagesByChannel, setMessagesByChannel] = useState([]); // obj array

    useEffect(() => {
        const newSocket = io("http://localhost:4000");
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (socket) {
            joinedChannels.forEach( channel => {
                socket.on( channel.name + "_has_new_msg", (newMessage) => {

                    setMessageInput('')
                    setMessagesByChannel( prev => {
                        const targetChannel = prev.find( e => e.channelName === channel.name );
                        const otherChannels = prev.filter( e => e.channelName !== channel.name );

                        const newMessages = targetChannel 
                        ? [...targetChannel.messages, newMessage]
                        : [newMessage];

                        return [...otherChannels, {
                            channelName: channel.name,
                            messages: newMessages
                        }]
                    });
                }); 
            });
        }
    }, [socket, joinedChannels]);

    //computed
        const messagesToDisplay = useMemo( () => {
            const targetMessages = messagesByChannel.find( e => e.channelName === currentChannel)?.messages;
            return targetMessages || [];
        }, [currentChannel, messagesByChannel]);

    //methods
        const createChannel = () => {

            axios.post('http://localhost:4000', { currentUser })
            .then( res => {
                joinChannel(res.data)
            })
            .catch( error => {
                window.alert(error.response.data.msg)
            });
        };

        const joinChannel = (channelName) => {

            if(channelName !== ''){
                const alreadyJoined = joinedChannels.find( e => e.name === channelName);

                if(alreadyJoined){
                    setCurrentChannel(channelName);
                } else {
                    //check channel exists or not
                    axios.get('http://localhost:4000', {
                        params: { 
                            channelName,
                            currentUser
                        }
                    })
                    .then( res => {
                        console.log(res.data.channel)
                        if(res.data.channel){
                            setJoinedChannels( prevChannels => [...prevChannels, res.data.channel]);
                            setCurrentUser(res.data.joinedBy);
                            setCurrentChannel(res.data.channel.name);
                            socket.emit('reHostChannels');
                        } else {
                            window.alert('Chat Room does not exist!')
                        }
                    })
                    .catch( () => {
                        console.log('error')
                        window.alert('Chat Room does not exist!')
                    });
                }
            }
        };

        const sendMessage = () => {
            if(messageInput !== ''){
                socket.emit('send_to_' + currentChannel, {
                    text: messageInput,
                    sentBy: currentUser
                });
            }
        };

        const leaveChannel = (channelName) => {
            console.log(channelName)
        }

        const copyToClipboard = () => {
            navigator.clipboard.writeText(currentChannel)
        };

    return (
        <div className="flex flex-col h-screen w-screen">

            { joinedChannels.length === 0 ? (
                <Welcome 
                    createChannel={createChannel}
                    joinChannel={joinChannel}
                />
            ) : (
                <>
                    {/* sidebar */}
                    <div className={`absolute w-80 bg-white bottom-0 top-0 shadow-xl transition-all duration-300 ${showDrawer ? 'left-0' : '-left-80'}`}>

                        <div className="flex flex-row items-center justify-between p-3 border-b border-b-gray-300">
                            <span className="font-bold italic">FlyWords Messenger</span>
                            <button className="border border-black px-3 py-1 rounded active:bg-gray-300"
                                onClick={ () => setShowDrawer(!showDrawer)}
                            >
                                <i class="fa-solid fa-angles-left"></i>
                            </button>
                        </div>

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
                                        onClick={ () => setShowJoinChannelInput(!showJoinChannelInput)}
                                    >
                                        <i className="fa-solid fa-link text-xs"></i>
                                        <span className="text-xs">Join Chat Room</span>
                                    </button>
                                </div>
                            </div>

                            <div className={`overflow-hidden transition-all duration-200 ${showJoinChannelInput ? 'max-h-12' : 'max-h-0'}`}>
                                <div className="flex flex-row border border-black rounded mt-2">
                                    <input 
                                        type="text"
                                        placeholder="Enter Room ID" 
                                        className="flex-1 rounded px-2 text-xs"
                                        value={joinChannelInput}
                                        onChange={ e => setJoinChannelInput(e.target.value) }
                                    />
                                    <button 
                                        className="bg-green-300 rounded pb-1 m-1"
                                        onClick={ () => joinChannel(joinChannelInput)}
                                    >
                                        <span className="text-xs px-3">Join</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        { joinedChannels.map( (channel, index) => 
                            <div  
                                key={index} 
                                className={`border-b border-b-gray-200 transition-all duration-400 overflow-hidden 
                                ${true ? 'max-h-24' : 'max-h-0'} 
                                ${ (channel.name === currentChannel) && 'bg-gray-200 '}`}
                            >
                                <div className="flex flex-row justify-between items-center my-1">
                                    <div 
                                        className="flex-1 flex-col space-y-3 px-4 cursor-pointer"
                                        onClick={ () => {
                                            setCurrentChannel(channel.name)
                                            setShowDrawer(false);
                                        }}
                                    >
                                        <div className="mt-3 mb-2">
                                            <span className="text-gray-500 text-sm font-bold mr-2">
                                                Room
                                            </span>
                                            <span className="font-bold text-sm">
                                                { channel.name }
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            Created By - {channel.createdBy}
                                        </span>
                                    </div>
                                    <button 
                                        className="p-5"
                                        onClick={ () => leaveChannel(channel.name)}
                                    >
                                        <i class="fa-solid fa-x text-xs text-gray-400"></i>
                                    </button>
                                </div>
                            </div>
                        )}
                        
                    </div>

                    {/* header */}
                    <div className="flex flex-row items-center justify-center bg-white py-3 px-3 space-x-2 border-b border-b-gray-400">
                        <div className="flex flex-1">
                            <button onClick={ () => setShowDrawer(!showDrawer)}>
                                <i class="fa-solid text-lg fa-bars-staggered"></i>
                            </button>
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

                    {/* messages screen */}
                    <div className="flex flex-1 flex-col overflow-y-auto h-screen py-5">

                        <div class="flex flex-1">
                            {/* just a trick:: to make justify at the end, cuz justify-end is not working with scrollview */}
                        </div>

                        { messagesToDisplay.map( (message, index) => 
                            <div 
                                key={index} 
                                className={`flex flex-row m-2 
                                ${ message.sentBy === currentUser ? 'justify-end' : 'justify-start' }`}
                            >
                                <div className="flex flex-col">
                                    <span className="text-xs mx-1 mb-1 text-gray-600 self-end">
                                        { message.sentBy === currentUser ? 'You' : message.sentBy }
                                    </span>
                                    <div 
                                        className={`bg-green-100 px-2 pb-2 pt-1 rounded-xl border border-black break-words max-w-sm 
                                        ${ message.sentBy === currentUser ? 'bg-green-100' : 'bg-white'}`}
                                    >
                                        <span className="text-xs break-words">
                                            { message.text }
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* input */}
                    <div className="flex flex-row items-center justify-center bg-white p-3 space-x-2 border-t border-t-gray-400">
                        <input 
                            type="text" 
                            placeholder="Message..." 
                            className="flex flex-1 border border-black text-xs rounded-full px-5 py-3"    
                            value={messageInput}
                            onChange={ e => setMessageInput(e.target.value)}
                        />
                    
                        <button 
                            className="bg-green-300 hover:bg-green-400 active:bg-green-500 py-2 px-3 rounded-full shadow"
                            onClick={sendMessage}
                        >
                            <i className="fa-solid fa-paper-plane text-xl mr-1"></i>
                        </button>
                    </div>
                </>
            )}

        </div>
    );
};

export default App;
