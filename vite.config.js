import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: false, // Keep origin header for share URL generation
        configure: (proxy, options) => {
          // Ensure referer header is passed through
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Preserve original host in a custom header for share URL generation
            const protocol = req.headers['x-forwarded-proto'] || 'http';
            const host = req.headers.host || 'localhost:5173';
            proxyReq.setHeader('X-Forwarded-Host', host);
            proxyReq.setHeader('X-Forwarded-Proto', protocol);
          });
        },
      },
    },
  },
})
