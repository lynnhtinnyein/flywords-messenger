import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import io from "socket.io-client";

const App = () => {
    const [socket, setSocket] = useState(null);

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
        const messagesToDiplay = useMemo( () => {
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
            socket.emit('send_to_' + currentChannel, {
                text: messageInput,
                sentBy: currentUser
            });
        };

    return (
        <div className="flex flex-col h-screen w-screen">

            {/* header */}
            <div className="flex flex-row items-center justify-center bg-white py-3 px-3 space-x-2 border-b border-b-gray-400">
                <div className="flex flex-1">
                    <button>
                        <i class="fa-solid fa-bars-staggered"></i>
                    </button>
                </div>
                <div className="flex flex-1 justify-center">
                    <span>RoomID - {currentChannel}</span>
                </div>
                <div className="flex flex-1 justify-end">
                    <span className="text-gray-500">2 Persons</span>
                </div>
            </div>

            {/* messages screen */}
            <div className="flex bg-black-300 flex-col-reverse overflow-y-auto h-screen py-5">
                <div className="flex flex-row m-2 justify-end">
                    <div className="flex flex-col">
                        <span className="text-xs mx-2 text-gray-600 self-end">You</span>
                        <div className="bg-green-100 p-2 rounded-xl border border-black break-words max-w-sm">
                            <span className="text-xs pt-3 break-words">
                                ggjjkljdsljfjf
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-row m-2 justify-start">
                    <div className="flex flex-col">
                        <span className="text-xs mx-2 text-gray-600 self-start">You</span>
                        <div className="bg-white p-2 rounded-xl border border-black break-words max-w-sm">
                            <span className="text-xs pt-3 break-words">
                                ggjjkljdsljfjf
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* input */}
            <div className="flex flex-row items-center justify-center bg-white py-3 px-3 space-x-2 border-t border-t-gray-400">
                <input 
                    type="text" 
                    placeholder="Message..." 
                    className="border flex flex-1 border-black rounded-full px-5 py-2"    
                />
               
                <button className="bg-green-300 hover:bg-green-200 active:bg-green-100 py-2 px-3 rounded-full shadow">
                    <i className="fa-solid fa-paper-plane text-xl mr-1"></i>
                </button>
            </div>

        </div>
    );
};

export default App;
