import api from './api'

// Uploads a video (either a file selected by the user, or a Blob recorded via webcam)
// along with the question it's answering. Returns immediately with status: 'processing'.
export const uploadVideoInterview = (videoFile, question, source, onUploadProgress) => {
  const formData = new FormData()
  formData.append('video', videoFile, videoFile.name || 'recorded-answer.webm')
  formData.append('question', question)
  formData.append('source', source) // 'upload' or 'recorded'

  return api.post('/video-interview/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
    timeout: 300000, // 5 minutes video uploads take longer than our default timeout
  })
}

// Used for polling — call this every few seconds until status is 'completed' or 'failed'
export const getVideoInterviewById = (id) => api.get(`/video-interview/${id}`)

// Returns { videoInterviews: [...] } — past video interview submissions
export const getVideoInterviewHistory = () => api.get('/video-interview/history')

// Deletes a video interview submission from history
export const deleteVideoInterview = (id) => api.delete(`/video-interview/${id}`)