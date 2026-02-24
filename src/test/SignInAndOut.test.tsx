import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import SignInAndOut from '../components/SignInAndOut';
import { renderWithProviders, createMockPca, mockAccount } from './test-utils';

// Mock @azure/msal-react hooks to control authentication state directly
const mockUseMsal = vi.fn();
const mockUseIsAuthenticated = vi.fn();

vi.mock('@azure/msal-react', async () => {
  const actual = await vi.importActual<typeof import('@azure/msal-react')>('@azure/msal-react');
  return {
    ...actual,
    useMsal: () => mockUseMsal(),
    useIsAuthenticated: () => mockUseIsAuthenticated(),
  };
});

describe('SignInAndOut', () => {
  const mockInstance = {
    loginPopup: vi.fn().mockResolvedValue({ accessToken: 'token', account: mockAccount }),
    logoutPopup: vi.fn().mockResolvedValue(undefined),
    handleRedirectPromise: vi.fn().mockResolvedValue(null),
    setActiveAccount: vi.fn(),
    getActiveAccount: vi.fn(() => mockAccount),
    acquireTokenSilent: vi.fn().mockResolvedValue({ accessToken: 'token' }),
    acquireTokenPopup: vi.fn().mockResolvedValue({ accessToken: 'token' }),
  };

  beforeEach(() => {
    mockInstance.loginPopup.mockClear();
    mockInstance.logoutPopup.mockClear();
    mockInstance.handleRedirectPromise.mockClear();
    mockInstance.setActiveAccount.mockClear();
    mockInstance.acquireTokenSilent.mockClear();
  });

  function setupUnauthenticated() {
    mockUseIsAuthenticated.mockReturnValue(false);
    mockUseMsal.mockReturnValue({
      instance: mockInstance,
      accounts: [],
      inProgress: 'none',
    });
  }

  function setupAuthenticated() {
    mockUseIsAuthenticated.mockReturnValue(true);
    mockUseMsal.mockReturnValue({
      instance: mockInstance,
      accounts: [mockAccount],
      inProgress: 'none',
    });
  }

  it('renders Sign In button when unauthenticated', () => {
    setupUnauthenticated();
    renderWithProviders(<SignInAndOut />);
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('does not render Sign Out when unauthenticated', () => {
    setupUnauthenticated();
    renderWithProviders(<SignInAndOut />);
    expect(screen.queryByText('Sign Out')).not.toBeInTheDocument();
  });

  it('renders Sign Out button when authenticated', () => {
    setupAuthenticated();
    renderWithProviders(<SignInAndOut />);
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('does not render Sign In when authenticated', () => {
    setupAuthenticated();
    renderWithProviders(<SignInAndOut />);
    expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
  });

  it('calls loginPopup when Sign In is clicked', async () => {
    setupUnauthenticated();
    renderWithProviders(<SignInAndOut />);

    fireEvent.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(mockInstance.loginPopup).toHaveBeenCalled();
    });
  });

  it('calls logoutPopup when Sign Out is clicked', async () => {
    setupAuthenticated();
    renderWithProviders(<SignInAndOut />);

    fireEvent.click(screen.getByText('Sign Out'));

    await waitFor(() => {
      expect(mockInstance.logoutPopup).toHaveBeenCalled();
    });
  });

  it('KNOWN BUG: acquires token but never uses it', () => {
    setupUnauthenticated();
    expect(() => renderWithProviders(<SignInAndOut />)).not.toThrow();
  });
});
