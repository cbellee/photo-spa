import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAccessToken } from '../utils/utils';
import { AccountInfo } from '@azure/msal-browser';

describe('getAccessToken', () => {
  const mockAccount: AccountInfo = {
    homeAccountId: 'test',
    localAccountId: 'test',
    environment: 'test',
    tenantId: 'test',
    username: 'test@example.com',
  };

  const mockTokenRequest = {
    scopes: ['api://test/photo.all'],
  };

  it('calls acquireTokenSilent on the MSAL instance', () => {
    const mockInstance = {
      acquireTokenSilent: vi.fn().mockResolvedValue({
        accessToken: 'test-access-token',
      }),
    };
    const setToken = vi.fn();

    getAccessToken(mockInstance, [mockAccount], mockTokenRequest, setToken);

    expect(mockInstance.acquireTokenSilent).toHaveBeenCalledWith({
      ...mockTokenRequest,
    });
  });

  it('calls setToken with the access token on success', async () => {
    const mockInstance = {
      acquireTokenSilent: vi.fn().mockResolvedValue({
        accessToken: 'test-access-token',
      }),
    };
    const setToken = vi.fn();

    getAccessToken(mockInstance, [mockAccount], mockTokenRequest, setToken);

    // Wait for the promise
    await vi.waitFor(() => {
      expect(setToken).toHaveBeenCalledWith('test-access-token');
    });
  });

  it('logs error to console on failure (KNOWN BUG: no fallback to interactive)', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const mockInstance = {
      acquireTokenSilent: vi.fn().mockRejectedValue(new Error('Token expired')),
    };
    const setToken = vi.fn();

    getAccessToken(mockInstance, [mockAccount], mockTokenRequest, setToken);

    await vi.waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('error while getting access token'),
      );
    });

    // setToken should NOT have been called
    expect(setToken).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('KNOWN BUG: instance parameter is typed as any', () => {
    // The function accepts `instance: any` instead of IPublicClientApplication.
    // This test documents the lack of type safety.
    const notAnInstance = { acquireTokenSilent: vi.fn().mockResolvedValue({ accessToken: 'x' }) };
    const setToken = vi.fn();
    expect(() =>
      getAccessToken(notAnInstance, [mockAccount], mockTokenRequest, setToken),
    ).not.toThrow();
  });
});
