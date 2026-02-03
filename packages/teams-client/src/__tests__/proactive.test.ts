import { describe, it, expect } from 'vitest';
import {
  serializeConversationReference,
  deserializeConversationReference,
} from '../proactive.js';
import type { ConversationReferenceData } from '@linear-teams/shared';
import type { ConversationReference } from 'botbuilder';

describe('serializeConversationReference', () => {
  it('should serialize a full conversation reference', () => {
    const reference: Partial<ConversationReference> = {
      bot: { id: 'bot-123', name: 'LinearBot' },
      conversation: {
        id: 'conv-456',
        tenantId: 'tenant-789',
        isGroup: true,
        conversationType: 'channel',
        name: 'general',
      },
      serviceUrl: 'https://smba.trafficmanager.net/teams/',
      channelId: 'msteams',
      activityId: 'activity-abc',
    };

    const serialized = serializeConversationReference(reference);

    expect(serialized.botId).toBe('bot-123');
    expect(serialized.conversationId).toBe('conv-456');
    expect(serialized.tenantId).toBe('tenant-789');
    expect(serialized.serviceUrl).toBe('https://smba.trafficmanager.net/teams/');
    expect(serialized.channelId).toBe('msteams');
    expect(serialized.activityId).toBe('activity-abc');
  });

  it('should handle missing bot', () => {
    const reference: Partial<ConversationReference> = {
      conversation: {
        id: 'conv-456',
        tenantId: 'tenant-789',
        isGroup: true,
        conversationType: 'channel',
        name: '',
      },
      serviceUrl: 'https://service.url',
    };

    const serialized = serializeConversationReference(reference);

    expect(serialized.botId).toBe('');
  });

  it('should handle missing conversation', () => {
    // Test with an empty reference to simulate missing conversation
    const reference: Partial<ConversationReference> = {
      bot: { id: 'bot-123', name: 'Bot' },
      serviceUrl: 'https://service.url',
    };

    const serialized = serializeConversationReference(reference);

    expect(serialized.conversationId).toBe('');
    expect(serialized.tenantId).toBe('');
  });

  it('should handle missing optional fields', () => {
    const reference: Partial<ConversationReference> = {
      bot: { id: 'bot-123', name: 'Bot' },
      conversation: {
        id: 'conv-456',
        tenantId: 'tenant-789',
        isGroup: false,
        conversationType: 'personal',
        name: '',
      },
      serviceUrl: 'https://service.url',
    };

    const serialized = serializeConversationReference(reference);

    expect(serialized.channelId).toBeUndefined();
    expect(serialized.activityId).toBeUndefined();
  });

  it('should handle empty reference', () => {
    const reference: Partial<ConversationReference> = {};

    const serialized = serializeConversationReference(reference);

    expect(serialized.botId).toBe('');
    expect(serialized.conversationId).toBe('');
    expect(serialized.tenantId).toBe('');
    expect(serialized.serviceUrl).toBe('');
  });
});

describe('deserializeConversationReference', () => {
  it('should deserialize a full conversation reference', () => {
    const data: ConversationReferenceData = {
      botId: 'bot-123',
      conversationId: 'conv-456',
      tenantId: 'tenant-789',
      serviceUrl: 'https://smba.trafficmanager.net/teams/',
      channelId: 'msteams',
      activityId: 'activity-abc',
    };

    const reference = deserializeConversationReference(data);

    expect(reference.bot?.id).toBe('bot-123');
    expect(reference.conversation?.id).toBe('conv-456');
    expect(reference.conversation?.tenantId).toBe('tenant-789');
    expect(reference.serviceUrl).toBe('https://smba.trafficmanager.net/teams/');
    expect(reference.channelId).toBe('msteams');
    expect(reference.activityId).toBe('activity-abc');
  });

  it('should set default channelId when not provided', () => {
    const data: ConversationReferenceData = {
      botId: 'bot-123',
      conversationId: 'conv-456',
      tenantId: 'tenant-789',
      serviceUrl: 'https://service.url',
    };

    const reference = deserializeConversationReference(data);

    expect(reference.channelId).toBe('msteams');
  });

  it('should not include activityId when undefined', () => {
    const data: ConversationReferenceData = {
      botId: 'bot-123',
      conversationId: 'conv-456',
      tenantId: 'tenant-789',
      serviceUrl: 'https://service.url',
    };

    const reference = deserializeConversationReference(data);

    expect(reference.activityId).toBeUndefined();
  });

  it('should set conversation metadata', () => {
    const data: ConversationReferenceData = {
      botId: 'bot-123',
      conversationId: 'conv-456',
      tenantId: 'tenant-789',
      serviceUrl: 'https://service.url',
    };

    const reference = deserializeConversationReference(data);

    expect(reference.conversation?.isGroup).toBe(true);
    expect(reference.conversation?.conversationType).toBe('channel');
    expect(reference.conversation?.name).toBe('');
  });

  it('should set bot name as empty string', () => {
    const data: ConversationReferenceData = {
      botId: 'bot-123',
      conversationId: 'conv-456',
      tenantId: 'tenant-789',
      serviceUrl: 'https://service.url',
    };

    const reference = deserializeConversationReference(data);

    expect(reference.bot?.name).toBe('');
  });
});

describe('serialization round-trip', () => {
  it('should preserve data through serialize/deserialize cycle', () => {
    const originalRef: Partial<ConversationReference> = {
      bot: { id: 'bot-123', name: 'LinearBot' },
      conversation: {
        id: 'conv-456',
        tenantId: 'tenant-789',
        isGroup: true,
        conversationType: 'channel',
        name: 'general',
      },
      serviceUrl: 'https://smba.trafficmanager.net/teams/',
      channelId: 'msteams',
      activityId: 'activity-abc',
    };

    const serialized = serializeConversationReference(originalRef);
    const deserialized = deserializeConversationReference(serialized);

    expect(deserialized.bot?.id).toBe(originalRef.bot?.id);
    expect(deserialized.conversation?.id).toBe(originalRef.conversation?.id);
    expect(deserialized.conversation?.tenantId).toBe(
      originalRef.conversation?.tenantId
    );
    expect(deserialized.serviceUrl).toBe(originalRef.serviceUrl);
    expect(deserialized.channelId).toBe(originalRef.channelId);
    expect(deserialized.activityId).toBe(originalRef.activityId);
  });

  it('should preserve data without optional fields', () => {
    const originalRef: Partial<ConversationReference> = {
      bot: { id: 'bot-123', name: 'Bot' },
      conversation: {
        id: 'conv-456',
        tenantId: 'tenant-789',
        isGroup: false,
        conversationType: 'personal',
        name: '',
      },
      serviceUrl: 'https://service.url',
    };

    const serialized = serializeConversationReference(originalRef);
    const deserialized = deserializeConversationReference(serialized);

    expect(deserialized.bot?.id).toBe(originalRef.bot?.id);
    expect(deserialized.conversation?.id).toBe(originalRef.conversation?.id);
    expect(deserialized.conversation?.tenantId).toBe(
      originalRef.conversation?.tenantId
    );
    expect(deserialized.serviceUrl).toBe(originalRef.serviceUrl);
  });
});
