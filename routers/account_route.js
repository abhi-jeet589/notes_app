require("dotenv").config({ path: "../.env" });
const express = require("express");
const router = express.Router();
const getDb = require("../Utilities/db_connection").getDb;

// let _db = getDb();

// router.get("/", (request, response, next) => {
//     const db = getDb();
//     db.collection(process.env.DB_COLLECTION_NAME)
//       .find()
//       .toArray()
//       .then((user) => response.status(200).json({user: user}))
//       .catch((err) => console.log(err));
//     // console.log(db)
//     // let collection = await connectToDb(process.env.DB_NAME,process.env.DB_COLLECTION_NAME);
//     // let collection = _db.collection(process.env.DB_COLLECTION_NAME);
//     // results =  await collection.find({}).limit(50).toArray();
// });

router.get("/", (request, response, next) => {
      const db = getDb();
      db.collection(process.env.DB_COLLECTION_NAME)
        .find()
        .toArray()
        .then((user) => response.status(200).json({user: user}))
        .catch((err) => console.log(err));
      // console.log(db)
      // let collection = await connectToDb(process.env.DB_NAME,process.env.DB_COLLECTION_NAME);
      // let collection = _db.collection(process.env.DB_COLLECTION_NAME);
      // results =  await collection.find({}).limit(50).toArray();
  });

module.exports = router;
