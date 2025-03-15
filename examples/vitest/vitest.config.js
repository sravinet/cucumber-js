import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['**/*.{cucumber,feature}.{js,ts}'],
    environment: 'node'
  }
}) 