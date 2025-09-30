import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: [
      'react',
      'react-dom',
      'firebase/app', 
      'firebase/messaging', 
      'firebase/firestore'
    ]
  },
  build: {
    // Reduce memory usage during build
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      // output: {
      //   manualChunks: (id) => {
      //     // Keep React and React-DOM together to avoid forwardRef issues
      //     if (id.includes('react') || id.includes('react-dom')) {
      //       return 'react-vendor';
      //     }
      //     // Firebase packages
      //     if (id.includes('firebase')) {
      //       return 'firebase';
      //     }
      //     // Router (depends on React, so separate chunk)
      //     if (id.includes('react-router')) {
      //       return 'router';
      //     }
      //     // UI libraries that depend on React
      //     if (id.includes('framer-motion') || id.includes('lucide-react') || id.includes('react-icons')) {
      //       return 'ui';
      //     }
      //     // Utils (non-React dependencies)
      //     if (id.includes('axios') || id.includes('react-hot-toast')) {
      //       return 'utils';
      //     }
      //     // Other large node_modules
      //     if (id.includes('node_modules')) {
      //       return 'vendor-libs';
      //     }
      //   }
      // }
    },
    target: 'esnext',
    minify: 'esbuild'
  },
  define: {
    // Fix Firebase build issues
    global: 'globalThis',
  },
  resolve: {
    alias: {
      // Ensure proper Firebase module resolution
      'firebase/compat/app': 'firebase/compat/app',
      // Ensure consistent React imports
      'react': 'react',
      'react-dom': 'react-dom'
    }
  }
});
