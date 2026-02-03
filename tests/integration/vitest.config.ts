import { defineProject } from 'vitest/config';

export default defineProject({
  test: {
    name: 'integration',
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts'],
    testTimeout: 30000,
  },
});
