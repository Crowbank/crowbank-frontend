import { jest, describe, beforeEach, test, expect } from '@jest/globals';
import { checkLogoutParam, getToken } from '../auth/authUtils.js';
import { loadLoginForm, handleEmailVerification } from '../auth/authUI.js';
import { loadBookingsScreen } from '../booking/bookingUI.js';
import { bindMenuActions } from '../utils/uiUtils.js';
import page from 'page';

// Mock the imported functions
jest.mock('../auth/authUtils.js');
jest.mock('../auth/authUI.js');
jest.mock('../booking/bookingUI.js');
jest.mock('../utils/uiUtils.js');
jest.mock('./mocks/jquery.js');
jest.mock('page', () => {
  const mockPage = jest.fn();
  mockPage.base = jest.fn();
  mockPage.redirect = jest.fn();
  mockPage.start = jest.fn();
  // Add other methods used in main.js
  return mockPage;
});
const $ = jest.fn(() => ({
  ready: jest.fn(callback => callback()),
  on: jest.fn(), // Add this line
}));
$.ready = jest.fn(callback => callback());

describe('main', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Update the jQuery mock
    global.$ = $;
    $.ready = jest.fn(callback => callback());
    $.fn = { on: jest.fn() }; // Add this line

    // Mock URLSearchParams
    global.URLSearchParams = jest.fn(() => ({
      get: jest.fn(),
    }));
  });

  test('initializes correctly without token', () => {
    getToken.mockReturnValue(null);

    require('../main.js');

    expect(page.base).toHaveBeenCalledWith('/frontend');
    expect(page).toHaveBeenCalledWith('*', expect.any(Function));
    expect(page).toHaveBeenCalledWith('/', expect.any(Function), expect.any(Function));
    // Add expectations for other route setups
    expect(page).toHaveBeenCalledWith(); // This checks if page() was called to start the router
    expect(checkLogoutParam).toHaveBeenCalled();
    expect(getToken).toHaveBeenCalled();
    // Note: loadLoginForm might not be called directly, depending on how routeBasedOnUserState is implemented
    expect(bindMenuActions).toHaveBeenCalled();
  });

  test('initializes correctly with token', () => {
    getToken.mockReturnValue('validToken');

    require('../main.js');

    expect(checkLogoutParam).toHaveBeenCalled();
    expect(getToken).toHaveBeenCalled();
    expect(loadBookingsScreen).toHaveBeenCalled();
    expect(bindMenuActions).toHaveBeenCalled();
  });

  test('handles email verification', () => {
    // Mock URLSearchParams to return 'verificationToken' for 'verify' parameter
    global.URLSearchParams = jest.fn(() => ({
      get: jest.fn(param => param === 'verify' ? 'verificationToken' : null),
    }));

    // Mock window.location
    const originalLocation = window.location;
    delete window.location;
    window.location = { ...originalLocation, search: '?verify=verificationToken' };

    // Clear the module cache to ensure a fresh import
    jest.resetModules();

    // Import the main.js module
    const main = require('../main.js');

    // Call initializeRoutes
    main.initializeRoutes();

    // Check if the '/verify-email' route was defined
    expect(page.routes['/verify-email']).toBeTruthy();

    // If the route exists, call its handler
    if (page.routes['/verify-email']) {
      const ctx = { params: {}, query: { verify: 'verificationToken' } };
      const next = jest.fn();
      page.routes['/verify-email'].forEach(handler => handler(ctx, next));

      // Check if handleEmailVerification was called with the correct token
      expect(handleEmailVerification).toHaveBeenCalledWith('verificationToken');
    }

    // Restore window.location
    window.location = originalLocation;
  });
});
