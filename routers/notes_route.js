const express = require("express");
const router = express.Router();
const notes_controller = require("../controllers/notes_controller");

router.get("/", notes_controller.getAllNotes);

router.get("/:id", notes_controller.getNoteWithID);

router.post("/", notes_controller.createNote);

router.delete("/:id", notes_controller.deleteNote);

router.patch("/:id", notes_controller.updateNote);

module.exports = router;
