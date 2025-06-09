import { defineConfig } from 'vitest/config';

export default defineConfig({
  logLevel: 'error',
  test: {
    clearMocks: true,
    include: ['src/**/*.test.ts'],
  },
});
