const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const compressImg = (req, res, next) => {
  if (req.file) {
    const filePath = req.file.path;
    const newFileName = req.file.filename.replace(/\.[^.]+$/, ".webp");
    const newFile = path.join("images", newFileName);

    sharp(filePath)
      .resize({ width: 254, height: 364 })
      .webp({ quality: 80 })
      .toFile(newFile)
      .then(() => {
        fs.unlink(filePath, () => {
          req.file.path = newFile; // Updates the file path.
          req.file.filename = newFileName; // Also updates the file name.
          next();
        });
      })
      .catch((error) => res.status(401).json({ error }));
  } else {
    next();
  }
};

module.exports = compressImg;
