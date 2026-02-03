/**
 * Linear webhook event types
 */

export type LinearWebhookAction = 'create' | 'update' | 'remove';

export type LinearWebhookType =
  | 'Issue'
  | 'Comment'
  | 'IssueLabel'
  | 'Project'
  | 'Cycle';

export interface LinearWebhookEvent {
  action: LinearWebhookAction;
  type: LinearWebhookType;
  createdAt: string;
  organizationId: string;
  webhookId: string;
  webhookTimestamp: number;
  data: LinearIssueData | LinearCommentData;
  url?: string;
}

export interface LinearIssueData {
  id: string;
  identifier: string;
  title: string;
  description?: string;
  priority: number;
  state: {
    id: string;
    name: string;
    type: string;
  };
  team: {
    id: string;
    key: string;
    name: string;
  };
  assignee?: {
    id: string;
    name: string;
    email: string;
  };
  creator?: {
    id: string;
    name: string;
    email: string;
  };
  labels: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface LinearCommentData {
  id: string;
  body: string;
  issueId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export type LinearPriority = 0 | 1 | 2 | 3 | 4;

export const LINEAR_PRIORITY_LABELS: Record<LinearPriority, string> = {
  0: 'No Priority',
  1: 'Urgent',
  2: 'High',
  3: 'Medium',
  4: 'Low',
};
