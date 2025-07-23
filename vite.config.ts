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
      'async_hooks': path.resolve(__dirname, 'src/services/async-hooks-mock.ts'),
      'langsmith': path.resolve(__dirname, 'src/services/langsmith-mock')
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
