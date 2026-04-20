import { describe, expect, it } from 'vitest';

import { handleUpdateConfig } from '../src/api/handlers/config.js';
import { createMockEnv, readStoredJson } from './helpers/env.js';

describe('handleUpdateConfig', () => {
  it('preserves omitted fields during partial updates', async () => {
    const { env, store } = createMockEnv({
      config: {
        ADMIN_USERNAME: 'admin',
        ADMIN_PASSWORD: 'password',
        JWT_SECRET: 'jwt-secret',
        TG_BOT_TOKEN: 'bot-token',
        TG_CHAT_ID: 'chat-1',
        EMAIL_TO: 'ops@example.com',
        THEME_MODE: 'dark',
        NOTIFICATION_HOURS: ['08', '20'],
        ENABLED_NOTIFIERS: ['telegram'],
        SHOW_LUNAR: false,
        DEBUG_LOGS: false
      }
    });

    const request = new Request('https://example.com/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ADMIN_USERNAME: 'root',
        SHOW_LUNAR: true
      })
    });

    const response = await handleUpdateConfig(request, env);
    const savedConfig = readStoredJson(store, 'config');

    expect(response.status).toBe(200);
    expect(savedConfig.ADMIN_USERNAME).toBe('root');
    expect(savedConfig.SHOW_LUNAR).toBe(true);
    expect(savedConfig.TG_BOT_TOKEN).toBe('bot-token');
    expect(savedConfig.TG_CHAT_ID).toBe('chat-1');
    expect(savedConfig.EMAIL_TO).toBe('ops@example.com');
    expect(savedConfig.THEME_MODE).toBe('dark');
    expect(savedConfig.NOTIFICATION_HOURS).toEqual(['08', '20']);
    expect(savedConfig.ENABLED_NOTIFIERS).toEqual(['telegram']);
  });
});
