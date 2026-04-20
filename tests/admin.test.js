import { beforeEach, describe, expect, it, vi } from 'vitest';

const getConfigMock = vi.fn();
const verifyJWTMock = vi.fn();

vi.mock('../src/data/config.js', () => ({
  getConfig: getConfigMock
}));

vi.mock('../src/core/auth.js', () => ({
  verifyJWT: verifyJWTMock
}));

vi.mock('../src/views/pages.js', () => ({
  loginPage: '<login />',
  adminPage: '<subscriptions />',
  configPage: '<config />',
  dashboardPage: vi.fn(() => '<dashboard />')
}));

const { handleAdminRequest } = await import('../src/api/admin.js');

describe('handleAdminRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getConfigMock.mockResolvedValue({ JWT_SECRET: 'secret' });
    verifyJWTMock.mockResolvedValue({ username: 'admin' });
  });

  it('keeps /admin as the default homepage entry', async () => {
    const response = await handleAdminRequest(
      new Request('https://example.com/admin', {
        headers: { Cookie: 'token=valid' }
      }),
      {}
    );

    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('/admin/dashboard');
  });

  it('serves subscriptions from an explicit route', async () => {
    const response = await handleAdminRequest(
      new Request('https://example.com/admin/subscriptions', {
        headers: { Cookie: 'token=valid' }
      }),
      {}
    );

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe('<subscriptions />');
  });
});
