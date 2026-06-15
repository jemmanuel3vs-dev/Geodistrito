const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '../uploads');
const IMPORTS_DIR = path.join(UPLOADS_DIR, 'imports');

function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function safeUnlink(filePath) {
  if (!filePath) {
    return;
  }

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.warn('No se pudo eliminar el archivo de forma segura:', filePath, error);
  }
}

function getFilenameFromUrl(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }

  const segments = url.split('/').filter(Boolean);
  return segments.length ? segments[segments.length - 1] : null;
}

function createImageUrl(filename) {
  if (!filename) {
    return null;
  }

  const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
  return `${baseUrl}/uploads/${filename}`;
}

module.exports = {
  UPLOADS_DIR,
  IMPORTS_DIR,
  ensureDirectory,
  safeUnlink,
  getFilenameFromUrl,
  createImageUrl
};
