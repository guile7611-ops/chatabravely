import {
  setAuthCredentials,
  throwErrorMessage,
  clearLocalStorageOnLogout,
  parseAPIErrorResponse,
} from 'dashboard/store/utils/api';
import { setAbravelyJwtToken } from 'dashboard/helper/abravelyToken';
import wootAPI from './apiClient';
import {
  getLoginRedirectURL,
  getCredentialsFromEmail,
} from '../helpers/AuthHelper';

export const login = async (
  { ssoAccountId, ssoConversationId, ...credentials },
  options = { redirect: true }
) => {
  try {
    const response = await wootAPI.post('api/v1/users/login', credentials);

    // Check if MFA is required
    if (response.status === 206 && response.data.mfa_required) {
      return {
        mfaRequired: true,
        mfaToken: response.data.mfa_token,
      };
    }

    const { token, user } = response.data || {};
    if (token) {
      setAbravelyJwtToken(token);
    }

    const formattedUser = {
      id: user?.id || 1,
      email: user?.email || credentials.email,
      name: user?.name || 'Agente Abravely',
      role: user?.role?.toLowerCase() || 'administrator',
      account_id: 1,
      accounts: [
        {
          id: 1,
          name: 'Abravely Workspace',
          role: user?.role?.toLowerCase() || 'administrator',
          status: 'active',
          availability: 'online',
        },
      ],
    };

    const redirectUrl = getLoginRedirectURL({
      ssoAccountId,
      ssoConversationId,
      user: formattedUser,
    });

    if (options && options.redirect === false) {
      return {
        success: true,
        response,
        user: formattedUser,
        redirectUrl,
      };
    }

    clearLocalStorageOnLogout();
    window.location = redirectUrl;
    return null;
  } catch (error) {
    // Check if it's an MFA required response
    if (error.response?.status === 206 && error.response?.data?.mfa_required) {
      return {
        mfaRequired: true,
        mfaToken: error.response.data.mfa_token,
      };
    }
    if (
      error.response?.status === 409 &&
      error.response?.data?.sessions_limit_reached
    ) {
      return {
        sessionsLimitReached: true,
        sessions: error.response.data.sessions,
      };
    }
    const loginError = new Error(parseAPIErrorResponse(error));
    loginError.errorCode = error.response?.data?.error_code;
    throw loginError;
  }
};

export const register = async creds => {
  try {
    const { fullName, accountName } = getCredentialsFromEmail(creds.email);
    const response = await wootAPI.post('api/v1/accounts.json', {
      account_name: accountName,
      user_full_name: fullName,
      email: creds.email,
      password: creds.password,
      h_captcha_client_response: creds.hCaptchaClientResponse,
    });
    return response.data;
  } catch (error) {
    throwErrorMessage(error);
  }
  return null;
};

export const resendConfirmation = async ({ email, hCaptchaClientResponse }) => {
  return wootAPI.post('resend_confirmation', {
    email,
    h_captcha_client_response: hCaptchaClientResponse,
  });
};

export const verifyPasswordToken = async ({ confirmationToken }) => {
  try {
    const response = await wootAPI.post('auth/confirmation', {
      confirmation_token: confirmationToken,
    });
    setAuthCredentials(response);
  } catch (error) {
    throwErrorMessage(error);
  }
};

export const setNewPassword = async ({
  resetPasswordToken,
  password,
  confirmPassword,
}) => {
  try {
    const response = await wootAPI.put('auth/password', {
      reset_password_token: resetPasswordToken,
      password_confirmation: confirmPassword,
      password,
    });
    setAuthCredentials(response);
  } catch (error) {
    throwErrorMessage(error);
  }
};

export const resetPassword = async ({ email }) =>
  wootAPI.post('auth/password', { email });
