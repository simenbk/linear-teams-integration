/**
 * Teams submission types
 */

export type SubmissionType = 'bug' | 'feature';

export interface TeamsSubmission {
  /** Unique submission ID */
  id: string;
  /** Type of submission */
  type: SubmissionType;
  /** Title of the bug/feature */
  title: string;
  /** Detailed description */
  description: string;
  /** Priority (1=urgent, 4=low) */
  priority: 1 | 2 | 3 | 4;
  /** ID of the Teams user who submitted */
  submittedBy: TeamsUser;
  /** Teams conversation reference for proactive messaging */
  conversationReference: ConversationReferenceData;
  /** Timestamp of submission */
  submittedAt: string;
  /** Optional attachments */
  attachments?: TeamsAttachment[];
}

export interface TeamsUser {
  /** Azure AD object ID */
  aadObjectId: string;
  /** Display name */
  name: string;
  /** Email address */
  email?: string | undefined;
}

export interface TeamsAttachment {
  /** Attachment ID */
  id: string;
  /** Content type */
  contentType: string;
  /** File name */
  name: string;
  /** URL to fetch the attachment */
  contentUrl: string;
}

/**
 * Serialized conversation reference for proactive messaging
 */
export interface ConversationReferenceData {
  /** Bot ID */
  botId: string;
  /** Conversation ID */
  conversationId: string;
  /** Service URL */
  serviceUrl: string;
  /** Tenant ID */
  tenantId: string;
  /** Channel ID (for channel messages) */
  channelId?: string | undefined;
  /** Activity ID of the original message */
  activityId?: string | undefined;
}
