const express = require("express");
const mongoose = require("mongoose");

// Routes PATH  //
const booksRoutes = require("./routes/booksRoute");
const usersRoutes = require("./routes/usersRoute");


mongoose.connect(
    "mongodb+srv://MdySrv:LRMlMqrQ7cfw5x4a@mon-vieux-grimoire.mjvxrap.mongodb.net/?retryWrites=true&w=majority&appName=Mon-vieux-grimoire",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

const app = express();

// Middleware permettant d'intercepter les requêtes JSON //
app.use(express.json());

// Middleware général permettant de gérer les erreurs CORS //
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

// Routes //
app.use("/api/books", booksRoutes);
app.use("/api/auth", usersRoutes);

module.exports = app;
