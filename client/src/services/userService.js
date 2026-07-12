import api from './api'

// Updates the logged-in user's profile (currently just name).
// Returns { user: {...} } with the updated user object.
export const updateProfile = ({ name }) =>
  api.put('/auth/profile', { name })

// Changes the logged-in user's password.
// Backend should verify currentPassword before setting newPassword.
export const changePassword = ({ currentPassword, newPassword }) =>
  api.put('/auth/change-password', { currentPassword, newPassword })