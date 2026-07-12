const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authmiddleware')
const { uploadResume } = require('../config/multer')
const {
  uploadAndAnalyzeResume,
  getResumeHistory,
  getResumeById,
  deleteResume,
} = require('../controllers/resumeController')

router.use(protect)

router.post('/upload', uploadResume.single('resume'), uploadAndAnalyzeResume)
router.get('/history', getResumeHistory)
router.get('/:id', getResumeById)
router.delete('/:id', deleteResume)

module.exports = router