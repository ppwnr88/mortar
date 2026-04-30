export const frontendEnv = {
  apiBaseUrl: import.meta.env.VITE_API_URL?.trim() || '/api',
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || '',
}