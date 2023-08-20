//Importing modules
require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const accountRouter = require("./routers/account_route.js");
const authRouter = require("./routers/user.js");
const notesRouter = require("./routers/notes_route.js");
const morgan = require("morgan");
const createError = require("http-errors");

const mongoConnect = require("./Utilities/db_connection.js").mongoConnect;

//Setting configuration constants
const PORT = process.env.PORT || 8080;

//Configuring server
app.use(bodyParser.json());
app.use(express.json());

//Handling CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

//Logging request to console
app.use(morgan("dev"));

//Using middleware for routes
app.use("/auth", authRouter);
app.use("/account", accountRouter);
app.use("/notes", notesRouter);

//To handle all the invalid URL requests
app.use(async (req, res, next) => {
  next(createError.NotFound());
});

app.use(async (err, req, res, next) => {
  res.status(err.status || 500).send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
});

// Start server
mongoConnect((client) => {
  app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
});
