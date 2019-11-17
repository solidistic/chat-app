// mongodb://127.0.0.1:27017/task-manager-api

const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .catch(e => {
    console.log("Unable to connect to database: " + e);
  });

const db = mongoose.connection;

db.once("open", () => {
  console.log("Connected to database!");
});

db.once("error", error => {
  console.log(error);
});
