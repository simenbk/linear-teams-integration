/**
 * Queue message handling helpers for Azure Functions
 */

import type { QueueMessage, Result } from '@linear-teams/shared';
import { ok, err, safeJsonParse } from '@linear-teams/shared';

/**
 * Parse and validate a queue message from Azure Functions Service Bus trigger
 */
export function parseQueueMessage<T extends QueueMessage>(
  messageBody: unknown
): Result<T, string> {
  if (typeof messageBody === 'string') {
    const parsed = safeJsonParse<T>(messageBody);
    if (!parsed) {
      return err('Failed to parse message body as JSON');
    }
    return validateMessage(parsed);
  }

  if (typeof messageBody === 'object' && messageBody !== null) {
    return validateMessage(messageBody as T);
  }

  return err('Invalid message body type');
}

function validateMessage<T extends QueueMessage>(message: T): Result<T, string> {
  if (!message.messageId) {
    return err('Missing messageId');
  }
  if (!message.type) {
    return err('Missing message type');
  }
  if (!message.tenantId) {
    return err('Missing tenantId');
  }
  return ok(message);
}

/**
 * Create a dead letter reason for failed messages
 */
export interface DeadLetterInfo {
  reason: string;
  description: string;
  attemptCount: number;
  lastError?: string;
}

export function createDeadLetterInfo(
  reason: string,
  error: Error | string,
  attemptCount: number
): DeadLetterInfo {
  return {
    reason,
    description: typeof error === 'string' ? error : error.message,
    attemptCount,
    lastError: error instanceof Error ? error.stack : undefined,
  };
}
