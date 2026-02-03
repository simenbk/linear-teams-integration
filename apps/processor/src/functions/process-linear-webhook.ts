/**
 * Azure Function: Process Linear webhook events from queue
 */

import { app, InvocationContext } from '@azure/functions';
import { parseQueueMessage, createDeadLetterInfo } from '@linear-teams/queue';
import type { LinearWebhookQueueMessage } from '@linear-teams/shared';

/**
 * Service Bus trigger for processing Linear webhook events
 */
async function processLinearWebhook(
  message: unknown,
  context: InvocationContext
): Promise<void> {
  context.log('Processing Linear webhook from queue');

  // Parse and validate message
  const result = parseQueueMessage<LinearWebhookQueueMessage>(message);

  if (!result.success) {
    context.error(`Invalid message: ${result.error}`);
    // Message will be dead-lettered after max delivery attempts
    throw new Error(result.error);
  }

  const { payload, tenantId, messageId } = result.data;
  context.log(
    `Processing ${payload.action} ${payload.eventType} event (${messageId}) for tenant ${tenantId}`
  );

  try {
    // TODO: Implement actual processing logic
    // 1. Look up tenant config
    // 2. Look up channel configs for the Linear team
    // 3. Check if this event should trigger a Teams notification
    // 4. Post to Teams if needed
    // 5. Update sync mapping

    switch (payload.eventType) {
      case 'Issue':
        await processIssueEvent(payload.action, payload.data, tenantId, context);
        break;
      case 'Comment':
        await processCommentEvent(payload.action, payload.data, tenantId, context);
        break;
      default:
        context.log(`Ignoring event type: ${payload.eventType}`);
    }
  } catch (error) {
    context.error('Failed to process Linear webhook:', error);
    throw error; // Rethrow to trigger retry
  }
}

async function processIssueEvent(
  action: string,
  data: unknown,
  tenantId: string,
  context: InvocationContext
): Promise<void> {
  context.log(`Processing issue ${action} for tenant ${tenantId}`);

  // TODO: Implement issue event processing
  // - On create: Check if it matches any channel config, post to Teams
  // - On update: Check sync mapping, post update to Teams if synced
  void action;
  void data;
  void tenantId;
}

async function processCommentEvent(
  action: string,
  data: unknown,
  tenantId: string,
  context: InvocationContext
): Promise<void> {
  context.log(`Processing comment ${action} for tenant ${tenantId}`);

  // TODO: Implement comment event processing
  // - On create: Check if issue is synced, post comment to Teams thread
  void action;
  void data;
  void tenantId;
}

app.serviceBusQueue('process-linear-webhook', {
  queueName: 'linear-webhooks',
  connection: 'SERVICE_BUS_CONNECTION_STRING',
  handler: processLinearWebhook,
});
