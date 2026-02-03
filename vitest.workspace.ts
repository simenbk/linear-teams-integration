import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  // Packages
  'packages/shared/vitest.config.ts',
  'packages/linear-client/vitest.config.ts',
  'packages/queue/vitest.config.ts',
  'packages/teams-client/vitest.config.ts',
  'packages/db/vitest.config.ts',
  // Apps
  'apps/bot/vitest.config.ts',
  'apps/webhooks/vitest.config.ts',
  'apps/processor/vitest.config.ts',
  // Integration and E2E
  'tests/integration/vitest.config.ts',
  'tests/e2e/vitest.config.ts',
]);
