const crypto = require("crypto");

const secretAccessKey = crypto.randomBytes(32).toString("hex");
const secretRefreshTokenKey = crypto.randomBytes(32).toString("hex");

console.table({ secretAccessKey, secretRefreshTokenKey });
