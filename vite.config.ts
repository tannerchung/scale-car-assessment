import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Log environment variables for debugging (only in development)
  if (mode === 'development') {
    console.log('🔧 Vite Environment Variables:');
    Object.keys(env)
      .filter(key => key.startsWith('VITE_'))
      .forEach(key => {
        console.log(`  ${key}: ${env[key] ? '✅ Loaded (' + env[key].length + ' chars)' : '❌ Empty'}`);
      });
  }

  return {
    plugins: [
      react(),
    ],
    resolve: {
      alias: {
        'async_hooks': path.resolve(__dirname, 'src/services/async-hooks-mock.ts'),
        'node:async_hooks': path.resolve(__dirname, 'src/services/async-hooks-mock.ts'),
        'langsmith': path.resolve(__dirname, 'src/services/langsmith-mock')
      },
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    // Explicitly define env variables to be exposed
    define: {
      __VITE_SUPABASE_URL__: JSON.stringify(env.VITE_SUPABASE_URL),
      __VITE_SUPABASE_ANON_KEY__: JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
    },
  };
});
