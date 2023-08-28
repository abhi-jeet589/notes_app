const Account = require("../models/account");
const { Types } = require("mongoose");
const createError = require("http-errors");
const {
  registrationSchema,
  authSchema,
} = require("../Utilities/validation_schema");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../Utilities/webToken_generator");

exports.register = async (req, res, next) => {
  try {
    const validatedBody = await registrationSchema.validateAsync(req.body);
    const accountExists = await Account.findOne({ email: validatedBody.email });
    if (accountExists) {
      throw createError.Conflict(`${validatedBody.email} already exists`);
    }

    const newAccount = new Account(validatedBody);
    const savedAccount = await newAccount.save();

    const Accesstoken = await generateAccessToken(savedAccount.id);
    const RefreshToken = await generateRefreshToken(savedAccount.id);

    res.status(201).send({ Accesstoken, RefreshToken });
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

    const Accesstoken = await generateAccessToken(user.id);
    const RefreshToken = await generateRefreshToken(user.id);

    res.status(200).send({ Accesstoken, RefreshToken });
  } catch (error) {
    if (error.isJoi === true) {
      next(createError.BadRequest("Invalid username or password"));
    }
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw createError.BadRequest();
    const userId = await verifyRefreshToken(refreshToken);

    const accessToken = await generateAccessToken(userId);
    const refToken = await generateRefreshToken(userId);

    res.status(200).send({ accessToken, refreshToken: refToken });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
};
