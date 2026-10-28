import react from '@vitejs/plugin-react';
import path from 'path';
import Unfonts from 'unplugin-fonts/vite';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    Unfonts({
      custom: {
        families: [
          {
            name: 'Manrope',
            local: 'Manrope',
            src: './src/assets/fonts/Manrope-*.ttf',
          },
        ],
        display: 'auto',
        preload: true,
        prefetch: false,
      },
    }),
  ],
  server: {
    proxy: {
      '/upload-api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (requestPath) => requestPath.replace(/^\/upload-api/, ''),
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyResponse) => {
            const location = proxyResponse.headers.location;
            if (
              location === '/' ||
              location === 'http://localhost:8080/' ||
              location === 'http://127.0.0.1:8080/'
            ) {
              proxyResponse.headers.location = '/upload-api/';
            }
          });
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
