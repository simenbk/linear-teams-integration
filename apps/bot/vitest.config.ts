import { defineProject } from 'vitest/config';

export default defineProject({
  test: {
    name: 'bot',
    globals: true,
    environment: 'node',
    include: ['src/__tests__/**/*.test.ts'],
  },
});
