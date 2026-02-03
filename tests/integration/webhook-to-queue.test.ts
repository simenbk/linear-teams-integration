import { describe, it, expect } from 'vitest';
import { createHmac } from 'crypto';
import { parseWebhookPayload } from '@linear-teams/linear-client';
import { parseQueueMessage } from '@linear-teams/queue';
import type {
  LinearWebhookEvent,
  LinearWebhookQueueMessage,
} from '@linear-teams/shared';
import { generateId, nowISO } from '@linear-teams/shared';

const TEST_SECRET = 'integration-test-secret';

function createSignature(body: string): string {
  return createHmac('sha256', TEST_SECRET).update(body).digest('hex');
}

describe('Webhook to Queue Integration', () => {
  describe('Issue create flow', () => {
    it('should parse webhook and create valid queue message', () => {
      // Step 1: Simulate incoming webhook payload
      const webhookPayload: LinearWebhookEvent = {
        action: 'create',
        type: 'Issue',
        createdAt: '2024-01-15T10:30:00.000Z',
        organizationId: 'org-integration-test',
        webhookId: 'webhook-int-123',
        webhookTimestamp: Date.now(),
        data: {
          id: 'issue-int-123',
          identifier: 'INT-1',
          title: 'Integration Test Issue',
          description: 'Testing the full flow',
          priority: 2,
          state: { id: 'state-1', name: 'In Progress', type: 'started' },
          team: { id: 'team-1', key: 'INT', name: 'Integration Team' },
          assignee: {
            id: 'user-1',
            name: 'Test User',
            email: 'test@example.com',
          },
          labels: [{ id: 'label-1', name: 'test', color: '#ff0000' }],
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:30:00.000Z',
        },
      };

      const rawBody = JSON.stringify(webhookPayload);
      const signature = createSignature(rawBody);

      // Step 2: Parse webhook (simulates webhook handler)
      const webhookResult = parseWebhookPayload(rawBody, signature, TEST_SECRET);
      expect(webhookResult.success).toBe(true);

      if (!webhookResult.success) return;

      const payload = webhookResult.data;

      // Step 3: Create queue message (simulates what webhook handler does)
      const queueMessage: LinearWebhookQueueMessage = {
        messageId: generateId(),
        type: 'linear_webhook',
        tenantId: payload.organizationId,
        createdAt: nowISO(),
        payload: {
          webhookId: payload.webhookId,
          action: payload.action,
          eventType: payload.type,
          data: payload.data,
          organizationId: payload.organizationId,
        },
      };

      // Step 4: Validate queue message can be parsed (simulates processor receiving)
      const queueResult =
        parseQueueMessage<LinearWebhookQueueMessage>(queueMessage);
      expect(queueResult.success).toBe(true);

      if (!queueResult.success) return;

      // Step 5: Verify data integrity through the flow
      expect(queueResult.data.type).toBe('linear_webhook');
      expect(queueResult.data.tenantId).toBe('org-integration-test');
      expect(queueResult.data.payload.action).toBe('create');
      expect(queueResult.data.payload.eventType).toBe('Issue');
      expect(queueResult.data.payload.data).toEqual(webhookPayload.data);
    });

    it('should handle issue update flow', () => {
      const webhookPayload: LinearWebhookEvent = {
        action: 'update',
        type: 'Issue',
        createdAt: '2024-01-15T11:00:00.000Z',
        organizationId: 'org-integration-test',
        webhookId: 'webhook-int-456',
        webhookTimestamp: Date.now(),
        data: {
          id: 'issue-int-123',
          identifier: 'INT-1',
          title: 'Integration Test Issue - Updated',
          priority: 1,
          state: { id: 'state-2', name: 'Done', type: 'completed' },
          team: { id: 'team-1', key: 'INT', name: 'Integration Team' },
          labels: [],
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T11:00:00.000Z',
        },
      };

      const rawBody = JSON.stringify(webhookPayload);
      const signature = createSignature(rawBody);

      const webhookResult = parseWebhookPayload(rawBody, signature, TEST_SECRET);
      expect(webhookResult.success).toBe(true);

      if (!webhookResult.success) return;

      const queueMessage: LinearWebhookQueueMessage = {
        messageId: generateId(),
        type: 'linear_webhook',
        tenantId: webhookResult.data.organizationId,
        createdAt: nowISO(),
        payload: {
          webhookId: webhookResult.data.webhookId,
          action: webhookResult.data.action,
          eventType: webhookResult.data.type,
          data: webhookResult.data.data,
          organizationId: webhookResult.data.organizationId,
        },
      };

      const queueResult =
        parseQueueMessage<LinearWebhookQueueMessage>(queueMessage);
      expect(queueResult.success).toBe(true);

      if (!queueResult.success) return;

      expect(queueResult.data.payload.action).toBe('update');
    });
  });

  describe('Comment create flow', () => {
    it('should handle comment webhook to queue flow', () => {
      const webhookPayload: LinearWebhookEvent = {
        action: 'create',
        type: 'Comment',
        createdAt: '2024-01-15T12:00:00.000Z',
        organizationId: 'org-integration-test',
        webhookId: 'webhook-int-789',
        webhookTimestamp: Date.now(),
        data: {
          id: 'comment-123',
          body: 'This is a test comment',
          issueId: 'issue-int-123',
          userId: 'user-1',
          createdAt: '2024-01-15T12:00:00.000Z',
          updatedAt: '2024-01-15T12:00:00.000Z',
        },
      };

      const rawBody = JSON.stringify(webhookPayload);
      const signature = createSignature(rawBody);

      const webhookResult = parseWebhookPayload(rawBody, signature, TEST_SECRET);
      expect(webhookResult.success).toBe(true);

      if (!webhookResult.success) return;

      const queueMessage: LinearWebhookQueueMessage = {
        messageId: generateId(),
        type: 'linear_webhook',
        tenantId: webhookResult.data.organizationId,
        createdAt: nowISO(),
        payload: {
          webhookId: webhookResult.data.webhookId,
          action: webhookResult.data.action,
          eventType: webhookResult.data.type,
          data: webhookResult.data.data,
          organizationId: webhookResult.data.organizationId,
        },
      };

      const queueResult =
        parseQueueMessage<LinearWebhookQueueMessage>(queueMessage);
      expect(queueResult.success).toBe(true);

      if (!queueResult.success) return;

      expect(queueResult.data.payload.eventType).toBe('Comment');
    });
  });

  describe('Error scenarios', () => {
    it('should reject tampered webhook payload', () => {
      const webhookPayload: LinearWebhookEvent = {
        action: 'create',
        type: 'Issue',
        createdAt: '2024-01-15T10:30:00.000Z',
        organizationId: 'org-test',
        webhookId: 'webhook-123',
        webhookTimestamp: Date.now(),
        data: {
          id: 'issue-123',
          identifier: 'TEST-1',
          title: 'Original Title',
          priority: 2,
          state: { id: 'state-1', name: 'Todo', type: 'unstarted' },
          team: { id: 'team-1', key: 'TEST', name: 'Test Team' },
          labels: [],
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:30:00.000Z',
        },
      };

      const rawBody = JSON.stringify(webhookPayload);
      const signature = createSignature(rawBody);

      // Tamper with the payload after signing
      const tamperedBody = rawBody.replace('Original Title', 'Tampered Title');

      const result = parseWebhookPayload(tamperedBody, signature, TEST_SECRET);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error).toBe('Invalid webhook signature');
      }
    });

    it('should reject queue message with missing required fields', () => {
      const invalidMessage = {
        messageId: generateId(),
        type: 'linear_webhook',
        // Missing tenantId
        createdAt: nowISO(),
        payload: {
          webhookId: 'webhook-123',
          action: 'create',
          eventType: 'Issue',
          data: {},
          organizationId: 'org-test',
        },
      };

      const result = parseQueueMessage(invalidMessage);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error).toBe('Missing tenantId');
      }
    });
  });
});
