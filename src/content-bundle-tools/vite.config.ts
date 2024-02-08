/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import eslint from 'vite-plugin-eslint'

// https://vitejs.dev/config/

const srcPath = path.resolve(__dirname, './src')
const declarationsDirPath = path.resolve(__dirname, '../declarations')

export default defineConfig({
  plugins: [
    react(),
    eslint({
      include: srcPath,
    }),
  ],
  resolve: {
    alias: {
      '~': srcPath,
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
  define: {
    'process.env': process.env,
    // By default, Vite doesn't include shims for NodeJS/
    // necessary for segment analytics lib to work
    global: 'globalThis',
  },
  build: {
    rollupOptions: {
      external: [
        path.join(declarationsDirPath, 'package_registry', 'index.js'),
        path.join(declarationsDirPath, 'package_service', 'index.js'),
      ],
    },
  },
})
