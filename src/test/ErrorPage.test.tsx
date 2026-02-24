import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import ErrorPage from '../components/ErrorPage';
import { renderWithProviders } from './test-utils';

// ErrorPage uses useRouteError(), which only works inside a router error boundary.
// We mock it for unit testing.
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>(
    'react-router-dom',
  );
  return {
    ...actual,
    useRouteError: vi.fn(() => ({
      statusText: 'Not Found',
      message: 'Page not found',
    })),
  };
});

describe('ErrorPage', () => {
  it('renders the "Oops!" heading', () => {
    renderWithProviders(<ErrorPage />);
    expect(screen.getByText('Oops!')).toBeInTheDocument();
  });

  it('renders the generic error message', () => {
    renderWithProviders(<ErrorPage />);
    expect(
      screen.getByText('Sorry, an unexpected error has occurred.'),
    ).toBeInTheDocument();
  });

  it('renders the statusText from the route error', () => {
    renderWithProviders(<ErrorPage />);
    expect(screen.getByText('Not Found')).toBeInTheDocument();
  });

  it('has id="error-page" on the container', () => {
    const { container } = renderWithProviders(<ErrorPage />);
    expect(container.querySelector('#error-page')).toBeInTheDocument();
  });
});
