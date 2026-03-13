import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import Header from '../components/Header';
import { renderWithProviders, mockAccount } from './test-utils';
import type { AccountInfo } from '@azure/msal-browser';

// Mock @azure/msal-react hooks to control authentication state directly
const mockUseMsal = vi.fn();
const mockUseIsAuthenticated = vi.fn();
const mockUseAccount = vi.fn();

vi.mock('@azure/msal-react', async () => {
  const actual = await vi.importActual<typeof import('@azure/msal-react')>('@azure/msal-react');
  return {
    ...actual,
    useMsal: () => mockUseMsal(),
    useIsAuthenticated: () => mockUseIsAuthenticated(),
    useAccount: () => mockUseAccount(),
  };
});

// Mock SignInAndOut to simplify Header tests
vi.mock('../components/SignInAndOut.tsx', () => ({
  default: () => <span data-testid="sign-in-out">SignInAndOut</span>,
}));

describe('Header', () => {
  const mockInstance = {
    loginPopup: vi.fn(),
    logoutPopup: vi.fn(),
    handleRedirectPromise: vi.fn().mockResolvedValue(null),
    setActiveAccount: vi.fn(),
    getActiveAccount: vi.fn((): AccountInfo | null => null),
    acquireTokenSilent: vi.fn(),
  };

  function setupUnauthenticated() {
    mockUseIsAuthenticated.mockReturnValue(false);
    mockUseAccount.mockReturnValue(null);
    mockUseMsal.mockReturnValue({
      instance: mockInstance,
      accounts: [],
      inProgress: 'none',
    });
    mockInstance.getActiveAccount.mockReturnValue(null);
  }

  function setupAuthenticated() {
    mockUseIsAuthenticated.mockReturnValue(true);
    mockUseAccount.mockReturnValue(mockAccount);
    mockUseMsal.mockReturnValue({
      instance: mockInstance,
      accounts: [mockAccount],
      inProgress: 'none',
    });
    mockInstance.getActiveAccount.mockReturnValue(mockAccount);
  }

  beforeEach(() => {
    setupUnauthenticated();
  });

  it('renders Collections nav link', () => {
    renderWithProviders(<Header />);
    const links = screen.getAllByText('Collections');
    expect(links.length).toBeGreaterThan(0);
  });

  it('does not show Upload link when unauthenticated', () => {
    renderWithProviders(<Header />);
    const uploadLinks = screen.queryAllByText('Upload');
    expect(uploadLinks.length).toBe(0);
  });

  it('shows Upload link when authenticated', () => {
    setupAuthenticated();
    renderWithProviders(<Header />);
    const uploadLinks = screen.queryAllByText('Upload');
    expect(uploadLinks.length).toBeGreaterThan(0);
  });

  it('renders the logo image', () => {
    renderWithProviders(<Header />);
    const logo = screen.getByAltText('logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/app-icon.png');
  });

  it('renders the hamburger menu icon (3 spans)', () => {
    const { container } = renderWithProviders(<Header />);
    const hamburger = container.querySelector('.HAMBURGER-ICON');
    expect(hamburger).toBeInTheDocument();
    const spans = hamburger?.querySelectorAll('span');
    expect(spans?.length).toBe(3);
  });

  it('toggles mobile menu when hamburger is clicked', () => {
    const { container } = renderWithProviders(<Header />);
    const hamburger = container.querySelector('.HAMBURGER-ICON') as HTMLElement;

    // Initially hidden
    expect(container.querySelector('.showMenuNav')).not.toBeInTheDocument();

    // Click to open
    fireEvent.click(hamburger);
    expect(container.querySelector('.showMenuNav')).toBeInTheDocument();

    // Click to close
    fireEvent.click(hamburger);
    expect(container.querySelector('.showMenuNav')).not.toBeInTheDocument();
  });

  it('shows welcome message with user name when authenticated', () => {
    setupAuthenticated();
    renderWithProviders(<Header />);
    // The component shows account?.name?.split(" ")[0] which is "Test" from "Test User"
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('renders theme toggle button', () => {
    const { container } = renderWithProviders(<Header />);
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('FIXED: removed dead userName state (was never set)', () => {
    // userName state was removed in Phase 3 — Header now uses NavLinks + MobileMenu sub-components
    expect(() => renderWithProviders(<Header />)).not.toThrow();
  });
});
