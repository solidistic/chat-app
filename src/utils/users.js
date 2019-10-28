const { addUserToRoom, removeUserFromList } = require("./rooms");

const users = [];

const addUser = ({ id, username, room }) => {
  // Validate the data
  if (!username || !room) {
    return {
      error: "Username and room are required"
    };
  }

  // Clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // Check for existing user
  const existingUser = users.find(user => {
    return user.room === room && user.username === username;
  });

  // Validate username
  if (existingUser) {
    return {
      error: "Username is already in use"
    };
  }

  // Store user
  const user = { id, username, room };
  users.push(user);
  addUserToRoom(user);
  return { user };
};

const removeUser = id => {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = id => {
  return (user = users.find(user => user.id === id));
};

const getUserByName = username => {
  return (user = users.find(user => user.username === username));
};

const getUsersInSameRoom = room => {
  room = room.trim().toLowerCase();
  return (usersInRoom = users.filter(user => user.room === room));
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInSameRoom,
  getUserByName
};
