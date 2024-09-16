import { loginUser, registerUser, requestPasswordReset } from '../../auth/authAPI.js';

// Mock jQuery's ajax function
global.$ = {
  ajax: jest.fn(() => Promise.resolve({ status: 'success' })),
  post: jest.fn(() => Promise.resolve({ status: 'success' })),
};

describe('authAPI', () => {
  test('loginUser sends correct request', async () => {
    const credentials = { email: 'test@example.com', password: 'password' };
    await loginUser(credentials);

    expect($.ajax).toHaveBeenCalledWith({
      url: 'http://localhost:5000/api/login',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(credentials),
    });
  });

  test('registerUser sends correct request', async () => {
    const email = 'test@example.com';
    const password = 'password';
    await registerUser(email, password);

    expect($.ajax).toHaveBeenCalledWith({
      url: 'http://localhost:5000/api/register',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ email, password }),
    });
  });

  test('requestPasswordReset sends correct request', async () => {
    const email = 'test@example.com';
    await requestPasswordReset(email);

    expect($.ajax).toHaveBeenCalledWith({
      url: 'http://localhost:5000/api/forgot-password',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ email }),
    });
  });
});