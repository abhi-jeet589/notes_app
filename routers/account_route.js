const express = require("express");
const router = express.Router();
const account_controller = require("../controllers/accounts_controller");

router.post("/register", account_controller.register);

router.post("/login", account_controller.login);

router.post("/refreshToken", account_controller.refreshToken);

router.delete("/logout", account_controller.logout);

router.post("/forgot-password", account_controller.forgotPassword);

router.post("/reset-password", account_controller.resetPassword);

module.exports = router;
