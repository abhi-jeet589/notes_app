const Account = require("../models/account");
const { Types } = require("mongoose");
const createError = require("http-errors");
const { authSchema } = require("../Utilities/validation_schema");
const { generateAccessToken } = require("../Utilities/webToken_generator");

exports.register = async (req, res, next) => {
  try {
    const validatedBody = await authSchema.validateAsync(req.body);
    const accountExists = await Account.findOne({ email: validatedBody.email });
    if (accountExists) {
      throw createError.Conflict(`${validatedBody.email} already exists`);
    }
    const newAccount = new Account(validatedBody);
    const savedAccount = await newAccount.save();
    const token = await generateAccessToken(savedAccount.id);
    res.status(201).send({ BearerToken: token });
  } catch (err) {
    if (err.isJoi === true) {
      err.status = 422;
    }
    next(err);
  }
};

exports.login = (req, res, next) => {};
