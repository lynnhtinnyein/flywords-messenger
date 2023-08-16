const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const generateUniqueName = require("./helper/generateUniqueName");

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
            const newChannelName = generateUniqueName();
            const user = req.body.user;
            const newChannel = {
                name: newChannelName,
                createdBy: user,
            };
            activeChannels.push(newChannel);
            res.json(newChannelName);
        }
    });

    //join
    app.get("/", (req, res) => {
        const channel = activeChannels.find( e => e.name === req.query.channelName);
        res.json({ channel });
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
        
        let currentUser = null;

        function deleteChannel(channel) {
            socket.removeAllListeners("sendMessage" + channel.name)

            //fix
            //io.emit("channelDeleted" + channel.name);


            const isOwner = activeChannels.find( e => e.name === channel.name ).createdBy === channel.user;
            if(isOwner){
                activeChannels = activeChannels.filter( e => e.name !== channel.name );
            }
        }

        socket.on("subscribe", (channel) => {

            currentUser = channel.user;
            let deleteChannelTimer = setTimeout( () => deleteChannel(channel), 3600000);

            io.emit("userJoined" + channel.name, channel.user );

            socket.on("sendMessage" + channel.name, (message) => {

                clearTimeout(deleteChannelTimer);
                deleteChannelTimer = setTimeout( () => deleteChannel(channel), 3600000);

                io.emit("receivedMessage" + channel.name, message);
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
