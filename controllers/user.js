const User = require("../models/account");

exports.signup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;

  const user = new User({ email, password, name });
  user
    .save()
    .then((response) => {
      res
        .status(201)
        .json({ message: "User saved successfully", response: response });
    })
    .catch((err) => {
      console.log(err);
    });
};
