import api from './api'

// Uploads a resume PDF for AI analysis.
// `onUploadProgress` is optional — pass a function to track upload % for a progress bar.
export const uploadResume = (file, onUploadProgress) => {
  const formData = new FormData()
  formData.append('resume', file)

  return api.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  })
}

// Returns { resumes: [...] } — past resume reviews, most recent first
export const getResumeHistory = () => api.get('/resume/history')

// Returns { resume: {...} } — full detail for one resume review
export const getResumeById = (resumeId) => api.get(`/resume/${resumeId}`)

// Deletes a resume review from history
export const deleteResume = (resumeId) => api.delete(`/resume/${resumeId}`)