import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: [
      'firebase/app', 
      'firebase/messaging', 
      'firebase/firestore'
    ]
  },
  build: {
    // Reduce memory usage during build
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Firebase packages
          if (id.includes('firebase')) {
            return 'firebase';
          }
          // React packages
          if (id.includes('react') || id.includes('react-dom')) {
            return 'vendor';
          }
          // Router
          if (id.includes('react-router')) {
            return 'router';
          }
          // UI libraries
          if (id.includes('framer-motion') || id.includes('lucide-react') || id.includes('react-icons')) {
            return 'ui';
          }
          // Utils
          if (id.includes('axios') || id.includes('react-hot-toast')) {
            return 'utils';
          }
          // Large node_modules
          if (id.includes('node_modules')) {
            return 'vendor-libs';
          }
        }
      }
    },
    target: 'esnext',
    minify: 'terser'
  },
  define: {
    // Fix Firebase build issues
    global: 'globalThis',
  },
  resolve: {
    alias: {
      // Ensure proper Firebase module resolution
      'firebase/compat/app': 'firebase/compat/app',
    }
  }
});
