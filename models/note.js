const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const noteSchema = new Schema(
  {
    account_id: {
      type: String,
      required: true,
    },
    note_title: {
      type: String,
      required: true,
    },
    note_content: {
      type: String,
    },
    tags: {
      type: Schema.Types.Array,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("note", noteSchema);
