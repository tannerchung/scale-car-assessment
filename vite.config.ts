import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      'langsmith': path.resolve(__dirname, 'src/services/langsmith-mock')
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
