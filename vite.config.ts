import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'langsmith': '/src/services/langsmith-mock/index.ts',
      'langsmith/run_trees': '/src/services/langsmith-mock/run_trees.ts',
      'langsmith/traceable': '/src/services/langsmith-mock/traceable.ts',
      'langsmith/singletons/traceable': '/src/services/langsmith-mock/singletons/traceable.ts'
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
