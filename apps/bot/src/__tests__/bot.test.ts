import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LinearTeamsBot } from '../bot.js';
import {
  createMockTurnContext,
  createMockActivity,
  createMembersAddedActivity,
} from './mocks/botbuilder.js';

describe('LinearTeamsBot', () => {
  let bot: LinearTeamsBot;

  beforeEach(() => {
    bot = new LinearTeamsBot();
  });

  describe('message handling', () => {
    it('should show submission form on "submit" command', async () => {
      const context = createMockTurnContext(
        createMockActivity({ text: 'submit' })
      );

      await bot.run(context);

      expect(context.sendActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          attachments: expect.arrayContaining([
            expect.objectContaining({
              contentType: 'application/vnd.microsoft.card.adaptive',
            }),
          ]),
        })
      );
    });

    it('should show submission form on "bug" command', async () => {
      const context = createMockTurnContext(createMockActivity({ text: 'bug' }));

      await bot.run(context);

      expect(context.sendActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          attachments: expect.arrayContaining([
            expect.objectContaining({
              contentType: 'application/vnd.microsoft.card.adaptive',
            }),
          ]),
        })
      );
    });

    it('should show submission form on "feature" command', async () => {
      const context = createMockTurnContext(
        createMockActivity({ text: 'feature' })
      );

      await bot.run(context);

      expect(context.sendActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          attachments: expect.arrayContaining([
            expect.objectContaining({
              contentType: 'application/vnd.microsoft.card.adaptive',
            }),
          ]),
        })
      );
    });

    it('should show help on "help" command', async () => {
      const context = createMockTurnContext(
        createMockActivity({ text: 'help' })
      );

      await bot.run(context);

      expect(context.sendActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          attachments: expect.arrayContaining([
            expect.objectContaining({
              contentType: 'application/vnd.microsoft.card.hero',
            }),
          ]),
        })
      );
    });

    it('should handle case-insensitive commands', async () => {
      const context = createMockTurnContext(
        createMockActivity({ text: 'SUBMIT' })
      );

      await bot.run(context);

      expect(context.sendActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          attachments: expect.arrayContaining([
            expect.objectContaining({
              contentType: 'application/vnd.microsoft.card.adaptive',
            }),
          ]),
        })
      );
    });

    it('should handle commands with whitespace', async () => {
      const context = createMockTurnContext(
        createMockActivity({ text: '  submit  ' })
      );

      await bot.run(context);

      expect(context.sendActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          attachments: expect.arrayContaining([
            expect.objectContaining({
              contentType: 'application/vnd.microsoft.card.adaptive',
            }),
          ]),
        })
      );
    });

    it('should show default response for unknown commands', async () => {
      const context = createMockTurnContext(
        createMockActivity({ text: 'unknown command' })
      );

      await bot.run(context);

      expect(context.sendActivity).toHaveBeenCalledWith(
        expect.stringContaining('submit')
      );
    });

    it('should handle missing text', async () => {
      // Create activity without text property
      const activity = createMockActivity({});
      delete (activity as { text?: string }).text;
      const context = createMockTurnContext(activity);

      await bot.run(context);

      expect(context.sendActivity).toHaveBeenCalled();
    });
  });

  describe('card submission handling', () => {
    it('should process valid issue submission', async () => {
      const context = createMockTurnContext(
        createMockActivity({
          text: '',
          value: {
            action: 'submitIssue',
            type: 'bug',
            title: 'Test Bug',
            description: 'This is a bug description',
            priority: '2',
          },
        })
      );

      await bot.run(context);

      expect(context.sendActivity).toHaveBeenCalledWith(
        expect.stringContaining('bug')
      );
      expect(context.sendActivity).toHaveBeenCalledWith(
        expect.stringContaining('Test Bug')
      );
    });

    it('should process feature submission', async () => {
      const context = createMockTurnContext(
        createMockActivity({
          text: '',
          value: {
            action: 'submitIssue',
            type: 'feature',
            title: 'New Feature',
            description: 'Feature description',
            priority: '3',
          },
        })
      );

      await bot.run(context);

      expect(context.sendActivity).toHaveBeenCalledWith(
        expect.stringContaining('feature')
      );
      expect(context.sendActivity).toHaveBeenCalledWith(
        expect.stringContaining('New Feature')
      );
    });

    it('should require title field', async () => {
      const context = createMockTurnContext(
        createMockActivity({
          text: '',
          value: {
            action: 'submitIssue',
            type: 'bug',
            title: '',
            description: 'Description',
            priority: '2',
          },
        })
      );

      await bot.run(context);

      expect(context.sendActivity).toHaveBeenCalledWith(
        expect.stringContaining('required fields')
      );
    });

    it('should require description field', async () => {
      const context = createMockTurnContext(
        createMockActivity({
          text: '',
          value: {
            action: 'submitIssue',
            type: 'bug',
            title: 'Title',
            description: '',
            priority: '2',
          },
        })
      );

      await bot.run(context);

      expect(context.sendActivity).toHaveBeenCalledWith(
        expect.stringContaining('required fields')
      );
    });

    it('should require type field', async () => {
      const context = createMockTurnContext(
        createMockActivity({
          text: '',
          value: {
            action: 'submitIssue',
            title: 'Title',
            description: 'Description',
            priority: '2',
          },
        })
      );

      await bot.run(context);

      expect(context.sendActivity).toHaveBeenCalledWith(
        expect.stringContaining('required fields')
      );
    });

    it('should ignore non-submitIssue actions', async () => {
      const context = createMockTurnContext(
        createMockActivity({
          text: '',
          value: {
            action: 'otherAction',
            someData: 'value',
          },
        })
      );

      await bot.run(context);

      // Should not send any submission confirmation
      const sendActivityCalls = vi.mocked(context.sendActivity).mock.calls;
      for (const call of sendActivityCalls) {
        const message = call[0];
        if (typeof message === 'string') {
          expect(message).not.toContain('submitted');
        }
      }
    });
  });

  describe('member events', () => {
    it('should welcome new non-bot members', async () => {
      const context = createMockTurnContext(
        createMembersAddedActivity('bot-123')
      );

      await bot.run(context);

      expect(context.sendActivity).toHaveBeenCalledWith(
        expect.stringContaining('Hello')
      );
    });

    it('should not welcome the bot itself', async () => {
      const activity = createMembersAddedActivity('bot-123');
      // Only the bot is added
      activity.membersAdded = [{ id: 'bot-123', name: 'Bot' }];

      const context = createMockTurnContext(activity);

      await bot.run(context);

      // sendActivity should not be called for welcome message
      const sendActivityCalls = vi.mocked(context.sendActivity).mock.calls;
      for (const call of sendActivityCalls) {
        const message = call[0];
        if (typeof message === 'string') {
          expect(message).not.toContain('Hello');
        }
      }
    });
  });
});
