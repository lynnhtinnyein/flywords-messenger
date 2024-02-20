import axios from "axios";
import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import Welcome from "./components/Welcome";
import NavBar from "./components/NavBar";
import Conversation from "./components/Conversation";
import useDeviceDetect from "./hooks/useDeviceDetect";

const App = () => {

    const serverLink = process.env.REACT_APP_API_URL;

    const { isMobile } = useDeviceDetect();
    const [socket, setSocket] = useState(null);

    const [currentUser, setCurrentUser] = useState(null);
    const [currentChannelId, setCurrentChannelId] = useState(null); 
    const [joinedChannels, setJoinedChannels] = useState([]); // obj array

    const [showDrawer, setShowDrawer] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    //mounted
    useEffect(() => {
        const newSocket = io(serverLink);
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    //methods
        const createChannel = () => {
            axios.post('http://localhost:4000', { user: currentUser })
            .then( res => {
                joinChannel(res.data.id)
            })
            .catch( error => {
                window.alert(error.response ? error.response.data.msg : 'Cannot Connect to Server!');
            });
        };

        const joinChannel = (channelId) => {
            if(channelId !== ''){
                const requestDataToJoin = { 
                    id: channelId,
                    requestedBy: currentUser
                }

                //check channel exists or not
                axios.get('http://localhost:4000', {
                    params: requestDataToJoin
                })
                .then( res => {
                    setJoinedChannels( prevChannels => {
                        const newChannel = res.data;
                        const alreadyJoined = prevChannels.find( e => e.id === channelId);
                        const otherChannels = prevChannels.filter( e => e.id !== channelId);
                        const alreadySubscribed = alreadyJoined ? alreadyJoined.joinedUsers.find( e => e.id === currentUser.id) : false;

                        if(!alreadySubscribed){
                            socket.emit('subscribe', requestDataToJoin);
                        }

                        return alreadyJoined ? [...otherChannels, newChannel] : [...prevChannels, newChannel];
                    });
                    setCurrentChannelId(channelId);
                })
                .catch( (error) => {
                    window.alert(error.response ? error.response.data.msg : 'Cannot Connect to Server!');
                });
            }
        };

    return (
        <div className={`flex flex-col h-screen w-screen ${ isDarkMode && 'dark' }`}>
            { (currentUser === null || joinedChannels.length === 0) ? (
                <Welcome 
                    createChannel={createChannel}
                    joinChannel={joinChannel}
                    setCurrentUser={setCurrentUser}
                />
            ) : (
                <div className="flex flex-row">

                    { !isMobile && (
                        <div className="bg-white w-80 dark:bg-zinc-700"/>
                    )}
                    {/* sidebar */}
                    <NavBar
                        socket={socket}
                        showDrawer={showDrawer}
                        setShowDrawer={setShowDrawer}
                        currentUser={currentUser}
                        currentChannelId={currentChannelId}
                        setCurrentChannelId={setCurrentChannelId}
                        createChannel={createChannel}
                        joinChannel={joinChannel}
                        joinedChannels={joinedChannels}
                        setJoinedChannels={setJoinedChannels}
                        isDarkMode={isDarkMode}
                        setIsDarkMode={setIsDarkMode}
                    />
                    <Conversation
                        socket={socket}
                        currentUser={currentUser}
                        currentChannelId={currentChannelId}
                        showDrawer={showDrawer}
                        setShowDrawer={setShowDrawer}
                        joinChannel={joinChannel}
                        joinedChannels={joinedChannels}
                        setJoinedChannels={setJoinedChannels}
                    />
                </div>
            )}

        </div>
    );
};

export default App;
