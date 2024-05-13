const multer = require("multer");

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

// Configuration for multer storage.
const storage = multer.diskStorage({
  // Save the files in the images folder.
  destination: (req, file, callback) => {
    callback(null, "images");
  },

  // Naming the images.
  filename: (req, file, callback) => {
    const name = file.originalname.replace(/[\s.]+/g, "_");
    // Get the file extension based on MIME type.
    const extension = MIME_TYPES[file.mimetype];
    // Create a unique filename.
    callback(null, name + Date.now() + "." + extension);
  },
});

module.exports = multer({ storage }).single("image");
