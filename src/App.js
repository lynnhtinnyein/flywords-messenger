import axios from "axios";
import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import Welcome from "./components/Welcome";
import NavBar from "./components/NavBar";
import Conversation from "./components/Conversation";
import useDeviceDetect from "./hooks/useDeviceDetect";

const App = () => {

    const { isMobile } = useDeviceDetect();
    const [socket, setSocket] = useState(null);

    const [showDrawer, setShowDrawer] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [currentChannel, setCurrentChannel] = useState(null); 
    const [joinedChannels, setJoinedChannels] = useState([]); // obj array

    //mounted
    useEffect(() => {
        const newSocket = io("http://localhost:4000");
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    //methods
        const createChannel = () => {

            axios.post('http://localhost:4000', { user: currentUser })
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
                        params: { channelName }
                    })
                    .then( res => {
                        if(res.data.channel){
                            socket.emit('subscribe', {
                                name: channelName,
                                user: currentUser
                            });
                            setJoinedChannels( prevChannels => [...prevChannels, res.data.channel]);
                            setCurrentChannel(res.data.channel.name);
                        } else {
                            window.alert('Chat Room does not exist!')
                        }
                    })
                    .catch( () => {
                        window.alert('Chat Room does not exist!')
                    });
                }
            }
        };

    return (
        <div className="flex flex-col h-screen w-screen">
            { (currentUser === null || joinedChannels.length === 0) ? (
                <Welcome 
                    createChannel={createChannel}
                    joinChannel={joinChannel}
                    setCurrentUser={setCurrentUser}
                />
            ) : (
                <div className="flex flex-row">

                    { !isMobile && (
                        <div className="bg-white w-80"/>
                    )}
                    {/* sidebar */}
                    <NavBar
                        socket={socket}
                        currentUser={currentUser}
                        showDrawer={showDrawer}
                        setShowDrawer={setShowDrawer}
                        createChannel={createChannel}
                        joinChannel={joinChannel}
                        joinedChannels={joinedChannels}
                        currentChannel={currentChannel}
                        setCurrentChannel={setCurrentChannel}
                    />
                    <Conversation
                        socket={socket}
                        currentChannel={currentChannel}
                        showDrawer={showDrawer}
                        setShowDrawer={setShowDrawer}
                        joinedChannels={joinedChannels}
                        currentUser={currentUser}
                    />
                </div>
            )}

        </div>
    );
};

export default App;
