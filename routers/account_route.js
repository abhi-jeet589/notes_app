const express = require("express");
const router = express.Router();
const account_controller = require("../controllers/accounts_controller");

router.post("/register", account_controller.register);

router.post("/login", account_controller.login);

module.exports = router;
