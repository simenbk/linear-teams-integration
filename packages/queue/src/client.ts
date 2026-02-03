/**
 * Azure Service Bus client wrapper
 */

import { ServiceBusClient, ServiceBusSender } from '@azure/service-bus';
import type { QueueMessage, Result } from '@linear-teams/shared';
import { ok, err, generateId, nowISO } from '@linear-teams/shared';

export interface QueueClientConfig {
  connectionString: string;
}

/**
 * Service Bus queue client for publishing messages
 */
export class QueueClient {
  private client: ServiceBusClient;
  private senders: Map<string, ServiceBusSender> = new Map();

  constructor(config: QueueClientConfig) {
    this.client = new ServiceBusClient(config.connectionString);
  }

  /**
   * Get or create a sender for a queue
   */
  private getSender(queueName: string): ServiceBusSender {
    let sender = this.senders.get(queueName);
    if (!sender) {
      sender = this.client.createSender(queueName);
      this.senders.set(queueName, sender);
    }
    return sender;
  }

  /**
   * Send a message to a queue
   */
  async send<T extends QueueMessage>(
    queueName: string,
    message: Omit<T, 'messageId' | 'createdAt'>
  ): Promise<Result<string>> {
    try {
      const sender = this.getSender(queueName);
      const messageId = generateId();

      const fullMessage: QueueMessage = {
        ...message,
        messageId,
        createdAt: nowISO(),
      } as QueueMessage;

      await sender.sendMessages({
        body: fullMessage,
        messageId,
        contentType: 'application/json',
      });

      return ok(messageId);
    } catch (error) {
      return err(
        error instanceof Error ? error : new Error('Failed to send message')
      );
    }
  }

  /**
   * Send a batch of messages to a queue
   */
  async sendBatch<T extends QueueMessage>(
    queueName: string,
    messages: Array<Omit<T, 'messageId' | 'createdAt'>>
  ): Promise<Result<string[]>> {
    try {
      const sender = this.getSender(queueName);
      const batch = await sender.createMessageBatch();
      const messageIds: string[] = [];

      for (const message of messages) {
        const messageId = generateId();
        const fullMessage: QueueMessage = {
          ...message,
          messageId,
          createdAt: nowISO(),
        } as QueueMessage;

        const added = batch.tryAddMessage({
          body: fullMessage,
          messageId,
          contentType: 'application/json',
        });

        if (!added) {
          return err(new Error('Message batch full'));
        }

        messageIds.push(messageId);
      }

      await sender.sendMessages(batch);
      return ok(messageIds);
    } catch (error) {
      return err(
        error instanceof Error ? error : new Error('Failed to send batch')
      );
    }
  }

  /**
   * Close all senders and the client
   */
  async close(): Promise<void> {
    for (const sender of this.senders.values()) {
      await sender.close();
    }
    this.senders.clear();
    await this.client.close();
  }
}
