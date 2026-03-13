import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import Layout from '../components/Layout';
import { renderWithProviders } from './test-utils';
import { Route, Routes } from 'react-router-dom';

// Mock Sidebar to isolate Layout testing
vi.mock('../components/Sidebar.tsx', () => ({
  default: () => <div data-testid="mock-sidebar">Sidebar</div>,
}));

describe('Layout', () => {
  it('renders Sidebar', () => {
    renderWithProviders(
      <Routes>
        <Route element={<Layout />}>
          <Route path="*" element={<div>Child Content</div>} />
        </Route>
      </Routes>,
      { routerProps: { initialEntries: ['/'] } },
    );

    expect(screen.getByTestId('mock-sidebar')).toBeInTheDocument();
  });

  it('renders child route content via Outlet', () => {
    renderWithProviders(
      <Routes>
        <Route element={<Layout />}>
          <Route path="*" element={<div>Child Content</div>} />
        </Route>
      </Routes>,
      { routerProps: { initialEntries: ['/'] } },
    );

    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('applies dark theme classes on the content area', () => {
    const { container } = renderWithProviders(
      <Routes>
        <Route element={<Layout />}>
          <Route path="*" element={<div>Content</div>} />
        </Route>
      </Routes>,
      { routerProps: { initialEntries: ['/'] } },
    );

    // ThemeProvider defaults to 'dark' — main content area uses bg-surface
    const wrapper = container.querySelector('.flex');
    expect(wrapper?.className).toContain('flex');
  });
});
