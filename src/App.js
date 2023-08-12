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
        <div>
            {joinedChannels.map( (e,index) => 
                <span key={index}>{e.name}</span>
            )}
            <div>
                <button className="bg-red-200" onClick={createChannel}>Create Channel</button>
            </div>


            <div>
                <input
                    type="text"
                    placeholder="Enter existing channel ID..."
                    value={joinChannelInput}
                    onChange={(e) => setJoinChannelInput(e.target.value)}
                />
                <button className="bg-blue-200" 
                    onClick={() => joinChannel(joinChannelInput)}>
                    Join Channel
                </button>

            </div>
            <div>
                <input
                    type="text"
                    placeholder="Enter message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                />
                <button className="bg-green-200" onClick={sendMessage}>Send Message</button>
            </div>
            <div>
                <ul>
                    { messagesToDiplay.map( (message, index) => 
                        <li key={index}>{message.text}</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default App;
