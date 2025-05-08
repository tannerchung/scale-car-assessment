export const config = {
  vision: {
    useRealApi: true,
    apiKey: import.meta.env.VITE_GOOGLE_CLOUD_API_KEY,
    apiUrl: 'https://vision.googleapis.com/v1/images:annotate',
    mockDelay: 2000,
    debugMode: localStorage.getItem('visionApiDebug') === 'true',
    serviceAccountPath: '/home/project/secrets/service-account.json'
  },
  ui: {
    maxImageSize: 5 * 1024 * 1024,
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  }
};