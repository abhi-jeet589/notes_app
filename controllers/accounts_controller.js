const Account = require("../models/account");
const { Types } = require("mongoose");
const createError = require("http-errors");
const {
  registrationSchema,
  authSchema,
} = require("../Utilities/validation_schema");
const {
  generateToken,
  verifyRefreshToken,
} = require("../Utilities/webToken_generator");
const { redisClient } = require("../Utilities/redis_connection");
const { encrypt_token, decrypt_token } = require("../Utilities/token_hasher");

exports.register = async (req, res, next) => {
  try {
    const validatedBody = await registrationSchema.validateAsync(req.body);
    const accountExists = await Account.findOne({ email: validatedBody.email });
    if (accountExists) {
      throw createError.Conflict(`${validatedBody.email} already exists`);
    }

    const newAccount = new Account(validatedBody);
    const savedAccount = await newAccount.save();

    const Accesstoken = await generateToken(
      savedAccount.id,
      "1h",
      process.env.ACCESS_TOKEN_SECRET
    );
    const RefreshToken = await generateToken(
      savedAccount.id,
      "1y",
      process.env.REFRESH_TOKEN_SECRET
    );
    redisClient()
      .setEx(savedAccount.id, 365 * 24 * 60 * 60, RefreshToken)
      .then(res.status(201).send({ Accesstoken, RefreshToken }))
      .catch((err) => {
        throw createError.InternalServerError(err.message);
      });
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

    const Accesstoken = await generateToken(
      user.id,
      "1h",
      process.env.ACCESS_TOKEN_SECRET
    );
    const RefreshToken = await generateToken(
      user.id,
      "1y",
      process.env.REFRESH_TOKEN_SECRET
    );
    redisClient()
      .setEx(user.id, 365 * 24 * 60 * 60, RefreshToken)
      .then(res.status(200).send({ Accesstoken, RefreshToken }))
      .catch((err) => {
        throw createError.InternalServerError(err.message);
      });
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
    const accessToken = await generateToken(
      userId,
      "1h",
      process.env.ACCESS_TOKEN_SECRET
    );
    const refToken = await generateToken(
      userId,
      "1y",
      process.env.REFRESH_TOKEN_SECRET
    );
    redisClient()
      .setEx(userId, 365 * 24 * 60 * 60, refToken)
      .then(res.status(200).send({ accessToken, refreshToken: refToken }))
      .catch((err) => {
        throw createError.InternalServerError(err.message);
      });
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

exports.forgotPassword = async (req, res, next) => {
  try {
    //User provides us (in request body) with the email to reset the password for.
    if (!req.body.email && !req.body.Email) throw createError.BadRequest();
    const userEmail = req.body.email || req.body.Email;

    //We validate if the email is true and if the email exists in our database.
    const emailFormat = /[^\.]+[\w\.]+@[a-zA-Z]+\.+[a-zA-Z]{3}$/;
    if (!userEmail.match(emailFormat))
      throw createError.BadRequest("Invalid email address");
    const dbUser = await Account.findOne({ email: userEmail });
    if (!dbUser) throw createError.NotFound("Invalid User");

    //If the email exists then we will fetch the userID from the email and create a token that will last for 15 mins for the user to change the password
    const encrypted_userid = encrypt_token(dbUser.id);
    const passwordResetToken = await generateToken(
      encrypted_userid,
      "15m",
      process.env.PRIVATE_KEY
    );

    await dbUser.updateOne({
      $set: {
        "Reset Password": { Token: passwordResetToken, isUsed: false },
      },
    });

    //Create and send the link to user email.
    const passwordResetLink =
      req.hostname +
      req.baseUrl +
      `/resetPassword?uid=${encrypted_userid}&token=${passwordResetToken}`;
    res.send({ message: "Password reset link sent.", passwordResetLink });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
};
