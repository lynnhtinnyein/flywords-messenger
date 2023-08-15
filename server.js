const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const generateUniqueName = require("./helper/generateUniqueName");

const app = express();
app.use(cors());
app.use(express.json());

const channelLimit = 50;
const activeChannels = [];

//api routes
//create
app.post("/", (req, res) => {
    if (activeChannels.length >= channelLimit) {
        res.status(503).json({
            msg: "Server is currently loaded! Please try again later.",
        });
    } else {
        const newChannelName = generateUniqueName();
        const newUser = req.body.currentUser;
        const newChannel = {
            name: newChannelName,
            createdBy: newUser,
        };
        activeChannels.push(newChannel);
        res.json(newChannelName);
    }
});

//join
app.get("/", (req, res) => {
    const channel = activeChannels.find( e => e.name === req.query.channelName);
    const user = req.query.currentUser;
    res.json({
        joinedBy: user,
        channel: channel
    });
});

app.delete("/", (req, res) => {
    const channelName = req.body.channelName;
    activeChannels = activeChannels.filter( e => e.name !== channelName);
})

//socket
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    
    socket.on("subscribe", (channelName) => {
        socket.on("sendMessage" + channelName, (message) => {
            io.emit("receivedMessage" + channelName, message);
        });
    });

});

// Host
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
