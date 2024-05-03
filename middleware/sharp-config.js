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
        // Supprimer le fichier original après la conversion
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error("Erreur lors de la suppression de l'image", err);
          } else {
            console.log("Ancienne image supprimée avec succes !");
          }
        });

        req.file.filename = newFileName;
        next();
      })
      .catch(err => {
        console.error("Erreur lors de la compression de l'image", err);
        next(err);
      });
  } else {
    next();
  }
};

module.exports = compressImg;
