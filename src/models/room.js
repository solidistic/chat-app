const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  admin: {
    type: String
  },
  messages: [
    {
      message: { type: String, required: true },
      reciever: { type: String, required: true }
    }
  ]
});

roomSchema.virtual("roomAdmin", {
  ref: "User",
  localfield: "admin",
  foreignField: "adminRights"
});

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
