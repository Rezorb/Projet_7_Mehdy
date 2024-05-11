const Book = require("../models/Book");
const fs = require("fs");

exports.createBook = (req, res, next) => {
  // Stockage de la requête sous forme de JSON dans une constante (requête sous la forme form-data à l'origine)
  const bookObject = JSON.parse(req.body.book);
  // Suppression du faux _id envoyé par le front
  delete bookObject._id;
  // Suppression de _userId auquel on ne peut faire confiance
  delete bookObject._userId;
  // Création d'une instance du modèle Book
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    averageRating: bookObject.ratings[0].grade,
  });
  // Enregistrement dans la base de données
  book
    .save()
    .then(() => {
      res.status(201).json({ message: "Saved item !" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  delete bookObject._userId;
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(403).json({ message: "Unauthorized request" });
      } else {
        Book.updateOne(
          { _id: req.params.id },
          { ...bookObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Modified item !" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(403).json({ message: "Unauthorized request" });
      } else {
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Item deleted !" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

// Notation des livres par les utilisateurs //

exports.giveRating = (req, res, next) => {
  const user = req.body.userId;
  const rating = req.body.rating;
  const bookId = req.params.id;

  Book.findOne({ _id: bookId })
    .then((book) => {
      // Vérifier si l'user a déjà ajouté une note.
      if (!book.ratings.some((rating) => rating.userId === user)) {
        // Ajout de la nouvelle note
        book.ratings.push({ userId: user, grade: rating });
        // Calculer la moyenne.
        book.averageRating = parseFloat(
          (
            book.ratings.reduce((sum, rating) => sum + rating.grade, 0) /
            book.ratings.length
          ).toFixed(1)
        );
        // Mise à jour de la note moyenne du livre.
        Book.findOneAndUpdate(
          { _id: bookId },
          {
            $push: { ratings: { userId: user, grade: rating } },
            $set: { averageRating: book.averageRating },
          },
          { new: true }
        )
          .then((updatedBook) => res.status(200).json(updatedBook))
          .catch((error) => res.status(400).json({ error }));
      } else
        res.status(401).json({ message: "This book has already been rated !" });
    })
    .catch((error) => res.status(400).json({ error }));
};
