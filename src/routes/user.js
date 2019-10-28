const express = require("express");
const bodyParser = require("body-parser");
const sessions = require("client-sessions");
const authentication = require("../middleware/authentication");
const User = require("../models/user");
const rooms = require("../utils/rooms");
const router = new express.Router();

// router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
router.use(
  sessions({
    cookieName: "session",
    secret: "sessionsSecret",
    duration: 24 * 60 * 60 * 1000,
    activeDuration: 1000 * 60 * 5
  })
);

router.get("/", async (req, res) => {
  const user = await User.findById(req.session.userId);
  // console.log(user);
  const { error } = { ...req.session };
  req.session.error = "";

  if (!user) {
    return res.render("index", {
      error
    });
  }
  res.redirect("/dashboard");
});

router.get("/dashboard", authentication, async (req, res) => {
  // console.log("req.user", req.user);
  try {
    // const user = await User.findById(req.session.userId);

    if (!req.user) {
      throw new Error("Please authenticate");
    }

    res.render("dashboard", {
      title: "Dashboard",
      username: req.user.username,
      email: req.user.email,
      rooms: rooms.getActiveRooms()
    });
  } catch (e) {
    req.session.error = e.toString();
    res.redirect("/");
  }
});

router.get("/chat", async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    console.log(req.query);
    console.log("user", user);

    if (!user && !req.query.username)
      throw new Error("You must provide a username");

    if (!user && req.query.username) {
      return res.render("chat");
    }

    const data = {
      username: user.username,
      room: "lobby"
    };

    res
      .cookie("user", encodeURIComponent(JSON.stringify(data)))
      .render("chat", {
        username: user.username
      });
  } catch (e) {
    req.session.error = e.toString();
    res.redirect("/");
  }
});

router.get("/signup", (req, res) => {
  res.render("signup");
});

router.post("/users", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.generateAuthToken();
    await user.save();

    res.status(201).render("signup-done", {
      title: "Chat-app - Sign up done",
      username: user.username
    });
  } catch (e) {
    res.status(400).render("bad-request", {
      error: function() {
        if (e.code === 11000) {
          return "Username is already in use, please try again.";
        }
        return `An error occurred, please try again.`;
      },
      redirectMessage: "Back to signup form",
      redirectUrl: "/signup"
    });
  }
});

router.get("/users/account", authentication, async (req, res) => {
  // TODO: session viestit tulee "jäljessä"
  // console.log("req.session", req.session);
  // console.log("req.user", req.user);
  const { message, error } = { ...req.session };
  req.session.error = "";
  req.session.message = "";
  console.log(message, error);

  try {
    res.render("account", {
      title: "Your account - Chat app",
      message,
      error,
      username: req.user.username,
      email: req.user.email
    });
  } catch (e) {
    req.session.error = e.toString();
    res.redirect("/");
  }
});

router.patch("/users/account", authentication, async (req, res) => {
  console.log("patch: ", req.body);

  const user = await User.findById(req.session.userId);

  try {
    const validPassword = await User.comparePasswords(
      user,
      req.body.oldPassword
    );
    console.log("valid: ", validPassword);
    if (!validPassword) throw new Error("Invalid password");
    user.password = req.body.password;

    await user.save();

    req.session.message = "Password changed successfully";
    res.status(200).send();
  } catch (e) {
    req.session.error = e.toString();
    res.status(400).send();
  }
});

router.get("/users/account/changepw", authentication, (req, res) => {
  res.render("changepw");
});

router.post("/users/login", async (req, res) => {
  console.log("req body: ", req.body);
  try {
    const user = await User.findByCredentials(
      req.body.username,
      req.body.password
    );

    // const token = await user.generateAuthToken();

    req.session.userId = user._id;

    res.status(200).redirect("/users/account");
  } catch (e) {
    res.status(400).render("bad-request", {
      title: "Something went wrong",
      error: e,
      redirectUrl: "/",
      redirectMessage: "Back to login"
    });
  }
});

router.get("/logout", async (req, res) => {
  if (!req.session.userId)
    return res.render("index", { error: "You have to log in first" });
  req.session.reset();
  res.clearCookie("user").redirect("/");
});

module.exports = router;
