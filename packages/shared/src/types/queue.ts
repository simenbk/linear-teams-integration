/**
 * Queue message types for Azure Service Bus
 */

export type QueueMessageType =
  | 'linear_webhook'
  | 'teams_submission'
  | 'sync_to_teams'
  | 'sync_to_linear';

export interface BaseQueueMessage {
  /** Unique message ID for deduplication */
  messageId: string;
  /** Message type discriminator */
  type: QueueMessageType;
  /** Tenant ID */
  tenantId: string;
  /** Timestamp when the message was created */
  createdAt: string;
  /** Number of processing attempts */
  attemptCount?: number;
}

export interface LinearWebhookQueueMessage extends BaseQueueMessage {
  type: 'linear_webhook';
  payload: {
    webhookId: string;
    action: string;
    eventType: string;
    data: unknown;
    organizationId: string;
  };
}

export interface TeamsSubmissionQueueMessage extends BaseQueueMessage {
  type: 'teams_submission';
  payload: {
    submissionId: string;
    channelConfigId: string;
    title: string;
    description: string;
    priority: 1 | 2 | 3 | 4;
    submitterAadId: string;
    submitterName: string;
    conversationReference: string; // JSON stringified
  };
}

export interface SyncToTeamsQueueMessage extends BaseQueueMessage {
  type: 'sync_to_teams';
  payload: {
    linearIssueId: string;
    linearIssueIdentifier: string;
    action: 'created' | 'updated' | 'commented';
    channelConfigId: string;
    changes?: Record<string, unknown>;
  };
}

export interface SyncToLinearQueueMessage extends BaseQueueMessage {
  type: 'sync_to_linear';
  payload: {
    syncMappingId: string;
    action: 'comment_added' | 'status_changed';
    data: Record<string, unknown>;
  };
}

export type QueueMessage =
  | LinearWebhookQueueMessage
  | TeamsSubmissionQueueMessage
  | SyncToTeamsQueueMessage
  | SyncToLinearQueueMessage;
