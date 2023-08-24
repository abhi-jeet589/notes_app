const Account = require("../models/account");
const { Types } = require("mongoose");
const createError = require("http-errors");
const {
  registrationSchema,
  authSchema,
} = require("../Utilities/validation_schema");
const { generateAccessToken } = require("../Utilities/webToken_generator");
const { response } = require("express");

exports.register = async (req, res, next) => {
  try {
    const validatedBody = await registrationSchema.validateAsync(req.body);
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

exports.login = async (req, res, next) => {
  try {
    const validatedBody = await authSchema.validateAsync(req.body);
    const user = await Account.findOne({ email: validatedBody.email });

    if (!user) throw createError.NotFound("User not registered");
    const isValidPassword = await user.isValidPassword(validatedBody.password);
    if (!isValidPassword)
      throw createError.Unauthorized("Username or password is invalid");
    const token = await generateAccessToken(user.id);
    res.status(200).send({ BearerToken: token });
  } catch (error) {
    if (error.isJoi === true) {
      next(createError.BadRequest("Invalid username or password"));
    }
    next(error);
  }
};
