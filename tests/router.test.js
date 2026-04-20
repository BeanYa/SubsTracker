import { beforeEach, describe, expect, it, vi } from 'vitest';

const getConfigMock = vi.fn();
const getUserFromRequestMock = vi.fn();
const handleThirdPartyNotifyMock = vi.fn();
const handleSubscriptionsMock = vi.fn();

vi.mock('../src/data/config.js', () => ({
  getConfig: getConfigMock
}));

vi.mock('../src/api/handlers/auth.js', () => ({
  handleLogin: vi.fn(),
  handleLogout: vi.fn(),
  getUserFromRequest: getUserFromRequestMock
}));

vi.mock('../src/api/handlers/config.js', () => ({
  handleGetConfig: vi.fn(),
  handleUpdateConfig: vi.fn()
}));

vi.mock('../src/api/handlers/dashboard.js', () => ({
  handleDashboardStats: vi.fn()
}));

vi.mock('../src/api/handlers/notify.js', () => ({
  handleThirdPartyNotify: handleThirdPartyNotifyMock
}));

vi.mock('../src/api/handlers/subscriptions.js', () => ({
  handleSubscriptions: handleSubscriptionsMock
}));

vi.mock('../src/api/handlers/test-notification.js', () => ({
  handleTestNotification: vi.fn()
}));

const { handleApiRequest } = await import('../src/api/router.js');

describe('handleApiRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getConfigMock.mockResolvedValue({ THIRD_PARTY_API_TOKEN: 'token' });
    handleSubscriptionsMock.mockResolvedValue(null);
  });

  it('allows third-party notify requests before admin login auth', async () => {
    handleThirdPartyNotifyMock.mockResolvedValue(
      new Response(JSON.stringify({ message: 'ok' }), { status: 200 })
    );
    getUserFromRequestMock.mockResolvedValue({ user: null });

    const response = await handleApiRequest(
      new Request('https://example.com/api/notify/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'ping' })
      }),
      {}
    );

    expect(response.status).toBe(200);
    expect(handleThirdPartyNotifyMock).toHaveBeenCalledOnce();
    expect(getUserFromRequestMock).not.toHaveBeenCalled();
  });
});
