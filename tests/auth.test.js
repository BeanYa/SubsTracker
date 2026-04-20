import { afterEach, describe, expect, it, vi } from 'vitest';

import { generateJWT, verifyJWT } from '../src/core/auth.js';

describe('verifyJWT', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects expired tokens', async () => {
    const initialNow = 1_700_000_000_000;
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(initialNow);
    const token = await generateJWT('admin', 'secret');

    nowSpy.mockReturnValue(initialNow + 90_000_000);

    await expect(verifyJWT(token, 'secret')).resolves.toBeNull();
  });
});
