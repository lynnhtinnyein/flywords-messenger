const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const generateUniqueName = require("./src/helper/generateUniqueName");

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
                msg: "Server is currently loaded! Please try again later.",
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
    
        const channelIndex = activeChannels.findIndex( e => e.id === channelId);
    
        if (channelIndex !== -1) {
            const channel = activeChannels[channelIndex];
            channel.joinedUsers.push(requestedBy);
    
            activeChannels[channelIndex] = channel;
            res.json(channel);
        } else {
            res.status(404).json({ msg: "Chat Room does not exist!" });
        }
    });
    
//socket
    const server = http.createServer(app);
    const io = socketIo(server, {
        cors: {
            origin: "http://localhost:3000",
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
            
            //delete channel if no one is active
            if(targetChannel.joinedUsers.length <= 1){
                activeChannels = activeChannels.filter( e => e.id !== channelId );
            } else {
                const channelIndex = activeChannels.findIndex( e => e.id === channelId);
                const channel = activeChannels[channelIndex];

                //remove user
                channel.joinedUsers = channel.joinedUsers.filter( e => e.id !== requestedBy.id );
    
                activeChannels[channelIndex] = channel;                
            }
        }

        socket.on("subscribe", (requestData) => {
            const channelId = requestData.id;
            const requestedBy = requestData.requestedBy;

            let deleteChannelTimer = setTimeout( () => deleteChannel(requestData), 3600000); // 1 hour

            io.emit("userJoined" + channelId, requestedBy );

            socket.on("sendMessage" + channelId, (newMessage) => {
                clearTimeout(deleteChannelTimer);
                deleteChannelTimer = setTimeout( () => deleteChannel(requestData), 3600000);
                io.emit("receivedMessage" + channelId, newMessage);
            });
        });

        socket.on("unsubscribe", (channel) => {
            deleteChannel(channel)
        })
    });

// Host
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
