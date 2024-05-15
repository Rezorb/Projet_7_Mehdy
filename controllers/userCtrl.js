const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

// Manage user registration.
exports.signup = (req, res, next) => {
  // Hash user password with bcrypt.
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      // Create a new user with hashed email and password.
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      // User registration in the database.
      user
        .save()
        .then(() => res.status(201).json({ message: "User created !" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

// User login management
exports.login = (req, res, next) => {
  // Search for user in email database
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ message: "User not found !" });
      }
      // Comparison of the password sent with the password hashed in the database
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res
              .status(401)
              .json({ message: "Wrong password !" });
          }
          // If the password is correct, generate a JWT token.
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id },
              "RANDOM_TOKEN_SECRET", // Secret token key.
              { expiresIn: "24h" } // Token expiration.
            ),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
