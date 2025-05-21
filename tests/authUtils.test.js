import { checkLogoutParam, getToken, setToken, removeToken, isAuthenticated } from '../auth/authUtils.js';

describe('authUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  test('checkLogoutParam removes token if logout param is true', () => {
    window.history.pushState({}, 'Test Title', '?logout=true');
    checkLogoutParam();
    expect(localStorage.getItem('token')).toBeNull();
    expect(sessionStorage.getItem('token')).toBeNull();
  });

  test('getToken retrieves token from localStorage or sessionStorage', () => {
    setToken('testToken', true);
    expect(getToken()).toBe('testToken');
    removeToken();
    expect(getToken()).toBeNull();
  });

  test('isAuthenticated returns false for invalid token', () => {
    expect(isAuthenticated()).toBe(false);
  });

  // Additional tests for valid token scenarios can be added here
});
