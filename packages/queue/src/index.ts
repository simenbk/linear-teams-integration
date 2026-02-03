/**
 * @linear-teams/queue
 * Azure Service Bus publish/consume helpers
 */

export { QueueClient, type QueueClientConfig } from './client.js';
export {
  parseQueueMessage,
  createDeadLetterInfo,
  type DeadLetterInfo,
} from './handler.js';
