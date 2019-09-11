// TODO: shouldn't be able to write html in chat
// TODO: DB with authentication
// TODO: DB save room converstations
// TODO: Forgot password
// TODO: Join multiple rooms
// TODO: Create room option in chat.html

require("./db/mongoose");

const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
  generateLink,
  checkForLink
} = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUserByName,
  getUsersInSameRoom
} = require("./utils/users");
const {
  getActiveRooms,
  removeUserFromList,
  addActiveRoom,
  removeRoomFromList
} = require("./utils/rooms");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirPath = path.join(__dirname, "../public");

app.use(express.static(publicDirPath));

io.on("connection", socket => {
  console.log("New websocket connection");

  socket.on("sendMessage", (msg, callback) => {
    const filter = new Filter();

    if (filter.isProfane(msg)) {
      return callback("Profanity is not allowed!");
    }

    const links = checkForLink(msg);
    if (links) msg = generateLink(msg, links);

    const user = getUser(socket.id);

    io.to(user.room).emit("message", generateMessage(user.username, msg));
    callback();
  });

  socket.on("sendPrivateMessage", (msg, recieverUsername, callback) => {
    const filter = new Filter();

    if (filter.isProfane(msg)) {
      return callback("Profanity is not allowed!");
    }

    const links = checkForLink(msg);
    if (links) msg = generateLink(msg, links);

    const reciever = getUserByName(recieverUsername);
    const user = getUser(socket.id);

    io.to(`${socket.id}`)
      .to(`${reciever.id}`)
      .emit("privateMessage", generateMessage(user.username, msg));
    callback();
  });

  socket.on("sendLocation", (coords, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(user.username, coords)
    );
    callback();
  });

  socket.on("isTyping", () => {
    const user = getUser(socket.id);
    io.to(user.room).emit("isTyping", user);
  });

  socket.on("join", (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit(
      "message",
      generateMessage("Admin", `You have joined ${user.room}`)
    );
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("Admin", `${user.username} has joined ${user.room}!`)
      );
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInSameRoom(user.room)
    });
    io.to(user.room).emit("usersList", getUsersInSameRoom(user.room));
    io.emit("activeRooms", getActiveRooms());

    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      removeUserFromList(user);

      io.to(user.room).emit(
        "message",
        generateMessage("Admin", `${user.username} has left!`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInSameRoom(user.room)
      });

      io.to(user.room).emit("usersList", getUsersInSameRoom(user.room));
      io.emit("activeRooms", getActiveRooms());
    }
  });
});

server.listen(port, () => {
  console.log(`Server up and running on port ${port}`);
});
