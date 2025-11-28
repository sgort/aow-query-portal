import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Relative paths for flexible deployment
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined, // Single bundle for simplicity
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
