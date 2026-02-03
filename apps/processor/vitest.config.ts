import { defineProject } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineProject({
  plugins: [tsconfigPaths()],
  test: {
    name: 'processor',
    globals: true,
    environment: 'node',
    include: ['src/__tests__/**/*.test.ts'],
  },
});
