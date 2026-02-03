import { defineProject } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineProject({
  plugins: [tsconfigPaths()],
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
