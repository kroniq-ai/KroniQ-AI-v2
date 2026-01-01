import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['pptxgenjs']
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
  build: {
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },                                                                                                                                                    
    // Code splitting configuration
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // UI libraries
          'vendor-ui': ['lucide-react'],
          // Supabase
          'vendor-supabase': ['@supabase/supabase-js'],
          // Firebase
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 500,
    // Enable source maps for debugging (optional)
    sourcemap: false,
    // CSS code splitting
    cssCodeSplit: true,
    // Asset optimization
    assetsInlineLimit: 4096,
  },
  // Enable CSS minification
  css: {
    devSourcemap: true,
  },
});
