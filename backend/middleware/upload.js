const multer = require('multer');
const path = require('path');
const { UPLOADS_DIR, ensureDirectory } = require('../services/file.service');

/* ======================================================
   CREAR CARPETA UPLOADS SI NO EXISTE
====================================================== */

ensureDirectory(UPLOADS_DIR);

/* ======================================================
   STORAGE
====================================================== */

const storage =
multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },

  filename:
  (req, file, cb) => {

    const uniqueName =

      Date.now() +
      '-' +
      Math.round(
        Math.random() * 1E9
      ) +

      path.extname(
        file.originalname
      ).toLowerCase();

    cb(
      null,
      uniqueName
    );

  }

});

/* ======================================================
   FILE FILTER
====================================================== */

const allowedMimeTypes = [

  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'

];

const allowedExtensions = [

  '.jpg',
  '.jpeg',
  '.png',
  '.webp'

];

const fileFilter =
(req, file, cb) => {

  const extension =
  path.extname(
    file.originalname
  ).toLowerCase();

  const isMimeValid =
  allowedMimeTypes.includes(
    file.mimetype
  );

  const isExtensionValid =
  allowedExtensions.includes(
    extension
  );

  if (
    isMimeValid &&
    isExtensionValid
  ) {

    cb(
      null,
      true
    );

  } else {

    cb(
      new Error(
        'Solo se permiten imágenes JPG, PNG y WEBP'
      ),
      false
    );

  }

};

/* ======================================================
   MULTER
====================================================== */

const upload =
multer({

  storage,

  fileFilter,

  limits: {

    fileSize:
    5 * 1024 * 1024

  }

});

module.exports =
upload;