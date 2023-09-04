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
const { redisClient } = require("../Utilities/redis_connection");

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
    //Get the refresh token from the body and verify the token with JWT.
    const { refreshToken } = req.body;
    if (!refreshToken) throw createError.BadRequest();
    const userId = await verifyRefreshToken(refreshToken);

    //After verification with JWT, verify if the user's refresh token exists in Redis DB.
    const client = redisClient();
    const redisToken = await client.get(userId);

    if (!(redisToken === refreshToken)) {
      throw createError.Unauthorized();
    }

    //Post verification generate new access and refresh token.
    const accessToken = await generateAccessToken(userId);
    const refToken = await generateRefreshToken(userId);

    res.status(200).send({ accessToken, refreshToken: refToken });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    //Get the refresh token from the body and verify the token with JWT library.
    const { refreshToken } = req.body;
    if (!refreshToken) throw createError.BadRequest();
    const userId = await verifyRefreshToken(refreshToken);

    //Check if the token exists in the Redis DB. If it does the remove the key value pair. If it doesnt then the request is unauthorized.
    const client = redisClient();
    const redisToken = await client.get(userId);
    if (redisToken) {
      await client.del(userId);
    } else {
      throw createError.UnprocessableEntity();
    }

    //Reply with status everything went right.
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
