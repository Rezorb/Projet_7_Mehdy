const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const compressImg = (req, res, next) => {
  if (req.file) {
    const filePath = req.file.path;
    const newFileName = req.file.filename.replace(/\.[^.]+$/, ".webp");
    const newFile = path.join("images", newFileName);

    console.log(`Starting image compression for file: ${filePath}`);

    sharp(filePath)
      .resize({ width: 254, height: 364 })
      .webp({ quality: 80 })
      .toFile(newFile)
      .then(() => {
        console.log(`Image successfully compressed to: ${newFile}`);
        // Delete the original file after conversion.
        console.log(`Attempting to delete the original file: ${filePath}`);
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error("Error deleting image", err);
          } else {
            console.log("Old image successfully deleted!");
          }
        });
        req.file.filename = newFileName; // Update the filename in the request object.
        req.file.path = newFile; // Also updates the file path.
        next();
      })
      .catch((err) => {
        console.error("Error during image compression", err);
        next(err);
      });
  } else {
    next();
  }
};

module.exports = compressImg;
