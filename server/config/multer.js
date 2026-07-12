const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Ensure upload directories exist
const resumeDir = path.join(__dirname, '../uploads/resumes')
const videoDir = path.join(__dirname, '../uploads/videos')
;[resumeDir, videoDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
})

// ── Resume upload (PDF only, small size limit) ────────────
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, resumeDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`
    cb(null, uniqueSuffix)
  },
})

const resumeFileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true)
  } else {
    cb(new Error('Only PDF files are allowed for resumes'), false)
  }
}

const uploadResume = multer({
  storage: resumeStorage,
  fileFilter: resumeFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
})

// ── Video upload (mp4/webm, larger size limit) ─────────────
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, videoDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`
    cb(null, uniqueSuffix)
  },
})

const videoFileFilter = (req, file, cb) => {
  const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime']
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only MP4, WebM, or MOV video files are allowed'), false)
  }
}

const uploadVideo = multer({
  storage: videoStorage,
  fileFilter: videoFileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
})

module.exports = { uploadResume, uploadVideo }