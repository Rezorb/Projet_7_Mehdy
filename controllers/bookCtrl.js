const Book = require("../models/Book");
const fs = require("fs");

// Creation of a new book.
exports.createBook = (req, res, next) => {
  // Creating a new Book instance with the book data and image.
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  // Registering the book in the database.
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    averageRating: bookObject.ratings[0].grade,
  });

  book
    .save()
    .then(() => {
      res.status(201).json({ message: "Saved item !" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// Modify an existing book.
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
  // Search for the book to modify.
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // Verification that the user is the owner of the book.
      if (book.userId != req.auth.userId) {
        res.status(403).json({ message: "Unauthorized request" });
      } else {
        // Retrieving the name of the old image.
        const oldFile = book.imageUrl.split('/images/')[1];
        fs.unlink(`images/${oldFile}`, () => {
          // Update book in database.
          Book.updateOne(
            { _id: req.params.id },
            { ...bookObject, _id: req.params.id }
          )
            .then(() => res.status(200).json({ message: "Modified item !" }))
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// Deleting a book.
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(403).json({ message: "Unauthorized request" });
      } else {
        // Deleting the image associated with the book.
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          // Deleting the book from the database.
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

// Retrieve a specific book.
exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

// Retrieve all books.
exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

// Add a note by a user.
exports.giveRating = (req, res, next) => {
  const user = req.body.userId;
  const rating = req.body.rating;
  const bookId = req.params.id;
  // Search for the book to note.
  Book.findOne({ _id: bookId })
    .then((book) => {
      // Check if the user has already added a note.
      if (!book.ratings.some((rating) => rating.userId === user)) {
        // Ajout de la nouvelle note
        book.ratings.push({ userId: user, grade: rating });
        // Calculate the average.
        book.averageRating = parseFloat(
          (
            book.ratings.reduce((sum, rating) => sum + rating.grade, 0) /
            book.ratings.length
          ).toFixed(1)
        );
        // Updating the book with the new note.
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
