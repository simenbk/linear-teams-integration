import { describe, it, expect } from 'vitest';
import { parseQueueMessage, createDeadLetterInfo } from '../handler.js';
import type { LinearWebhookQueueMessage } from '@linear-teams/shared';

function createValidMessage(): LinearWebhookQueueMessage {
  return {
    messageId: 'msg-123',
    type: 'linear_webhook',
    tenantId: 'tenant-123',
    createdAt: '2024-01-15T10:30:00.000Z',
    payload: {
      webhookId: 'webhook-123',
      action: 'create',
      eventType: 'Issue',
      data: { id: 'issue-123' },
      organizationId: 'org-123',
    },
  };
}

describe('parseQueueMessage', () => {
  it('should parse valid object message', () => {
    const message = createValidMessage();

    const result = parseQueueMessage<LinearWebhookQueueMessage>(message);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.messageId).toBe('msg-123');
      expect(result.data.type).toBe('linear_webhook');
      expect(result.data.tenantId).toBe('tenant-123');
    }
  });

  it('should parse valid string message', () => {
    const message = createValidMessage();
    const messageString = JSON.stringify(message);

    const result = parseQueueMessage<LinearWebhookQueueMessage>(messageString);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.messageId).toBe('msg-123');
    }
  });

  it('should return error for invalid JSON string', () => {
    const result = parseQueueMessage('not valid json');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Failed to parse message body as JSON');
    }
  });

  it('should return error for missing messageId', () => {
    const message = createValidMessage();
    const invalidMessage = { ...message, messageId: undefined };

    const result = parseQueueMessage(invalidMessage);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Missing messageId');
    }
  });

  it('should return error for missing type', () => {
    const message = createValidMessage();
    const invalidMessage = { ...message, type: undefined };

    const result = parseQueueMessage(invalidMessage);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Missing message type');
    }
  });

  it('should return error for missing tenantId', () => {
    const message = createValidMessage();
    const invalidMessage = { ...message, tenantId: undefined };

    const result = parseQueueMessage(invalidMessage);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Missing tenantId');
    }
  });

  it('should return error for null message body', () => {
    const result = parseQueueMessage(null);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Invalid message body type');
    }
  });

  it('should return error for number message body', () => {
    const result = parseQueueMessage(123);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Invalid message body type');
    }
  });

  it('should return error for boolean message body', () => {
    const result = parseQueueMessage(true);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Invalid message body type');
    }
  });
});

describe('createDeadLetterInfo', () => {
  it('should create dead letter info from Error', () => {
    const error = new Error('Something went wrong');
    error.stack = 'Error: Something went wrong\n    at test.ts:10';

    const info = createDeadLetterInfo('processing_failed', error, 3);

    expect(info.reason).toBe('processing_failed');
    expect(info.description).toBe('Something went wrong');
    expect(info.attemptCount).toBe(3);
    expect(info.lastError).toContain('Error: Something went wrong');
  });

  it('should create dead letter info from string error', () => {
    const info = createDeadLetterInfo('validation_failed', 'Invalid payload', 1);

    expect(info.reason).toBe('validation_failed');
    expect(info.description).toBe('Invalid payload');
    expect(info.attemptCount).toBe(1);
    expect(info.lastError).toBeUndefined();
  });

  it('should handle Error without stack trace', () => {
    const error = new Error('No stack');
    delete error.stack;

    const info = createDeadLetterInfo('error', error, 2);

    expect(info.description).toBe('No stack');
    expect(info.lastError).toBeUndefined();
  });
});
