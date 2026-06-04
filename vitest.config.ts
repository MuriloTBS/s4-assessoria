import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: { provider: 'v8', reporter: ['text', 'lcov'], include: ['src/**'] },
  },
  resolve: {
    alias: { '@': resolve(__dirname, './src') },
  },
})
