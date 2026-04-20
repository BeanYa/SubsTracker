import { describe, expect, it } from 'vitest';

import { checkExpiringSubscriptions } from '../src/services/scheduler.js';
import { createMockEnv, readStoredJson } from './helpers/env.js';

describe('checkExpiringSubscriptions', () => {
  it('skips malformed auto-renew subscriptions instead of looping forever', async () => {
    const { env, store } = createMockEnv({
      config: {
        ADMIN_USERNAME: 'admin',
        ADMIN_PASSWORD: 'password',
        JWT_SECRET: 'jwt-secret',
        NOTIFICATION_HOURS: [],
        PAYMENT_HISTORY_LIMIT: 100,
        ENABLED_NOTIFIERS: []
      },
      subscriptions: [
        {
          id: 'broken-sub',
          name: 'Broken',
          expiryDate: '2024-01-01T00:00:00.000Z',
          periodValue: -1,
          periodUnit: 'month',
          isActive: true,
          autoRenew: true,
          paymentHistory: []
        }
      ]
    });

    await expect(checkExpiringSubscriptions(env)).resolves.toBeUndefined();

    const schedulerStatus = readStoredJson(store, 'scheduler_status');
    const savedSubscriptions = readStoredJson(store, 'subscriptions');

    expect(schedulerStatus.reason).toBe('本次未命中需要提醒的订阅');
    expect(savedSubscriptions).toHaveLength(1);
    expect(savedSubscriptions[0].expiryDate).toBe('2024-01-01T00:00:00.000Z');
  });
});
