// tests/vitest.frontend.config.js
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    name: 'Frontend',
    environment: 'jsdom',
    setupFiles: ['./tests/frontend/setup.js'],
    include: ['tests/frontend/**/*.test.{js,jsx,ts,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './tests/coverage/frontend'
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../frontend/src')
    }
  }
})