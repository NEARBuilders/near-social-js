import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 120000,
    hookTimeout: 180000,
    include: ['test/**/*.test.ts'],
    // fileParallelism: false,
  },
});
