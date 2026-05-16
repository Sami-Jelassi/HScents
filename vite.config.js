import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          // React Compiler (if you want to use it - optional)
          ['babel-plugin-react-compiler', {}]
        ]
      }
    })
  ],
  server: {
    port: 5050,
    proxy: {
      '/api': {
        target: 'http://54.37.159.225:7000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})