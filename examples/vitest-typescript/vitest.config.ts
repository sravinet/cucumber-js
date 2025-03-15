import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['**/*.{test,cucumber,feature}.{js,ts}'],
    environment: 'node'
  }
}) 