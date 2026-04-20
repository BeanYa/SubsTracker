import { describe, expect, it } from 'vitest';

import { getCookieValue } from '../src/api/utils.js';

describe('getCookieValue', () => {
  it('parses cookies separated by semicolons and spaces', () => {
    const cookie = 'theme=dark; token=abc123; session=xyz';

    expect(getCookieValue(cookie, 'token')).toBe('abc123');
  });

  it('supports cookies without spaces after separators', () => {
    const cookie = 'theme=dark;token=abc123;session=xyz';

    expect(getCookieValue(cookie, 'token')).toBe('abc123');
  });
});
