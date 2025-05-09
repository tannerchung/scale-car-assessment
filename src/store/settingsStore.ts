import { create } from 'zustand';
import { config, AIProvider } from '../config';

interface SettingsState {
  activeAiProvider: AIProvider;
  setActiveAiProvider: (provider: AIProvider) => void;
  visionApiDebug: boolean;
  setVisionApiDebug: (enabled: boolean) => void;
  anthropicApiDebug: boolean;
  setAnthropicApiDebug: (enabled: boolean) => void;
  apiErrors: {
    vision: {
      message: string;
      timestamp: number;
      details?: any;
    } | null;
    claude: {
      message: string;
      timestamp: number;
      details?: any;
    } | null;
  };
  setApiError: (provider: 'vision' | 'claude', error: { message: string; details?: any } | null) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  activeAiProvider: config.aiProviders.active as AIProvider,
  setActiveAiProvider: (provider) => {
    localStorage.setItem('activeAiProvider', provider);
    set({ activeAiProvider: provider });
  },
  visionApiDebug: config.vision.debugMode,
  setVisionApiDebug: (enabled) => {
    localStorage.setItem('visionApiDebug', enabled.toString());
    set({ visionApiDebug: enabled });
  },
  anthropicApiDebug: config.anthropic.debugMode,
  setAnthropicApiDebug: (enabled) => {
    localStorage.setItem('anthropicApiDebug', enabled.toString());
    set({ anthropicApiDebug: enabled });
  },
  apiErrors: {
    vision: null,
    claude: null
  },
  setApiError: (provider, error) => set((state) => ({
    apiErrors: {
      ...state.apiErrors,
      [provider]: error ? {
        ...error,
        timestamp: Date.now()
      } : null
    }
  }))
}));