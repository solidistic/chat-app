const Filter = require("bad-words");
const socketio = require("socket.io");

const {
  generateMessage,
  generateLocationMessage,
  generateLink,
  checkForLink
} = require("../utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUserByName,
  getUsersInSameRoom
} = require("../utils/users");
const {
  getActiveRooms,
  removeUserFromList,
  addActiveRoom,
  removeRoomFromList
} = require("../utils/rooms");

/* Socket.io listeners */

module.exports.listen = server => {
  io = socketio.listen(server);

  io.of("/dashboard").on("connection", socket => {
    console.log("Dashboard connection");
    io.of("/dashboard").emit("activeRooms", getActiveRooms());

    socket.on("fromDashboard", data => {
      console.log(data);
      io.emit("dashboard", "s");
    });
  });

  io.of("/chat").on("connection", socket => {
    console.log("Chat connection");
    console.log(socket.id);

    socket.on("sendMessage", (msg, callback) => {
      const filter = new Filter();

      if (filter.isProfane(msg)) {
        return callback("Profanity is not allowed!");
      }

      const links = checkForLink(msg);
      if (links) msg = generateLink(msg, links);

      const user = getUser(socket.id);

      io.of("/chat")
        .to(user.room)
        .emit("message", generateMessage(user.username, msg));
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

      io.of("/chat")
        .to(`${socket.id}`)
        .to(`${reciever.id}`)
        .emit("privateMessage", generateMessage(user.username, msg));
      callback();
    });

    socket.on("sendLocation", (coords, callback) => {
      const user = getUser(socket.id);

      io.of("/chat")
        .to(user.room)
        .emit(
          "locationMessage",
          generateLocationMessage(user.username, coords)
        );
      callback();
    });

    socket.on("isTyping", () => {
      const user = getUser(socket.id);
      io.of("/chat")
        .to(user.room)
        .emit("isTyping", user);
    });

    socket.on("join", (options, callback) => {
      const { error, user } = addUser({ id: socket.id, ...options });

      if (error) {
        return callback(error);
      }

      console.log(user);

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
      io.of("/chat")
        .to(user.room)
        .emit("roomData", {
          room: user.room,
          users: getUsersInSameRoom(user.room)
        });
      io.of("/chat")
        .to(user.room)
        .emit("usersList", getUsersInSameRoom(user.room));
      io.of("/chat").emit("activeRooms", getActiveRooms());

      callback();
    });

    socket.on("disconnect", () => {
      const user = removeUser(socket.id);

      if (user) {
        removeUserFromList(user);

        io.of("/chat")
          .to(user.room)
          .emit(
            "message",
            generateMessage("Admin", `${user.username} has left!`)
          );
        io.of("/chat")
          .to(user.room)
          .emit("roomData", {
            room: user.room,
            users: getUsersInSameRoom(user.room)
          });

        io.of("/chat")
          .to(user.room)
          .emit("usersList", getUsersInSameRoom(user.room));
        io.of("/chat").emit("activeRooms", getActiveRooms());
      }
    });
  });

  return io;
};
