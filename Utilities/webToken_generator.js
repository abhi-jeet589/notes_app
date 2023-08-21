const JWT = require("jsonwebtoken");
const createError = require("http-errors");

exports.generateAccessToken = (UserId) => {
  return new Promise((resolve, reject) => {
    const payload = {};
    const secret = process.env.ACCESS_TOKEN_SECRET;
    const options = {
      expiresIn: "1h",
      audience: UserId,
      issuer: "notes_app",
    };
    new JWT.sign(payload, secret, options, (err, token) => {
      if (err) {
        return reject(createError.InternalServerError("Failed to sign token"));
      }
      resolve(token);
    });
  });
};
