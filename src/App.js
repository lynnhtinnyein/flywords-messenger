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

    const [currentUser, setCurrentUser] = useState(null);
    const [currentChannelId, setCurrentChannelId] = useState(null); 
    const [joinedChannels, setJoinedChannels] = useState([]); // obj array

    const [showDrawer, setShowDrawer] = useState(false);

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
                joinChannel(res.data.id)
            })
            .catch( error => {
                window.alert(error.response.data.msg)
            });
        };

        const joinChannel = (channelId) => {

            if(channelId !== ''){
                const alreadyJoined = joinedChannels.find( e => e.id === channelId);

                if(alreadyJoined){
                    setCurrentChannelId(channelId);
                } else {

                    const requestDataToJoin = { 
                        id: channelId,
                        requestedBy: currentUser
                    }

                    //check channel exists or not
                    axios.get('http://localhost:4000', {
                        params: requestDataToJoin
                    })
                    .then( res => {
                        socket.emit('subscribe', requestDataToJoin);
                        setJoinedChannels( prevChannels => [...prevChannels, res.data]);
                        setCurrentChannelId(channelId);
                    })
                    .catch( (error) => {
                        window.alert(error.response.data.msg)
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
                        showDrawer={showDrawer}
                        setShowDrawer={setShowDrawer}
                        currentUser={currentUser}
                        currentChannelId={currentChannelId}
                        setCurrentChannelId={setCurrentChannelId}
                        createChannel={createChannel}
                        joinChannel={joinChannel}
                        joinedChannels={joinedChannels}
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
