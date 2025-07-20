export const config = {
  vision: {
    useRealApi: true,
    apiKey: import.meta.env.VITE_GOOGLE_CLOUD_API_KEY,
    apiUrl: 'https://vision.googleapis.com/v1/images:annotate',
    mockDelay: 2000,
    debugMode: localStorage.getItem('visionApiDebug') === 'true',
    serviceAccountPath: '/home/project/secrets/service-account.json'
  },
  anthropic: {
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
    useRealApi: true,
    mockDelay: 2000,
    debugMode: localStorage.getItem('anthropicApiDebug') === 'true'
  },
  ui: {
    maxImageSize: 5 * 1024 * 1024,
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  aiProviders: {
    active: localStorage.getItem('activeAiProvider') || 'both',
    available: ['vision', 'claude', 'both'] as const
  }
};

export type AIProvider = typeof config.aiProviders.available[number];