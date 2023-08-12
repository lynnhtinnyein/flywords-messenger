const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const generateUniqueName = require("./helper/generateUniqueName");

const app = express();
app.use(cors());
app.use(express.json());

const channelLimit = 30;
const activeChannels = [];

//api
app.get("/", (req, res) => {
    const channel = activeChannels.find( e => e.name === req.query.channelName);
    const user = req.query.currentUser || "user_" + generateUniqueName();
    res.json({
        joinedBy: user,
        channel: channel
    });
});

app.post("/", (req, res) => {
    if (activeChannels.length >= channelLimit) {
        res.status(503).json({
            msg: "Server is currently loaded! Please try again later.",
        });
    } else {
        const newChannelName = generateUniqueName();
        const newUser = req.body.currentUser || "user_" + generateUniqueName();
        const newChannel = {
            name: newChannelName,
            createdBy: newUser,
        };
        activeChannels.push(newChannel);
        res.json(newChannelName);
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

function hostChannels(socket) {

    activeChannels.forEach((channel) => {
        socket.on("send_to_" + channel.name, (message) => {
            console.log("sent");
            io.emit(channel.name + "_has_new_msg", message);
        });
    });

}

io.on("connection", (socket) => {

    socket.on("reHostChannels", () => {
        hostChannels(socket);
    });

});

// Host
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
