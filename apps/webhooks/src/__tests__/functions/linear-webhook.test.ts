import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createHmac } from 'crypto';
import {
  createMockHttpRequest,
  createMockInvocationContext,
} from '../mocks/azure-functions.js';
import type { LinearWebhookEvent } from '@linear-teams/shared';
import { LINEAR_SIGNATURE_HEADER, HTTP_STATUS } from '@linear-teams/shared';

// Mock the QueueClient before importing the handler
vi.mock('@linear-teams/queue', () => ({
  QueueClient: vi.fn().mockImplementation(() => ({
    send: vi.fn().mockResolvedValue({ success: true, data: 'message-123' }),
    close: vi.fn().mockResolvedValue(undefined),
  })),
}));

const TEST_SECRET = 'test-webhook-secret';
const TEST_CONNECTION_STRING =
  'Endpoint=sb://test.servicebus.windows.net/;SharedAccessKeyName=test;SharedAccessKey=test';

function createSignature(body: string): string {
  return createHmac('sha256', TEST_SECRET).update(body).digest('hex');
}

function createValidWebhookPayload(): LinearWebhookEvent {
  return {
    action: 'create',
    type: 'Issue',
    createdAt: '2024-01-15T10:30:00.000Z',
    organizationId: 'org-123',
    webhookId: 'webhook-123',
    webhookTimestamp: Date.now(),
    data: {
      id: 'issue-123',
      identifier: 'TEST-1',
      title: 'Test Issue',
      priority: 2,
      state: { id: 'state-1', name: 'Todo', type: 'unstarted' },
      team: { id: 'team-1', key: 'TEST', name: 'Test Team' },
      labels: [],
      createdAt: '2024-01-15T10:30:00.000Z',
      updatedAt: '2024-01-15T10:30:00.000Z',
    },
  };
}

describe('linearWebhookHandler', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = {
      ...originalEnv,
      LINEAR_WEBHOOK_SECRET: TEST_SECRET,
      SERVICE_BUS_CONNECTION_STRING: TEST_CONNECTION_STRING,
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  it('should return 401 when signature header is missing', async () => {
    const { linearWebhookHandler } = await import(
      '../../functions/linear-webhook.js'
    );

    const body = JSON.stringify(createValidWebhookPayload());
    const request = createMockHttpRequest({ body });
    const context = createMockInvocationContext();

    const response = await linearWebhookHandler(request, context);

    expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
    expect(response.body).toBe('Missing signature');
  });

  it('should return 401 for invalid signature', async () => {
    const { linearWebhookHandler } = await import(
      '../../functions/linear-webhook.js'
    );

    const body = JSON.stringify(createValidWebhookPayload());
    const request = createMockHttpRequest({
      body,
      headers: { [LINEAR_SIGNATURE_HEADER]: 'invalid-signature' },
    });
    const context = createMockInvocationContext();

    const response = await linearWebhookHandler(request, context);

    expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
    expect(response.body).toBe('Invalid webhook signature');
  });

  it('should return 500 when webhook secret is not configured', async () => {
    delete process.env['LINEAR_WEBHOOK_SECRET'];

    const { linearWebhookHandler } = await import(
      '../../functions/linear-webhook.js'
    );

    const body = JSON.stringify(createValidWebhookPayload());
    const signature = createSignature(body);
    const request = createMockHttpRequest({
      body,
      headers: { [LINEAR_SIGNATURE_HEADER]: signature },
    });
    const context = createMockInvocationContext();

    const response = await linearWebhookHandler(request, context);

    expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(response.body).toBe('Server configuration error');
  });

  it('should return 200 for valid webhook', async () => {
    const { linearWebhookHandler } = await import(
      '../../functions/linear-webhook.js'
    );

    const body = JSON.stringify(createValidWebhookPayload());
    const signature = createSignature(body);
    const request = createMockHttpRequest({
      body,
      headers: { [LINEAR_SIGNATURE_HEADER]: signature },
    });
    const context = createMockInvocationContext();

    const response = await linearWebhookHandler(request, context);

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(response.body).toBe('OK');
  });

  it('should log received event details', async () => {
    const { linearWebhookHandler } = await import(
      '../../functions/linear-webhook.js'
    );

    const payload = createValidWebhookPayload();
    const body = JSON.stringify(payload);
    const signature = createSignature(body);
    const request = createMockHttpRequest({
      body,
      headers: { [LINEAR_SIGNATURE_HEADER]: signature },
    });
    const context = createMockInvocationContext();

    await linearWebhookHandler(request, context);

    expect(context.log).toHaveBeenCalledWith(expect.stringContaining('create'));
    expect(context.log).toHaveBeenCalledWith(expect.stringContaining('Issue'));
  });

  it('should return 500 when service bus connection is not configured', async () => {
    delete process.env['SERVICE_BUS_CONNECTION_STRING'];

    const { linearWebhookHandler } = await import(
      '../../functions/linear-webhook.js'
    );

    const body = JSON.stringify(createValidWebhookPayload());
    const signature = createSignature(body);
    const request = createMockHttpRequest({
      body,
      headers: { [LINEAR_SIGNATURE_HEADER]: signature },
    });
    const context = createMockInvocationContext();

    const response = await linearWebhookHandler(request, context);

    expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(response.body).toBe('Failed to process webhook');
  });

  it('should return 401 for invalid payload structure', async () => {
    const { linearWebhookHandler } = await import(
      '../../functions/linear-webhook.js'
    );

    const invalidPayload = { foo: 'bar' };
    const body = JSON.stringify(invalidPayload);
    const signature = createSignature(body);
    const request = createMockHttpRequest({
      body,
      headers: { [LINEAR_SIGNATURE_HEADER]: signature },
    });
    const context = createMockInvocationContext();

    const response = await linearWebhookHandler(request, context);

    expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
    expect(response.body).toBe('Invalid webhook payload structure');
  });
});
