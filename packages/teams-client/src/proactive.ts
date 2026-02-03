/**
 * Proactive messaging for Teams
 */

import {
  CloudAdapter,
  ConversationReference,
  TurnContext,
} from 'botbuilder';
import type { ConversationReferenceData, Result } from '@linear-teams/shared';
import { ok, err } from '@linear-teams/shared';

/**
 * Send a proactive message to a Teams conversation
 */
export async function sendProactiveMessage(
  adapter: CloudAdapter,
  conversationRef: ConversationReferenceData,
  messageFactory: (context: TurnContext) => Promise<void>
): Promise<Result<void>> {
  try {
    const reference = deserializeConversationReference(conversationRef);

    await adapter.continueConversationAsync(
      process.env['MICROSOFT_APP_ID'] ?? '',
      reference,
      async (context) => {
        await messageFactory(context);
      }
    );

    return ok(undefined);
  } catch (error) {
    return err(
      error instanceof Error ? error : new Error('Failed to send proactive message')
    );
  }
}

/**
 * Serialize a ConversationReference for storage
 */
export function serializeConversationReference(
  reference: Partial<ConversationReference>
): ConversationReferenceData {
  return {
    botId: reference.bot?.id ?? '',
    conversationId: reference.conversation?.id ?? '',
    serviceUrl: reference.serviceUrl ?? '',
    tenantId: reference.conversation?.tenantId ?? '',
    channelId: reference.channelId,
    activityId: reference.activityId,
  };
}

/**
 * Deserialize a ConversationReference from storage
 */
export function deserializeConversationReference(
  data: ConversationReferenceData
): Partial<ConversationReference> {
  const ref: Partial<ConversationReference> = {
    bot: { id: data.botId, name: '' },
    conversation: {
      id: data.conversationId,
      tenantId: data.tenantId,
      isGroup: true,
      conversationType: 'channel',
      name: '',
    },
    serviceUrl: data.serviceUrl,
    channelId: data.channelId ?? 'msteams',
  };
  if (data.activityId !== undefined) {
    ref.activityId = data.activityId;
  }
  return ref;
}
