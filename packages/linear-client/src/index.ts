/**
 * @linear-teams/linear-client
 * Typed wrapper around @linear/sdk
 */

export { LinearClient } from './client.js';
export type { CreateIssueParams, UpdateIssueParams, AddCommentParams } from './client.js';
export { verifyWebhookSignature, parseWebhookPayload } from './webhook.js';
