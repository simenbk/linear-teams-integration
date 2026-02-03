import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function setup() {
  console.log('Starting E2E test environment...');

  // Check if docker compose file exists and start containers
  try {
    await execAsync('docker compose -f docker-compose.test.yml up -d', {
      cwd: process.cwd(),
    });
    console.log('Docker containers started');

    // Wait for services to be healthy
    await waitForServices();
    console.log('All services are ready');
  } catch (error) {
    console.warn('Docker containers not available, skipping container setup');
    console.warn('E2E tests may fail if required services are not running');
  }
}

export async function teardown() {
  console.log('Stopping E2E test environment...');

  try {
    await execAsync('docker compose -f docker-compose.test.yml down', {
      cwd: process.cwd(),
    });
    console.log('Docker containers stopped');
  } catch {
    // Containers may not have been started
  }
}

async function waitForServices(maxRetries = 30, delayMs = 1000): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      // Check if postgres is ready
      await execAsync(
        'docker compose -f docker-compose.test.yml exec -T postgres pg_isready'
      );
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw new Error('Services failed to become healthy');
}
