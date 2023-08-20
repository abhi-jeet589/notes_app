const Note = require("../models/note.js");
const { Types } = require("mongoose");
const createError = require("http-errors");

exports.getAllNotes = (req, res, next) => {
  Note.find()
    .then((notes) => {
      const notesCount = notes.length;
      return res.status(200).json({
        recordCount: notesCount,
        notes,
      });
    })
    .catch((err) => next(err));
};

exports.getNoteWithID = (req, res, next) => {
  const note_id = new Types.ObjectId(req.params.id);
  Note.findById(note_id)
    .then((note) => {
      return res.status(200).json({ note });
    })
    .catch((err) => next(err));
};

exports.createNote = (req, res, next) => {
  //Getting account id from the request header after authentication
  const account_id = req.headers.account_id;

  //Creating a new notes document to insert into collection
  const { note_title } = req.body;
  const note_content = req.body.note_content || "";
  const tags = req.body.tags || [];
  const note_document = new Note({
    note_title,
    tags,
    note_content,
    account_id,
  });
  note_document
    .save()
    .then((response) => {
      res.status(201).send({
        message: "Note created successfully",
        response,
      });
    })
    .catch((err) => next(err));
};

exports.deleteNote = (req, res, next) => {
  const note_id = new Types.ObjectId(req.params.id);
  Note.findByIdAndRemove(note_id)
    .then((response) => {
      return res.status(200).json({ response });
    })
    .catch((err) => {
      next(err);
    });
};

exports.updateNote = (req, res, next) => {
  const note_id = new Types.ObjectId(req.params.id);
  const allowedFields = ["note_title", "note_content", "tags"];
  Object.keys(req.body).forEach((key) => {
    if (!allowedFields.includes(key))
      throw createError.BadRequest(
        `Acceptable fields to update are ${allowedFields}`
      );
  });
  Note.findByIdAndUpdate(note_id, req.body)
    .then((note) => {
      res.status(200).json({
        message: "Note updated successfully",
      });
    })
    .catch((err) => {
      throw createError.NotImplemented();
    });
};
