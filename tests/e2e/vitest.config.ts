import { defineProject } from 'vitest/config';

export default defineProject({
  test: {
    name: 'e2e',
    globals: true,
    environment: 'node',
    include: ['flows/**/*.test.ts'],
    globalSetup: ['./setup/global-setup.ts'],
    testTimeout: 60000,
    hookTimeout: 60000,
  },
});
