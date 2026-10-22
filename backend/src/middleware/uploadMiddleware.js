import multer from "multer";
import path from "path";
import fs from "fs";

// Base upload path
const baseUploadDir = path.resolve(
  process.cwd(),
  process.env.UPLOAD_DIR || "uploads",
  "documents"
);

// Ensure base directory exists
if (!fs.existsSync(baseUploadDir)) {
  fs.mkdirSync(baseUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine application number / ID for folder isolation
    const appFolder = req.applicationNumber || req.params.id || "general";
    const targetDir = path.join(baseUploadDir, appFolder);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const sanitizedOriginal = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, `${timestamp}_${sanitizedOriginal}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png"];
  const allowedMimes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
  ];

  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(ext) || !allowedMimes.includes(file.mimetype)) {
    return cb(
      new Error(
        `Invalid file type. Only PDF, JPG, JPEG, and PNG files are allowed. Received: ${ext}`
      ),
      false
    );
  }

  cb(null, true);
};

export const uploadDocument = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter,
});
