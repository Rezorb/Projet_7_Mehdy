const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const sharp = require('../middleware/sharp-config');
const compressImg = require('../middleware/sharp-config');

const bookCtrl = require('../controllers/bookCtrl');

console.log('sharp.compressImg:', sharp.compressImg);
console.log('multer:', multer);
console.log('auth:', auth);
console.log('bookCtrl.createBook:', bookCtrl.createBook);


router.get("/", bookCtrl.getAllBooks);
router.get("/:id", bookCtrl.getOneBook);
router.post("/", auth, multer, compressImg, bookCtrl.createBook);
router.post('/:id/rating', auth, bookCtrl.giveRating);
router.put("/:id", auth, multer, compressImg, bookCtrl.modifyBook);
router.delete("/:id", auth, bookCtrl.deleteBook);

module.exports = router;