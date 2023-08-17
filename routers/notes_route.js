const express = require("express");
const { MongoServerError, ObjectId } = require("mongodb");
const router = express.Router();
const getDb = require("../Utilities/db_connection").getDb;

function getTimeStamp() {
  const date = new Date();
  return date;
}

router.get("/", (req, res, next) => {
  const db = getDb();
  db.collection("notes_collection")
    .find()
    .toArray()
    .then((notes) => {
      const notesCount = notes.length;
      return res.status(200).json({
        recordCount: notesCount,
        notes,
      });
    })
    .catch((err) => {
      if (err instanceof MongoServerError) {
        return res
          .status(500)
          .json({ reason: "Mongo Server error", error: err.message });
      } else {
        return res
          .status(500)
          .json({ reason: "Internal Server error", error: err.message });
      }
    });
});

router.get("/:notes_id", (req, res, next) => {
  const db = getDb();
  const note_id = new ObjectId(req.params.notes_id);
  db.collection("notes_collection")
    .find({ _id: note_id })
    .toArray()
    .then((note) => {
      return res.status(200).json({ note });
    })
    .catch((err) => {
      if (err instanceof MongoServerError) {
        return res
          .status(500)
          .json({ reason: "Mongo Server error", error: err.message });
      } else {
        return res
          .status(500)
          .json({ reason: "Internal Server error", error: err.message });
      }
    });
});

router.post("/", (req, res, next) => {
  const db = getDb();
  //Getting account id from the request header after authentication
  const account_id = req.headers.account_id;
  //Creating a new notes document to insert into collection
  const note_document = [
    {
      account_id,
      note_title: req.body.note_title,
      note_content: req.body.note_content,
      tags: req.body.tags,
      created_at: getTimeStamp(),
      modified_at: getTimeStamp(),
    },
  ];
  //inserting document into collection
  db.collection("notes_collection")
    .insertMany(note_document)
    .then((result) => {
      return res.status(201).json(result);
    })
    .catch((err) => {
      if (err instanceof MongoServerError) {
        return res
          .status(500)
          .json({ reason: "Mongo Server error", error: err.message });
      } else {
        return res
          .status(500)
          .json({ reason: "Internal Server error", error: err.message });
      }
    });
});

router.delete("/:notes_id", (req, res, next) => {
  const db = getDb();
  const note_id = new ObjectId(req.params.notes_id);
  db.collection("notes_collection")
    .deleteMany({ _id: note_id })
    .then((results) => {
      return res.status(200).json({ results });
    })
    .catch((err) => {
      if (err instanceof MongoServerError) {
        return res
          .status(500)
          .json({ reason: "Mongo Server error", error: err.message });
      } else {
        return res
          .status(500)
          .json({ reason: "Internal Server error", error: err.message });
      }
    });
});

router.patch("/:notes_id", (req, res, next) => {});

module.exports = router;
