import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { actions } from '../../auth';
import types from '../../../mutation-types';
import { getAbravelyJwtToken, clearAbravelyJwtToken } from 'dashboard/helper/abravelyToken';
import * as socketIoConnectorModule from 'dashboard/helper/socketIoConnector';

vi.mock('axios');

describe('Auth Store & Abravely Express JWT Integration (Strict Security Rules)', () => {
  const commit = vi.fn();
  const dispatch = vi.fn();
  const mockJwtToken = 'header.payload.signature_real_123';

  beforeEach(() => {
    vi.clearAllMocks();
    clearAbravelyJwtToken();
  });

  it('does NOT make any Express login request or send hardcoded passwords during validityCheck', async () => {
    axios.get.mockResolvedValue({
      data: { payload: { data: { id: 1, email: 'agente@abravely.com', name: 'Agente Real' } } },
    });

    await actions.validityCheck({ commit });

    // Confirmar estritamente que validityCheck NUNCA faz requisição POST para login Express com senhas hardcoded
    expect(axios.post).not.toHaveBeenCalled();
    expect(getAbravelyJwtToken()).toBeNull();
  });

  it('fetches and stores real Abravely JWT strictly on loginWithCredentials when user enters email and password', async () => {
    axios.post.mockResolvedValue({
      data: {
        success: true,
        token: mockJwtToken,
        user: { id: 'usr-1', email: 'agente@abravely.com' },
      },
    });

    const token = await actions.loginWithCredentials(
      { commit },
      { email: 'agente@abravely.com', password: 'user-secret-password' }
    );

    expect(axios.post).toHaveBeenCalledWith('/api/v1/users/login', {
      email: 'agente@abravely.com',
      password: 'user-secret-password',
    });
    expect(token).toBe(mockJwtToken);
    expect(getAbravelyJwtToken()).toBe(mockJwtToken);
  });

  it('disconnects Socket.IO explicitly and removes JWT on logout action', () => {
    const disconnectSpy = vi.spyOn(socketIoConnectorModule, 'disconnectSocketIo');
    const validJwt = 'header.payload.signature_active';
    window.chatwootConfig = { abravelyJwtToken: validJwt };
    expect(getAbravelyJwtToken()).toBe(validJwt);

    actions.logout({ commit });

    // Confirmar desconexao do Socket.IO ANTES e limpeza do token
    expect(disconnectSpy).toHaveBeenCalledTimes(1);
    expect(getAbravelyJwtToken()).toBeNull();
    expect(commit).toHaveBeenCalledWith(types.CLEAR_USER);
  });

  it('rejects login and guarantees no JWT token is stored when database is offline and API returns HTTP 503', async () => {
    const errorResponse = {
      response: {
        status: 503,
        data: { success: false, message: 'Serviço de banco de dados indisponível.' },
      },
    };
    axios.post.mockRejectedValue(errorResponse);

    await expect(
      actions.loginWithCredentials(
        { commit },
        { email: 'agente@abravely.com', password: 'user-secret-password' }
      )
    ).rejects.toThrow();

    expect(getAbravelyJwtToken()).toBeNull();
  });
});
