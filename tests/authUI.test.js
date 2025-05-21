import { showLoginForm, showRegistrationForm } from '../auth/authUI.js';

describe('authUI', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="content-container"></div>';
    jest.clearAllMocks();
  });

  test('showLoginForm renders the login form', () => {
    showLoginForm();
    expect(document.getElementById('content-container').innerHTML).toContain('Login');
  });

  test('showRegistrationForm renders the registration options', () => {
    showRegistrationForm();
    expect(document.getElementById('content-container').innerHTML).toContain('Register');
  });

  // Additional tests for other UI functions can be added here
});
