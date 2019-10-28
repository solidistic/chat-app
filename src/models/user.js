const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true
    },
    password: {
      type: String,
      trim: true,
      required: true,
      minlength: 8
    },
    email: {
      type: String,
      trim: true,
      required: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email");
        }
      }
    },
    rooms: {
      type: Map,
      of: String
    },
    tokens: [
      {
        token: { type: String, required: true }
      }
    ]
  },
  { timestamps: true }
);

userSchema.statics.findByCredentials = async (username, password) => {
  const user = await User.findOne({ username });

  if (!user) {
    throw new Error("User not found");
  }

  const correctPassword = await bcrypt.compare(password, user.password);

  if (!correctPassword) {
    throw new Error("Unable to login");
  }

  return user;
};

userSchema.statics.comparePasswords = async function(user, password) {
  // console.log(password);
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return false;
  return true;
};

userSchema.methods.generateAuthToken = async function() {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

userSchema.pre("save", async function(next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
