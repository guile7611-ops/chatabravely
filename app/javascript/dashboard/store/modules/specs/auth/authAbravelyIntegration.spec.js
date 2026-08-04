import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { actions } from '../../auth';
import types from '../../../mutation-types';
import { getAbravelyJwtToken, clearAbravelyJwtToken } from 'dashboard/helper/abravelyToken';

vi.mock('axios');

describe('Auth Store & Abravely Express JWT Integration', () => {
  const commit = vi.fn();
  const dispatch = vi.fn();
  const mockJwtToken = 'header.payload.signature_abc';

  beforeEach(() => {
    vi.clearAllMocks();
    clearAbravelyJwtToken();
  });

  it('fetches and stores real Abravely JWT on loginWithCredentials', async () => {
    axios.post.mockResolvedValue({
      data: {
        success: true,
        token: mockJwtToken,
        user: { id: 'usr-1', email: 'test@abravely.com' },
      },
    });

    const token = await actions.loginWithCredentials(
      { commit },
      { email: 'test@abravely.com', password: 'password123' }
    );

    expect(axios.post).toHaveBeenCalledWith('/api/v1/users/login', {
      email: 'test@abravely.com',
      password: 'password123',
    });
    expect(token).toBe(mockJwtToken);
    expect(getAbravelyJwtToken()).toBe(mockJwtToken);
  });

  it('clears Abravely JWT on logout action', () => {
    const validJwt = 'header.payload.signature';
    window.chatwootConfig = { abravelyJwtToken: validJwt };
    expect(getAbravelyJwtToken()).toBe(validJwt);

    actions.logout({ commit });

    expect(getAbravelyJwtToken()).toBeNull();
    expect(commit).toHaveBeenCalledWith(types.CLEAR_USER);
  });
});
