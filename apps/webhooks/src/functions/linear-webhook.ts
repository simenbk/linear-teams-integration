/**
 * Azure Function: Linear webhook receiver
 */

import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { parseWebhookPayload } from '@linear-teams/linear-client';
import {
  LINEAR_SIGNATURE_HEADER,
  QUEUE_NAMES,
  HTTP_STATUS,
  generateId,
  type LinearWebhookQueueMessage,
} from '@linear-teams/shared';
import { QueueClient } from '@linear-teams/queue';

/**
 * HTTP trigger for Linear webhook events
 */
async function linearWebhookHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('Linear webhook received');

  // Get the raw body for signature verification
  const rawBody = await request.text();
  const signature = request.headers.get(LINEAR_SIGNATURE_HEADER);

  if (!signature) {
    context.warn('Missing Linear signature header');
    return {
      status: HTTP_STATUS.UNAUTHORIZED,
      body: 'Missing signature',
    };
  }

  // Look up tenant by Linear organization ID
  // In production, parse the body first to get organizationId, then look up tenant
  // For now, we use a placeholder
  const webhookSecret = process.env['LINEAR_WEBHOOK_SECRET'];

  if (!webhookSecret) {
    context.error('LINEAR_WEBHOOK_SECRET not configured');
    return {
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      body: 'Server configuration error',
    };
  }

  // Verify signature and parse payload
  const result = parseWebhookPayload(rawBody, signature, webhookSecret);

  if (!result.success) {
    context.warn(`Invalid webhook: ${result.error}`);
    return {
      status: HTTP_STATUS.UNAUTHORIZED,
      body: result.error,
    };
  }

  const payload = result.data;
  context.log(
    `Received ${payload.action} event for ${payload.type} from org ${payload.organizationId}`
  );

  // Queue the event for processing
  try {
    const connectionString = process.env['SERVICE_BUS_CONNECTION_STRING'];
    if (!connectionString) {
      throw new Error('SERVICE_BUS_CONNECTION_STRING not configured');
    }

    const queueClient = new QueueClient({ connectionString });

    const message: Omit<LinearWebhookQueueMessage, 'messageId' | 'createdAt'> = {
      type: 'linear_webhook',
      tenantId: payload.organizationId, // TODO: Map to actual tenant ID
      payload: {
        webhookId: payload.webhookId,
        action: payload.action,
        eventType: payload.type,
        data: payload.data,
        organizationId: payload.organizationId,
      },
    };

    const sendResult = await queueClient.send(QUEUE_NAMES.LINEAR_WEBHOOKS, message);
    await queueClient.close();

    if (!sendResult.success) {
      throw sendResult.error;
    }

    context.log(`Queued webhook event: ${sendResult.data}`);
  } catch (error) {
    context.error('Failed to queue webhook event:', error);
    return {
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      body: 'Failed to process webhook',
    };
  }

  return {
    status: HTTP_STATUS.OK,
    body: 'OK',
  };
}

app.http('linear-webhook', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'webhooks/linear',
  handler: linearWebhookHandler,
});
