import { vi } from 'vitest';
import type {
  TurnContext,
  Activity,
  ConversationReference,
  ResourceResponse,
} from 'botbuilder';

export function createMockActivity(
  overrides?: Partial<Activity>
): Partial<Activity> {
  return {
    type: 'message',
    id: 'activity-123',
    timestamp: new Date(),
    localTimestamp: new Date(),
    channelId: 'msteams',
    from: {
      id: 'user-123',
      name: 'Test User',
      aadObjectId: 'aad-user-123',
    },
    recipient: {
      id: 'bot-123',
      name: 'LinearBot',
    },
    conversation: {
      id: 'conv-123',
      tenantId: 'tenant-123',
      isGroup: true,
      conversationType: 'channel',
      name: 'general',
    },
    serviceUrl: 'https://smba.trafficmanager.net/teams/',
    text: '',
    ...overrides,
  };
}

export function createMockTurnContext(
  activity?: Partial<Activity>
): TurnContext {
  const mockActivity = createMockActivity(activity);

  const sendActivityMock = vi.fn().mockResolvedValue({
    id: 'response-123',
  } as ResourceResponse);

  const context = {
    activity: mockActivity,
    sendActivity: sendActivityMock,
    sendActivities: vi.fn().mockResolvedValue([{ id: 'response-123' }]),
    deleteActivity: vi.fn().mockResolvedValue(undefined),
    updateActivity: vi.fn().mockResolvedValue({ id: 'response-123' }),
    turnState: new Map(),
    responded: false,
    onSendActivities: vi.fn(),
    onUpdateActivity: vi.fn(),
    onDeleteActivity: vi.fn(),
  } as unknown as TurnContext;

  return context;
}

export function createMockConversationReference(): Partial<ConversationReference> {
  return {
    bot: { id: 'bot-123', name: 'LinearBot' },
    conversation: {
      id: 'conv-123',
      tenantId: 'tenant-123',
      isGroup: true,
      conversationType: 'channel',
      name: 'general',
    },
    serviceUrl: 'https://smba.trafficmanager.net/teams/',
    channelId: 'msteams',
    activityId: 'activity-123',
  };
}

export function createMembersAddedActivity(
  botId: string = 'bot-123'
): Partial<Activity> {
  return createMockActivity({
    type: 'conversationUpdate',
    membersAdded: [
      { id: 'new-user-123', name: 'New User' },
      { id: botId, name: 'Bot' },
    ],
    recipient: { id: botId, name: 'Bot' },
  });
}
