import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAbravelyJwtToken,
  setAbravelyJwtToken,
  clearAbravelyJwtToken,
  ABRAVELY_JWT_TOKEN_KEY,
} from 'dashboard/helper/abravelyToken';

describe('abravelyToken helper', () => {
  beforeEach(() => {
    clearAbravelyJwtToken();
    localStorage.clear();
    sessionStorage.clear();
  });

  const validJwt = 'header.payload.signature';
  const railsDeviseSession = JSON.stringify({
    'access-token': 'rails-token-123',
    client: 'client-123',
    uid: 'user@test.com',
  });

  it('returns null when no Abravely JWT is present', () => {
    expect(getAbravelyJwtToken()).toBeNull();
  });

  it('stores and retrieves a valid Abravely JWT token', () => {
    const success = setAbravelyJwtToken(validJwt);
    expect(success).toBe(true);
    expect(getAbravelyJwtToken()).toBe(validJwt);
  });

  it('rejects invalid or Rails Devise session objects as Abravely JWT', () => {
    const success = setAbravelyJwtToken(railsDeviseSession);
    expect(success).toBe(false);
    expect(getAbravelyJwtToken()).toBeNull();
  });

  it('clears token on logout', () => {
    setAbravelyJwtToken(validJwt);
    clearAbravelyJwtToken();
    expect(getAbravelyJwtToken()).toBeNull();
  });
});
