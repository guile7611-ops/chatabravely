import { frontendURL } from 'dashboard/helper/URLHelper';
import { clearBrowserSessionCookies } from 'dashboard/store/utils/api';

const validateSSOLoginParams = to => {
  const isLoginRoute = to.name === 'login';
  const { email, sso_auth_token: ssoAuthToken } = to.query || {};
  const hasValidSSOParams = email && ssoAuthToken;
  return isLoginRoute && hasValidSSOParams;
};

export const validateRouteAccess = (to, next, chatwootConfig = {}) => {
  // Pages with ignoreSession:true would be rendered
  // even if there is an active session
  // Used for confirmation or password reset pages
  if (to.meta && to.meta.ignoreSession) {
    next();
    return;
  }

  if (validateSSOLoginParams(to)) {
    clearBrowserSessionCookies();
    next();
    return;
  }

  // If the URL is an invalid path, redirect to login page
  // Disable navigation to signup page if signups are disabled
  // Signup route has an attribute (requireSignupEnabled) in it's definition
  const isAnInalidSignupNavigation =
    chatwootConfig.signupEnabled !== 'true' &&
    to.meta &&
    to.meta.requireSignupEnabled;

  // Disable navigation to SAML login if enterprise is not enabled
  // SAML route has an attribute (requireEnterprise) in it's definition
  const isEnterpriseOnlyPath =
    chatwootConfig.isEnterprise !== 'true' &&
    to.meta &&
    to.meta.requireEnterprise;

  if (!to.name || isAnInalidSignupNavigation || isEnterpriseOnlyPath) {
    next(frontendURL('login'));
    return;
  }

  next();
};

export const isOnOnboardingView = route => {
  const { name = '' } = route || {};

  if (!name) {
    return false;
  }

  return name.includes('onboarding_');
};
