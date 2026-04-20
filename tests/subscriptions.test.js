import { describe, expect, it } from 'vitest';

import { createSubscription, deletePaymentRecord } from '../src/data/subscriptions.js';
import { createMockEnv, readStoredJson } from './helpers/env.js';

describe('subscriptions data helpers', () => {
  it('rejects invalid renewal periods instead of persisting unsafe values', async () => {
    const { env } = createMockEnv({ subscriptions: [] });

    const result = await createSubscription({
      name: 'Bad Period',
      expiryDate: '2024-01-01T00:00:00.000Z',
      periodValue: -1,
      periodUnit: 'month'
    }, env);

    expect(result.success).toBe(false);
    expect(result.message).toBe('续订周期无效');
  });

  it('recalculates expiry date from the latest remaining payment period', async () => {
    const { env, store } = createMockEnv({
      subscriptions: [
        {
          id: 'sub-1',
          name: 'Netflix',
          startDate: '2024-01-01T00:00:00.000Z',
          createdAt: '2024-01-01T00:00:00.000Z',
          expiryDate: '2024-06-01T00:00:00.000Z',
          lastPaymentDate: '2024-05-01T00:00:00.000Z',
          paymentHistory: [
            {
              id: 'payment-old',
              date: '2024-02-01T00:00:00.000Z',
              periodStart: '2024-02-01T00:00:00.000Z',
              periodEnd: '2024-03-01T00:00:00.000Z'
            },
            {
              id: 'payment-new',
              date: '2024-05-01T00:00:00.000Z',
              periodStart: '2024-05-01T00:00:00.000Z',
              periodEnd: '2024-06-01T00:00:00.000Z'
            },
            {
              id: 'payment-delete',
              date: '2024-04-01T00:00:00.000Z',
              periodStart: '2024-04-01T00:00:00.000Z',
              periodEnd: '2024-05-01T00:00:00.000Z'
            }
          ]
        }
      ]
    });

    const result = await deletePaymentRecord('sub-1', 'payment-delete', env);
    const savedSubscriptions = readStoredJson(store, 'subscriptions');

    expect(result.success).toBe(true);
    expect(savedSubscriptions[0].expiryDate).toBe('2024-06-01T00:00:00.000Z');
    expect(savedSubscriptions[0].lastPaymentDate).toBe('2024-05-01T00:00:00.000Z');
  });
});
