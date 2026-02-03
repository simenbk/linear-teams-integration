import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/__tests__/**',
        '**/mocks/**',
        '**/*.config.ts',
        '**/*.config.mts',
        '**/index.ts',
        '**/.eslintrc.cjs',
        '**/types/**',
        '**/repositories/**',
        '**/setup/**',
        // Exclude files not yet under test
        '**/apps/processor/**',
        '**/apps/bot/src/functions/**',
        '**/packages/db/**',
        '**/packages/linear-client/src/client.ts',
        '**/packages/queue/src/client.ts',
        '**/packages/shared/src/constants.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
});
