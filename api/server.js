const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const generateUniqueName = require("../src/helper/generateUniqueName");

const app = express();
app.use(cors());
app.use(express.json());

const channelLimit = 50;
let activeChannels = [];

//api routes
    //create
    app.post("/", (req, res) => {
        if (activeChannels.length >= channelLimit) {
            res.status(503).json({
                msg: "Server is currently overloaded! Please try again later.",
            });
        } else {
            const newChannelId = generateUniqueName();
            const createdBy = req.body.user;
            const newChannel = {
                id: newChannelId,
                createdBy: createdBy,
                joinedUsers: []
            };
            activeChannels.push(newChannel);
            res.json(newChannel);
        }
    });

    //join
    app.get("/", (req, res) => {
        const channelId = req.query.id;
        const requestedBy = req.query.requestedBy;
    
        const targetChannelIndex = activeChannels.findIndex( e => e.id === channelId);
    
        if (targetChannelIndex !== -1) {
            const channel = activeChannels[targetChannelIndex];
        
            if(!channel.joinedUsers.find( e => e.id === requestedBy.id)){
                channel.joinedUsers.push(requestedBy);
            }
    
            activeChannels[targetChannelIndex] = channel;
            res.json(channel);
        } else {
            res.status(404).json({ msg: "Chat Room does not exist!" });
        }
    });
    
//socket
    const server = http.createServer(app);
    const io = socketIo(server, {
        cors: {
            origin: "https://flywords-messenger.vercel.app",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        
        function deleteChannel(requestData) {
            const channelId = requestData.id;
            const requestedBy = requestData.requestedBy;

            socket.removeAllListeners("sendMessage" + channelId);
            io.emit('channelDisconnected' + channelId, {
                leftUserId: requestedBy.id,
                message: {
                    text: `${requestedBy.name} left the chat.`,
                    sentBy: {
                        id: generateUniqueName(),
                        name: 'server'
                    }
                }
            });

            const targetChannel = activeChannels.find( e => e.id === channelId);
            
            //delete on server
            if(targetChannel.joinedUsers.length <= 1){
                activeChannels = activeChannels.filter( e => e.id !== channelId );
            } else {
                const targetChannelIndex = activeChannels.findIndex( e => e.id === channelId);
                const channel = activeChannels[targetChannelIndex];

                //remove user
                channel.joinedUsers = channel.joinedUsers.filter( e => e.id !== requestedBy.id );
    
                activeChannels[targetChannelIndex] = channel;                
            }
        }

        socket.on("subscribe", (requestData) => {
            const channelId = requestData.id;
            const requestedBy = requestData.requestedBy;

            let deleteChannelTimer = setTimeout( () => deleteChannel(requestData), 3600000); // 3600000 1 hour

            io.emit('userJoined' + channelId, {
                joinedUser: requestedBy,
                message: {
                    text: `${requestedBy.name} joined the chat.`,
                    sentBy: {
                        id: generateUniqueName(),
                        name: 'server'
                    }
                }
            });

            socket.on("sendMessage" + channelId, (newMessage) => {
                clearTimeout(deleteChannelTimer);
                deleteChannelTimer = setTimeout( () => deleteChannel(requestData), 3600000);
                io.emit("receivedMessage" + channelId, newMessage);
            });
        });

        socket.on("unsubscribe", (requestData) => {
            deleteChannel(requestData);
        })
    });

// Host
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
