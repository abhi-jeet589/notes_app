require("dotenv").config();
const crypto = require("crypto");
const createError = require("http-errors");

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ALGORITHM = "aes-256-cbc";
const initializationVector = crypto.randomBytes(16);

module.exports = {
  encrypt_token: (token) => {
    try {
      const cipher = crypto.createCipheriv(
        ALGORITHM,
        PRIVATE_KEY,
        initializationVector
      );
      let encrypted_token = cipher.update(token, "utf-8", "hex");
      encrypted_token += cipher.final("hex");
      return encrypted_token;
    } catch (error) {
      throw createError.InternalServerError();
    }
  },
  decrypt_token: (encrypted_token) => {
    try {
      const decipher = crypto.createDecipheriv(
        ALGORITHM,
        PRIVATE_KEY,
        initializationVector
      );
      let decrypted_token = decipher.update(encrypted_token, "hex", "utf-8");
      decrypted_token += decipher.final("utf8");
      return decrypted_token;
    } catch (error) {
      throw createError.InternalServerError();
    }
  },
};
