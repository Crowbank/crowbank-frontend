import { checkLogoutParam, getToken } from '../auth/authUtils.js';
import { loadLoginForm, handleEmailVerification } from '../auth/authUI.js';
import { loadBookingsScreen } from '../booking/bookingUI.js';
import { bindMenuActions } from '../utils/uiUtils.js';

// Mock the imported functions
jest.mock('../auth/authUtils.js');
jest.mock('../auth/authUI.js');
jest.mock('../booking/bookingUI.js');
jest.mock('../utils/uiUtils.js');

describe('main', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock jQuery's ready function
    global.$ = {
      ready: jest.fn(callback => callback()),
    };

    // Mock URLSearchParams
    global.URLSearchParams = jest.fn(() => ({
      get: jest.fn(),
    }));
  });

  test('initializes correctly without token', () => {
    getToken.mockReturnValue(null);

    require('../main.js');

    expect(checkLogoutParam).toHaveBeenCalled();
    expect(getToken).toHaveBeenCalled();
    expect(loadLoginForm).toHaveBeenCalled();
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
    global.URLSearchParams = jest.fn(() => ({
      get: jest.fn(param => param === 'verify' ? 'verificationToken' : null),
    }));

    require('../main.js');

    expect(handleEmailVerification).toHaveBeenCalledWith('verificationToken');
  });
});