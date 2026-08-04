import { describe, it, expect } from 'vitest';
import { getters } from '../../inboxes';
import { INBOX_TYPES } from 'dashboard/helper/inbox';

describe('inboxes/getters', () => {
  const sampleState = {
    error: 'Mensagem de erro de teste em inboxes',
    records: [
      {
        id: 1,
        name: 'Web Inbox',
        channel_type: INBOX_TYPES.WEB,
      },
      {
        id: 2,
        name: 'Email Inbox',
        channel_type: INBOX_TYPES.EMAIL,
      },
      {
        id: 3,
        name: 'Twilio SMS Inbox',
        channel_type: INBOX_TYPES.TWILIO,
        medium: 'sms',
        phone_number: '+1234567890',
      },
      {
        id: 4,
        name: 'Twilio Whatsapp Inbox',
        channel_type: INBOX_TYPES.TWILIO,
        medium: 'whatsapp',
        phone_number: 'whatsapp:+1234567890',
      },
      {
        id: 5,
        name: 'WhatsApp Official',
        channel_type: INBOX_TYPES.WHATSAPP,
        message_templates: [
          { name: 'hello_world', status: 'approved', components: [] },
          { name: 'auth_template', status: 'approved', category: 'AUTHENTICATION', components: [] },
          { name: 'customer_satisfaction_survey', status: 'approved', components: [] },
          { name: 'rejected_template', status: 'rejected', components: [] },
          { name: 'unsupported_template', status: 'approved', components: [{ type: 'PRODUCT' }] },
        ],
      },
      {
        id: 6,
        name: 'FB Inbox',
        channel_type: INBOX_TYPES.FB,
        instagram_id: 'insta_123',
      },
      {
        id: 7,
        name: 'Instagram Inbox',
        channel_type: INBOX_TYPES.INSTAGRAM,
        instagram_id: 'insta_123',
      },
      {
        id: 8,
        name: 'TikTok Inbox',
        channel_type: INBOX_TYPES.TIKTOK,
        business_id: 'tiktok_456',
      },
    ],
    uiFlags: {
      isFetching: false,
      isCreating: false,
    },
  };

  it('getError', () => {
    expect(getters.getError(sampleState)).toEqual('Mensagem de erro de teste em inboxes');
  });

  it('getInboxes', () => {
    expect(getters.getInboxes(sampleState)).toEqual(sampleState.records);
  });

  it('getAllInboxes', () => {
    const all = getters.getAllInboxes(sampleState);
    expect(all[0].channelType).toEqual(INBOX_TYPES.WEB);
  });

  it('getWhatsAppTemplates', () => {
    const templates = getters.getWhatsAppTemplates(sampleState)(5);
    expect(templates).toHaveLength(5);
  });

  it('getFilteredWhatsAppTemplates', () => {
    const filtered = getters.getFilteredWhatsAppTemplates(sampleState)(5);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toEqual('hello_world');
  });

  it('getNewConversationInboxes', () => {
    const newConvInboxes = getters.getNewConversationInboxes(sampleState);
    expect(newConvInboxes.map(i => i.id)).toEqual([2, 4]);
  });

  it('getInbox and getInboxById', () => {
    expect(getters.getInbox(sampleState)(1)).toEqual(sampleState.records[0]);
    expect(getters.getInboxById(sampleState)(1).name).toEqual('Web Inbox');
    expect(getters.getInbox(sampleState)(999)).toEqual({});
  });

  it('getUIFlags', () => {
    expect(getters.getUIFlags(sampleState)).toEqual(sampleState.uiFlags);
  });

  it('getWebsiteInboxes', () => {
    expect(getters.getWebsiteInboxes(sampleState)).toHaveLength(1);
  });

  it('getTwilioInboxes', () => {
    expect(getters.getTwilioInboxes(sampleState)).toHaveLength(2);
  });

  it('getSMSInboxes', () => {
    expect(getters.getSMSInboxes(sampleState)).toHaveLength(1);
    expect(getters.getSMSInboxes(sampleState)[0].id).toEqual(3);
  });

  it('getWhatsAppInboxes', () => {
    expect(getters.getWhatsAppInboxes(sampleState)).toHaveLength(1);
  });

  it('dialogFlowEnabledInboxes', () => {
    expect(getters.dialogFlowEnabledInboxes(sampleState)).toHaveLength(7);
  });

  it('getFacebookInboxByInstagramId', () => {
    expect(getters.getFacebookInboxByInstagramId(sampleState)('insta_123').id).toEqual(6);
  });

  it('getInstagramInboxByInstagramId', () => {
    expect(getters.getInstagramInboxByInstagramId(sampleState)('insta_123').id).toEqual(7);
  });

  it('getTiktokInboxByBusinessId', () => {
    expect(getters.getTiktokInboxByBusinessId(sampleState)('tiktok_456').id).toEqual(8);
  });
});
