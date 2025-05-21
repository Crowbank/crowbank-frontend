import { loginUser, registerUser, requestPasswordReset } from '../auth/authAPI.js';
import { config } from '../config.js';

jest.mock('jquery', () => ({
  ajax: jest.fn(),
}));

describe('authAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('loginUser makes an AJAX request to login', async () => {
    const mockResponse = { token: 'mockToken', status: 'success' };
    $.ajax.mockResolvedValue(mockResponse);

    const response = await loginUser('test@example.com', 'password', true);
    expect($.ajax).toHaveBeenCalledWith(expect.objectContaining({
      url: `${config.backend_url}/login`,
      type: 'POST',
      data: JSON.stringify({ email: 'test@example.com', password: 'password', rememberMe: true }),
    }));
    expect(response).toEqual(mockResponse);
  });

  // Additional tests for registerUser and requestPasswordReset can be added here
});
