const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authmiddleware')
const { uploadVideo } = require('../config/multer')
const {
  uploadVideoInterview,
  getVideoInterviewById,
  getVideoInterviewHistory,
  deleteVideoInterview,
} = require('../controllers/videoController')

router.use(protect)

router.get('/history', getVideoInterviewHistory)
router.post('/upload', uploadVideo.single('video'), uploadVideoInterview)
router.get('/:id', getVideoInterviewById)
router.delete('/:id', deleteVideoInterview)

module.exports = router