import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import Layout from '../components/Layout';
import { renderWithProviders } from './test-utils';
import { Route, Routes } from 'react-router-dom';

// Mock Header and Footer to isolate Layout testing
vi.mock('../components/Header.tsx', () => ({
  default: () => <div data-testid="mock-header">Header</div>,
}));

vi.mock('../components/Footer.tsx', () => ({
  default: () => <div data-testid="mock-footer">Footer</div>,
}));

describe('Layout', () => {
  it('renders Header and Footer', () => {
    renderWithProviders(
      <Routes>
        <Route element={<Layout />}>
          <Route path="*" element={<div>Child Content</div>} />
        </Route>
      </Routes>,
      { routerProps: { initialEntries: ['/'] } },
    );

    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
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

  it('applies dark theme classes on the container', () => {
    const { container } = renderWithProviders(
      <Routes>
        <Route element={<Layout />}>
          <Route path="*" element={<div>Content</div>} />
        </Route>
      </Routes>,
      { routerProps: { initialEntries: ['/'] } },
    );

    // ThemeProvider defaults to 'dark'
    const wrapper = container.querySelector('.flex.flex-col');
    expect(wrapper?.className).toContain('bg-gray-900');
  });
});
