import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'langsmith-resolver',
      resolveId(id) {
        if (id === 'langsmith') {
          return path.resolve(__dirname, 'src/services/langsmith-mock/index.ts');
        }
        if (id === 'langsmith/run_trees') {
          return path.resolve(__dirname, 'src/services/langsmith-mock/run_trees.ts');
        }
        if (id === 'langsmith/traceable') {
          return path.resolve(__dirname, 'src/services/langsmith-mock/traceable.ts');
        }
        if (id === 'langsmith/singletons/traceable') {
          return path.resolve(__dirname, 'src/services/langsmith-mock/singletons/traceable.ts');
        }
        return null;
      }
    }
  ],
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
