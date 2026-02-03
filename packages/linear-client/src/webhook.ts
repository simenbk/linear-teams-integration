/**
 * Linear webhook signature verification
 */

import { createHmac, timingSafeEqual } from 'crypto';
import type { LinearWebhookEvent, Result } from '@linear-teams/shared';
import { ok, err, safeJsonParse } from '@linear-teams/shared';

/**
 * Verify Linear webhook signature
 */
export function verifyWebhookSignature(
  rawBody: string | Buffer,
  signature: string,
  secret: string
): boolean {
  const body = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
  const expectedSignature = createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  try {
    return timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

/**
 * Parse and validate a Linear webhook payload
 */
export function parseWebhookPayload(
  rawBody: string | Buffer,
  signature: string,
  secret: string
): Result<LinearWebhookEvent, string> {
  const body = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');

  if (!verifyWebhookSignature(body, signature, secret)) {
    return err('Invalid webhook signature');
  }

  const payload = safeJsonParse<LinearWebhookEvent>(body);
  if (!payload) {
    return err('Failed to parse webhook payload');
  }

  // Basic validation
  if (!payload.action || !payload.type || !payload.data) {
    return err('Invalid webhook payload structure');
  }

  return ok(payload);
}
