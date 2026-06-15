const express = require('express');
const multer = require('multer');

const router = express.Router();

const {
  IMPORTS_DIR,
  ensureDirectory
} = require('../services/file.service');
const {
  importExcel
} = require('../controllers/import.controller');

ensureDirectory(IMPORTS_DIR);

const storage = multer.diskStorage({

  destination: IMPORTS_DIR,

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