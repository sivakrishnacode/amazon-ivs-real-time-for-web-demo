import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    https: false,
    proxy: {
      '/api': {
        target: 'https://k0ljndvw90.execute-api.us-east-1.amazonaws.com/prod',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('X-API-Key', 'M738diLr2xJapjWfioKn');
            proxyReq.setHeader('Origin', 'https://k0ljndvw90.execute-api.us-east-1.amazonaws.com');
            proxyReq.setHeader('Referer', 'https://k0ljndvw90.execute-api.us-east-1.amazonaws.com/');
          });
        }
      },
    },
  },
});
