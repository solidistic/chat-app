const users = require("./users");

let rooms = [];

const getActiveRooms = () => {
  // const emptyRoomIndex = rooms.findIndex(index => {
  //   if(index.connectedUsers.length === 0) return index;
  // });
  // console.log("empty rooms..", emptyRoomIndex);
  // console.log(rooms);

  // rooms = rooms.splice(emptyRoomIndex, 1);

  return rooms;
};

const addUserToRoom = user => {
  if (!rooms.find(index => index.room === user.room)) {
    rooms.push({
      room: user.room,
      connectedUsers: [user]
    });
  } else {
    const index = rooms.findIndex(index => index.room === user.room);
    rooms[index].connectedUsers.push(user);
  }
};

const listUsersInRoom = roomName => {
  const index = rooms.findIndex(room => room === roomName);
  return rooms[index].connectedUsers;
};

const removeUserFromList = user => {
  if (user) {
    const roomIndex = rooms.findIndex(index => index.room === user.room);
    const userIndex = rooms[roomIndex].connectedUsers.findIndex(
      index => index.id === user.id
    );

    return rooms[roomIndex].connectedUsers.splice(userIndex, 1);
  }
  return new Error("User not found");
};

const removeRoomFromList = roomName => {
  const index = rooms.findIndex(room => room === roomName);
  rooms.splice(index, 1);
};

module.exports = {
  getActiveRooms,
  addUserToRoom,
  removeUserFromList,
  removeRoomFromList
};
