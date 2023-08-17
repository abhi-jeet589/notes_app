//Importing modules
require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const accountRouter = require("./routers/account_route.js");
const authRouter = require("./routers/user.js");
const notesRouter = require("./routers/notes_route.js");

const mongoConnect = require("./Utilities/db_connection.js").mongoConnect;

//Setting configuration constants
const PORT = process.env.PORT || 8080;

//Configuring server
app.use(bodyParser.json());
// app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

//Using middleware for routes
app.use((req, res, next) => {
  console.log(req.protocol + " " + req.method + " " + req.url);
  next();
});

app.use("/auth", authRouter);
app.use("/account", accountRouter);
app.use("/notes", notesRouter);

// Start server
mongoConnect((client) => {
  // console.log(client);
  app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
});
