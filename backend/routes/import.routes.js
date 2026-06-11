const express = require('express');
const multer = require('multer');

const router = express.Router();

const {
  importExcel
} = require('../controllers/import.controller');

const storage = multer.diskStorage({

  destination:
  'uploads/imports',

  filename:
  (req, file, cb) => {

    cb(
      null,
      Date.now() +
      '-' +
      file.originalname
    );

  }

});

const upload =
multer({ storage });

router.post(
  '/',
  upload.single('excel'),
  importExcel
);

module.exports =
router;