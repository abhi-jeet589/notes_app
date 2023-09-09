const crypto = require("crypto");

const secretAccessKey = crypto.randomBytes(32).toString("hex");
const secretRefreshTokenKey = crypto.randomBytes(32).toString("hex");
const privateKey = crypto
  .createHash("sha256")
  .update(crypto.randomBytes(32).toString())
  .digest("hex")
  .substring(0, 32);

console.table({ secretAccessKey, secretRefreshTokenKey, privateKey });
