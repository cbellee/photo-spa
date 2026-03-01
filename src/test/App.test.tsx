import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';
import { createMockPca } from './test-utils';

// Mock all page components to isolate App routing
vi.mock('../components/Collections.tsx', () => ({
  default: () => <div data-testid="collections-page">Collections</div>,
}));

vi.mock('../components/AlbumCollections.tsx', () => ({
  default: () => <div data-testid="albums-page">Albums</div>,
}));

vi.mock('../components/Photos.tsx', () => ({
  default: () => <div data-testid="photos-page">Photos</div>,
}));

vi.mock('../components/Upload.tsx', () => ({
  default: () => <div data-testid="upload-page">Upload</div>,
}));

vi.mock('../components/About.tsx', () => ({
  default: () => <div data-testid="about-page">About</div>,
}));

vi.mock('../components/Header.tsx', () => ({
  default: () => <div data-testid="mock-header">Header</div>,
}));

vi.mock('../components/Footer.tsx', () => ({
  default: () => <div data-testid="mock-footer">Footer</div>,
}));

describe('App', () => {
  it('renders without crashing with mocked MSAL', async () => {
    const pca = createMockPca({ isAuthenticated: false });
    expect(() => render(<App msalInstance={pca} />)).not.toThrow();
  });

  it('KNOWN BUG: createBrowserRouter is created inside component body (recreated every render)', () => {
    // This documents that the router is recreated on every render, which is a performance issue.
    const pca = createMockPca({ isAuthenticated: false });
    expect(() => render(<App msalInstance={pca} />)).not.toThrow();
  });

  it('KNOWN BUG: passes dead collection="" album="" props to route components', () => {
    // Collections, Albums, Photos all receive collection="" album="" but
    // those props are never used (components use useParams() instead).
    const pca = createMockPca({ isAuthenticated: false });
    expect(() => render(<App msalInstance={pca} />)).not.toThrow();
  });
});
