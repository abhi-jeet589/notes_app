const JWT = require("jsonwebtoken");
const createError = require("http-errors");
const { redisClient } = require("../Utilities/redis_connection");

exports.generateToken = (UserId, Expiry, Secret) => {
  return new Promise((resolve, reject) => {
    const payload = { UserId };
    const options = {
      expiresIn: Expiry,
      issuer: "notes_app",
    };
    new JWT.sign(payload, Secret, options, (err, token) => {
      if (err) {
        return reject(createError.InternalServerError("Failed to sign token"));
      }
      resolve(token);
    });
  });
};

exports.verifyAuthorizationToken = (req, res, next) => {
  if (!req.headers["authorization"]) return next(createError.Unauthorized());
  const bearerToken = req.headers["authorization"];
  const token = bearerToken.split(" ")[1];
  JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
    if (err) {
      const message =
        err.name === "JsonWebTokenError" ? "Unauthorized" : err.message;
      return next(createError.Unauthorized(message));
    }
    req.payload = payload;
    next();
  });
};

// exports.generateRefreshToken = (UserId) => {
//   return new Promise((resolve, reject) => {
//     const payload = { UserId };
//     const secret = process.env.REFRESH_TOKEN_SECRET;
//     const options = {
//       expiresIn: "1y",
//       issuer: "notes_app",
//     };
//     new JWT.sign(payload, secret, options, (err, token) => {
//       if (err) {
//         return reject(createError.InternalServerError("Failed to sign token"));
//       }
//       redisClient()
//         .setEx(UserId, 365 * 24 * 60 * 60, token)
//         .then(resolve(token))
//         .catch(reject(createError.InternalServerError(err.message)));
//     });
//   });
// };

exports.verifyToken = (token, secret, errMsg = "Unauthorized") => {
  return new Promise((resolve, reject) => {
    JWT.verify(token, secret, (err, payload) => {
      if (err) reject(createError.Unauthorized(errMsg));
      const userId = payload.UserId;
      resolve(userId);
    });
  });
};
