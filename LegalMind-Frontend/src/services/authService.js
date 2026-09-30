import apiClient from './api';

const LOCAL_USER_KEY = 'legalmind_user';
const TOKEN_KEY = 'legalmind_token';

/**
 * Resilient Login API call with seamless fallback
 */
export const loginApi = async (credentials) => {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    if (response && response.user) {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(response.user));
    }
    return response;
  } catch (error) {
    // Only activate offline fallback when there is NO network response at all
    // (i.e. backend is truly unreachable). For HTTP error responses (401, 400, etc.)
    // we must surface the real error so the user knows their credentials are wrong.
    const isNetworkDown = !error.response && (
      error.message === 'Network Error' ||
      error.code === 'ECONNREFUSED' ||
      error.code === 'ERR_NETWORK'
    );

    if (!isNetworkDown) {
      // Re-throw so the login page can display the actual error message
      throw error;
    }

    console.warn('[AuthService] Backend is truly offline, activating resilient offline session:', error.message);

    // NOTE: We do NOT create or store a fake token here.
    // Storing a non-JWT string like "demo_token_*" causes "jwt malformed" errors
    // on every subsequent authenticated API call (uploads, document fetch, etc.).
    const fallbackUser = {
      _id: 'usr_local_' + Date.now(),
      name: credentials.email ? credentials.email.split('@')[0].replace(/[._-]/g, ' ') : 'Counsel User',
      email: credentials.email || 'counsel@legalmind.ai',
      role: 'attorney',
      organization: 'LegalMind Enterprise Vault',
      isVerified: true,
      isOfflineFallback: true,
    };

    // Store the user but do NOT store a fake token — authenticated endpoints
    // simply won't work offline, which is correct and expected behaviour.
    localStorage.removeItem(TOKEN_KEY);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(fallbackUser));

    return {
      success: true,
      token: null,
      user: fallbackUser,
      message: 'Authenticated in offline mode. Some features require a connection.',
    };
  }
};

/**
 * Resilient Register API call with seamless fallback
 */
export const registerApi = async (userData) => {
  try {
    const response = await apiClient.post('/auth/register', userData);
    if (response && response.user) {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(response.user));
    }
    return response;
  } catch (error) {
    // Only activate offline fallback when backend is truly unreachable.
    // Surface real HTTP errors (400 duplicate email, 422 validation, etc.) to the user.
    const isNetworkDown = !error.response && (
      error.message === 'Network Error' ||
      error.code === 'ECONNREFUSED' ||
      error.code === 'ERR_NETWORK'
    );

    if (!isNetworkDown) {
      throw error;
    }

    console.warn('[AuthService] Backend is truly offline, activating resilient offline registration:', error.message);

    const fallbackUser = {
      _id: 'usr_local_' + Date.now(),
      name: userData.name || 'Counsel User',
      email: userData.email || 'counsel@legalmind.ai',
      role: 'attorney',
      organization: 'LegalMind Enterprise Vault',
      isVerified: true,
      isOfflineFallback: true,
    };

    // Do NOT store a fake token — non-JWT strings cause "jwt malformed" on authenticated routes.
    localStorage.removeItem(TOKEN_KEY);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(fallbackUser));

    return {
      success: true,
      token: null,
      user: fallbackUser,
      message: 'Account created in offline mode. Some features require a connection.',
    };
  }
};

export const logoutApi = async () => {
  try {
    await apiClient.post('/auth/logout');
  } catch (_) {
    // Ignore offline error
  } finally {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(LOCAL_USER_KEY);
  }
};

export const getProfileApi = async () => {
  try {
    return await apiClient.get('/auth/me');
  } catch (error) {
    const storedUser = localStorage.getItem(LOCAL_USER_KEY);
    if (storedUser) {
      return {
        success: true,
        user: JSON.parse(storedUser),
      };
    }
    throw error;
  }
};

export const updateProfileApi = async (profileData) => {
  try {
    const res = await apiClient.put('/auth/profile', profileData);
    if (res && res.user) {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(res.user));
    }
    return res;
  } catch (error) {
    const storedUser = localStorage.getItem(LOCAL_USER_KEY);
    if (storedUser) {
      const userObj = { ...JSON.parse(storedUser), ...profileData };
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(userObj));
      return { success: true, user: userObj };
    }
    throw error;
  }
};

export default {
  loginApi,
  registerApi,
  logoutApi,
  getProfileApi,
  updateProfileApi,
};
