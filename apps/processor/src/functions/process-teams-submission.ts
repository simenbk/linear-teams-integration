/**
 * Azure Function: Process Teams submissions from queue
 */

import { app, InvocationContext } from '@azure/functions';
import { parseQueueMessage } from '@linear-teams/queue';
import type { TeamsSubmissionQueueMessage } from '@linear-teams/shared';

/**
 * Service Bus trigger for processing Teams submissions
 */
async function processTeamsSubmission(
  message: unknown,
  context: InvocationContext
): Promise<void> {
  context.log('Processing Teams submission from queue');

  // Parse and validate message
  const result = parseQueueMessage<TeamsSubmissionQueueMessage>(message);

  if (!result.success) {
    context.error(`Invalid message: ${result.error}`);
    throw new Error(result.error);
  }

  const { payload, tenantId, messageId } = result.data;
  context.log(
    `Processing submission ${payload.submissionId} (${messageId}) for tenant ${tenantId}`
  );

  try {
    // TODO: Implement actual processing logic
    // 1. Look up tenant config to get Linear API key
    // 2. Look up channel config to get Linear team ID and defaults
    // 3. Create issue in Linear
    // 4. Create sync mapping
    // 5. Post confirmation to Teams (proactive message)

    const { title, priority } = payload;

    context.log(`Creating Linear issue: ${title} (priority ${priority})`);

    // Placeholder for Linear issue creation
    const linearIssue = {
      id: 'placeholder-issue-id',
      identifier: 'ENG-123',
      url: 'https://linear.app/team/issue/ENG-123',
    };

    context.log(`Created Linear issue: ${linearIssue.identifier}`);

    // TODO: Create sync mapping in database
    // TODO: Send confirmation to Teams
  } catch (error) {
    context.error('Failed to process Teams submission:', error);
    throw error; // Rethrow to trigger retry
  }
}

app.serviceBusQueue('process-teams-submission', {
  queueName: 'teams-submissions',
  connection: 'SERVICE_BUS_CONNECTION_STRING',
  handler: processTeamsSubmission,
});
