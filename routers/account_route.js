require("dotenv").config({ path: "../.env" });
const express = require("express");
const router = express.Router();
const getDb = require("../Utilities/db_connection").getDb;

router.get("/", (request, response, next) => {
  const db = getDb();
  let { page } = request.query;
  let { limit } = request.query || 50;
  let offset = (page - 1) * limit;

  db.collection(process.env.DB_COLLECTION_NAME)
    .find()
    .skip(offset)
    .limit(Number(limit))
    .toArray()
    .then((user) => {
      response.status(200).json({
        next: request.url + "?page" + String(page++),
        records: user.length,
        user: user,
      });
    })
    .catch((err) => console.log(err));
});

module.exports = router;
