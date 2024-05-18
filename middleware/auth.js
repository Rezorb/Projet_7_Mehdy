const jwt = require("jsonwebtoken");

// Authentication middleware to verify the JWT token.
module.exports = (req, res, next) => {
  try {
    // Retrieve the JWT token from the request headers.
    const token = req.headers.authorization.split(" ")[1];
    // Verify and decode the JWT token.
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    // Extract the user ID from the decoded token.
    const userId = decodedToken.userId;
    // Add the user ID to the request object for later use.
    req.auth = {
      userId: userId,
    };
    next();
  } catch (error) {
    res.status(401).json({ error });
  }
};
console.log(process.env)