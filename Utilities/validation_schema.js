const Joi = require("joi");

const authSchema = Joi.object({
  email: Joi.string().email().required().lowercase(),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
    .required(),
  username: Joi.string().alphanum().required().min(3).max(30),
});

const noteSchema = Joi.object({
  account_id: Joi.string().required(),
  note_title: Joi.string().required(),
  note_content: Joi.string(),
  tags: Joi.array(),
});

module.exports = { authSchema, noteSchema };
