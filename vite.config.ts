import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'langsmith': '/src/services/langsmith-browser-mock.ts',
      'langsmith/traceable': '/src/services/langsmith-browser-mock.ts'
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
