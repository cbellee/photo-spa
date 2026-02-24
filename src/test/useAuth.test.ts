import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

// Mock MSAL hooks before importing useAuth
const mockUseMsal = vi.fn();
const mockUseIsAuthenticated = vi.fn();
const mockUseAccount = vi.fn();

vi.mock('@azure/msal-react', () => ({
  useMsal: () => mockUseMsal(),
  useIsAuthenticated: () => mockUseIsAuthenticated(),
  useAccount: () => mockUseAccount(),
}));

vi.mock('../config/msalConfig', () => ({
  tokenRequest: { scopes: ['test-scope'] },
}));

import { useAuth } from '../hooks/useAuth';

describe('useAuth', () => {
  const mockInstance = {
    acquireTokenSilent: vi.fn(),
    getActiveAccount: vi.fn(() => null),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMsal.mockReturnValue({
      instance: mockInstance,
      accounts: [],
      inProgress: 'none',
    });
    mockUseIsAuthenticated.mockReturnValue(false);
    mockUseAccount.mockReturnValue(null);
  });

  it('returns isAuthenticated=false when not logged in', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.token).toBeNull();
  });

  it('acquires token when authenticated', async () => {
    mockUseIsAuthenticated.mockReturnValue(true);
    mockInstance.acquireTokenSilent.mockResolvedValue({ accessToken: 'test-token' });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.token).toBe('test-token');
    });
    expect(mockInstance.acquireTokenSilent).toHaveBeenCalled();
  });

  it('handles token acquisition error', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    mockUseIsAuthenticated.mockReturnValue(true);
    mockInstance.acquireTokenSilent.mockRejectedValue(new Error('Token error'));

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('error'));
    });
    expect(result.current.token).toBeNull();
    consoleSpy.mockRestore();
  });

  it('returns instance and accounts from useMsal', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.instance).toBe(mockInstance);
    expect(result.current.accounts).toEqual([]);
    expect(result.current.inProgress).toBe('none');
  });

  it('does not acquire token when not authenticated', () => {
    renderHook(() => useAuth());
    expect(mockInstance.acquireTokenSilent).not.toHaveBeenCalled();
  });
});
