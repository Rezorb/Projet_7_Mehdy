const express = require("express");
const mongoose = require("mongoose");

const booksRoutes = require("./routes/booksRoute");
const usersRoutes = require("./routes/usersRoute");
const path = require("path");

// Connect to MongoDB using Mongoose.
mongoose
  .connect(
    "mongodb+srv://MdySrv:LRMlMqrQ7cfw5x4a@mon-vieux-grimoire.mjvxrap.mongodb.net/?retryWrites=true&w=majority&appName=Mon-vieux-grimoire",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Successful connection to MongoDB !"))
  .catch(() => console.log("MongoDB connection failed !"));

const app = express();

// Middleware to intercept JSON requests.
app.use(express.json());

// General middleware to handle CORS errors.
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

// Routes.
app.use("/api/books", booksRoutes);
app.use("/api/auth", usersRoutes);

// Images statiques.
app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;
