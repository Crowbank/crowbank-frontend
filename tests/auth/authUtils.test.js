import { checkLogoutParam, getToken } from '../../auth/authUtils.js';

describe('authUtils', () => {
  test('checkLogoutParam removes token when logout is true', () => {
    // Mock the necessary objects and functions
    global.localStorage = {
      removeItem: jest.fn(),
      getItem: jest.fn(),
    };
    global.sessionStorage = {
      removeItem: jest.fn(),
      getItem: jest.fn(),
    };
    global.URLSearchParams = jest.fn(() => ({
      get: jest.fn(() => 'true'),
      delete: jest.fn(),
      toString: jest.fn(),
    }));
    global.history = { replaceState: jest.fn() };

    checkLogoutParam();

    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(sessionStorage.removeItem).toHaveBeenCalledWith('token');
  });

  test('getToken retrieves token from URL params', () => {
    global.URLSearchParams = jest.fn(() => ({
      get: jest.fn(() => 'testToken'),
    }));
    global.localStorage = {
      setItem: jest.fn(),
      getItem: jest.fn(),
    };
    global.sessionStorage = {
      setItem: jest.fn(),
      getItem: jest.fn(),
    };

    const token = getToken();

    expect(token).toBe('testToken');
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'testToken');
    expect(sessionStorage.setItem).toHaveBeenCalledWith('token', 'testToken');
  });
});