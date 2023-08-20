const mongoose = require("mongoose");

const connection_string = process.env.DB_CONNECTION_URI || "";
const db_name = process.env.DB_NAME || "";

let _db;

const mongoConnect = (callback) => {
  mongoose
    .connect(connection_string, { dbName: db_name })
    .then((client) => {
      _db = client.connection.db;
      callback();
    })
    .catch((err) => console.error(err.message));
};

mongoose.connection.on("connected", () => {
  console.log("Mongodb connection established");
});

mongoose.connection.on("error", (err) => console.error(err.message));

mongoose.connection.on("disconnected", () =>
  console.log("Mongodb connection disconnected")
);

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.exit(0);
});

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw "No database found!";
};

exports.getDb = getDb;
exports.mongoConnect = mongoConnect;
