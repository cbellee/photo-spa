import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter, MemoryRouterProps } from 'react-router-dom';
import { ThemeProvider } from '../context/ThemeContext';
import { MsalProvider } from '@azure/msal-react';
import type { CollectionPhoto, Photo, TagsResponse } from '../types';
import {
  PublicClientApplication,
  Configuration,
  AccountInfo,
  IPublicClientApplication,
  EventCallbackFunction,
  EventType,
  InteractionStatus,
} from '@azure/msal-browser';

// ── Minimal MSAL mock config ──────────────────────────────────────────────────
const testMsalConfig: Configuration = {
  auth: {
    clientId: 'test-client-id',
    authority: 'https://login.microsoftonline.com/test-tenant-id',
    redirectUri: '/',
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

// ── Mock account ──────────────────────────────────────────────────────────────
export const mockAccount: AccountInfo = {
  homeAccountId: 'test-home-account-id',
  localAccountId: 'test-local-account-id',
  environment: 'login.microsoftonline.com',
  tenantId: 'test-tenant-id',
  username: 'testuser@example.com',
  name: 'Test User',
};

// ── Create a mock PCA instance ────────────────────────────────────────────────
export function createMockPca(options?: {
  isAuthenticated?: boolean;
}): IPublicClientApplication {
  const isAuth = options?.isAuthenticated ?? false;

  const pca = new PublicClientApplication(testMsalConfig);

  // Override methods that tests rely on
  pca.getAllAccounts = vi.fn(() => (isAuth ? [mockAccount] : []));
  pca.getActiveAccount = vi.fn(() => (isAuth ? mockAccount : null));
  pca.setActiveAccount = vi.fn();
  pca.acquireTokenSilent = vi.fn().mockResolvedValue({
    accessToken: 'mock-access-token',
    account: mockAccount,
  });
  pca.loginPopup = vi.fn().mockResolvedValue({
    accessToken: 'mock-access-token',
    account: mockAccount,
  });
  pca.logoutPopup = vi.fn().mockResolvedValue(undefined);
  pca.handleRedirectPromise = vi.fn().mockResolvedValue(null);
  pca.addEventCallback = vi.fn().mockReturnValue('callback-id');
  pca.removeEventCallback = vi.fn();
  pca.initialize = vi.fn().mockResolvedValue(undefined);
  pca.enableAccountStorageEvents = vi.fn();
  pca.disableAccountStorageEvents = vi.fn();

  // Override the internal getLogger to prevent initialization errors
  (pca as any).getLogger = vi.fn().mockReturnValue({
    clone: vi.fn().mockReturnThis(),
    error: vi.fn(),
    errorPii: vi.fn(),
    warning: vi.fn(),
    warningPii: vi.fn(),
    info: vi.fn(),
    infoPii: vi.fn(),
    verbose: vi.fn(),
    verbosePii: vi.fn(),
    trace: vi.fn(),
    tracePii: vi.fn(),
    isPiiLoggingEnabled: vi.fn().mockReturnValue(false),
  });

  return pca;
}

// ── Custom render with all required providers ─────────────────────────────────
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Initial router entries, e.g. ['/trips/coral-bay'] */
  routerProps?: MemoryRouterProps;
  /** Whether to render as an authenticated user */
  isAuthenticated?: boolean;
  /** Supply your own PCA instance (overrides isAuthenticated) */
  msalInstance?: IPublicClientApplication;
}

export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {},
) {
  const {
    routerProps = {},
    isAuthenticated = false,
    msalInstance,
    ...renderOptions
  } = options;

  const pca = msalInstance ?? createMockPca({ isAuthenticated });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MsalProvider instance={pca}>
        <ThemeProvider>
          <MemoryRouter {...routerProps}>{children}</MemoryRouter>
        </ThemeProvider>
      </MsalProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    pca,
  };
}

// ── Mock photo data factories ─────────────────────────────────────────────────
export function createMockPhoto(overrides: Partial<Photo> = {}): Photo {
  return {
    name: 'photo-1.jpg',
    id: '1',
    url: 'https://example.com/photo-1.jpg',
    src: 'https://example.com/photo-1-thumb.jpg',
    width: 800,
    height: 600,
    collection: 'trips',
    album: 'coral-bay',
    description: 'A photo of Coral Bay',
    albumImage: false,
    collectionImage: false,
    exifData: undefined,
    isDeleted: false,
    orientation: 0,
    ...overrides,
  };
}

export function createMockCollectionPhoto(overrides: Partial<CollectionPhoto> = {}): CollectionPhoto {
  return {
    id: '1',
    url: 'https://example.com/collection-1.jpg',
    src: 'https://example.com/collection-1-thumb.jpg',
    width: 800,
    height: 600,
    collection: 'trips',
    album: '',
    ...overrides,
  };
}

export const mockTagsResponse: TagsResponse = {
  trips: ['coral-bay', 'hong-kong', 'karijini'],
  sport: ['parasailing', 'skydiving'],
  vintage: ['nature'],
};
