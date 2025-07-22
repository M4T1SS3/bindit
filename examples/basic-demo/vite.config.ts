import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@bindit/core': '../../packages/core/src',
      '@bindit/react': '../../packages/react/src',
    }
  }
})
