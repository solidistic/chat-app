// TODO: shouldn't be able to write html in chat
// TODO: DB save room converstations
// TODO: Forgot password
// TODO: Join multiple rooms

require("./db/mongoose");

const hbs = require("hbs");
const path = require("path");
const http = require("http");
const express = require("express");
const requirejs = require("requirejs");
const userRouter = require("./routes/user");

const app = express();
const server = http.createServer(app);
require("./socketio/sockets").listen(server);

const port = process.env.PORT || 3000;
const publicDirPath = path.join(__dirname, "../public");
const viewsPath = path.join(__dirname, "../templates/views");
const partialsPath = path.join(__dirname, "../templates/partials");

app.set("view engine", "hbs");
app.set("views", viewsPath);
hbs.registerPartials(partialsPath);
hbs.localsAsTemplateData(app);

app.use(express.static(publicDirPath));
app.use(express.json());
app.use(userRouter);

requirejs.config({
  nodeRequire: require
});

server.listen(port, () => {
  console.log(`Server up and running on port ${port}`);
});
