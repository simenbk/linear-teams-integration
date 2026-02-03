import { describe, it, expect } from 'vitest';
import { createHmac } from 'crypto';
import { verifyWebhookSignature, parseWebhookPayload } from '../webhook.js';
import type { LinearWebhookEvent } from '@linear-teams/shared';

const TEST_SECRET = 'test-webhook-secret';

function createSignature(body: string, secret: string = TEST_SECRET): string {
  return createHmac('sha256', secret).update(body).digest('hex');
}

function createValidPayload(): LinearWebhookEvent {
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
      state: { id: 'state-1', name: 'In Progress', type: 'started' },
      team: { id: 'team-1', key: 'TEST', name: 'Test Team' },
      labels: [],
      createdAt: '2024-01-15T10:30:00.000Z',
      updatedAt: '2024-01-15T10:30:00.000Z',
    },
  };
}

describe('verifyWebhookSignature', () => {
  it('should return true for valid signature', () => {
    const body = JSON.stringify(createValidPayload());
    const signature = createSignature(body);

    const result = verifyWebhookSignature(body, signature, TEST_SECRET);
    expect(result).toBe(true);
  });

  it('should return false for invalid signature', () => {
    const body = JSON.stringify(createValidPayload());

    const result = verifyWebhookSignature(body, 'invalid-signature', TEST_SECRET);
    expect(result).toBe(false);
  });

  it('should return false for wrong secret', () => {
    const body = JSON.stringify(createValidPayload());
    const signature = createSignature(body);

    const result = verifyWebhookSignature(body, signature, 'wrong-secret');
    expect(result).toBe(false);
  });

  it('should return false for tampered body', () => {
    const body = JSON.stringify(createValidPayload());
    const signature = createSignature(body);
    const tamperedBody = body.replace('Test Issue', 'Tampered Issue');

    const result = verifyWebhookSignature(tamperedBody, signature, TEST_SECRET);
    expect(result).toBe(false);
  });

  it('should handle Buffer input', () => {
    const body = JSON.stringify(createValidPayload());
    const signature = createSignature(body);

    const result = verifyWebhookSignature(Buffer.from(body), signature, TEST_SECRET);
    expect(result).toBe(true);
  });

  it('should return false for signatures of different lengths', () => {
    const body = JSON.stringify(createValidPayload());

    const result = verifyWebhookSignature(body, 'short', TEST_SECRET);
    expect(result).toBe(false);
  });
});

describe('parseWebhookPayload', () => {
  it('should parse valid webhook payload', () => {
    const payload = createValidPayload();
    const body = JSON.stringify(payload);
    const signature = createSignature(body);

    const result = parseWebhookPayload(body, signature, TEST_SECRET);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.action).toBe('create');
      expect(result.data.type).toBe('Issue');
      expect(result.data.organizationId).toBe('org-123');
    }
  });

  it('should return error for invalid signature', () => {
    const body = JSON.stringify(createValidPayload());

    const result = parseWebhookPayload(body, 'invalid-signature', TEST_SECRET);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Invalid webhook signature');
    }
  });

  it('should return error for invalid JSON', () => {
    const body = 'not valid json';
    const signature = createSignature(body);

    const result = parseWebhookPayload(body, signature, TEST_SECRET);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Failed to parse webhook payload');
    }
  });

  it('should return error for missing action', () => {
    const payload = createValidPayload();
    const invalidPayload = { ...payload, action: undefined };
    const body = JSON.stringify(invalidPayload);
    const signature = createSignature(body);

    const result = parseWebhookPayload(body, signature, TEST_SECRET);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Invalid webhook payload structure');
    }
  });

  it('should return error for missing type', () => {
    const payload = createValidPayload();
    const invalidPayload = { ...payload, type: undefined };
    const body = JSON.stringify(invalidPayload);
    const signature = createSignature(body);

    const result = parseWebhookPayload(body, signature, TEST_SECRET);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Invalid webhook payload structure');
    }
  });

  it('should return error for missing data', () => {
    const payload = createValidPayload();
    const invalidPayload = { ...payload, data: undefined };
    const body = JSON.stringify(invalidPayload);
    const signature = createSignature(body);

    const result = parseWebhookPayload(body, signature, TEST_SECRET);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Invalid webhook payload structure');
    }
  });

  it('should handle Buffer input', () => {
    const payload = createValidPayload();
    const body = JSON.stringify(payload);
    const signature = createSignature(body);

    const result = parseWebhookPayload(Buffer.from(body), signature, TEST_SECRET);

    expect(result.success).toBe(true);
  });
});
