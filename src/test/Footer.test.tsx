import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import Footer from '../components/Footer';
import { renderWithProviders } from './test-utils';

describe('Footer', () => {
  it('renders the current year', () => {
    renderWithProviders(<Footer />);
    const currentYear = new Date().getUTCFullYear();
    expect(screen.getByText(new RegExp(`${currentYear}`))).toBeInTheDocument();
  });

  it('renders "Photo Album" text', () => {
    renderWithProviders(<Footer />);
    expect(screen.getByText(/Photo Album/)).toBeInTheDocument();
  });

  it('applies dark theme classes', () => {
    // ThemeProvider defaults to "dark" when localStorage is empty
    const { container } = renderWithProviders(<Footer />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.className).toContain('text-gray-600');
  });

  it('does not throw when rendered', () => {
    expect(() => renderWithProviders(<Footer />)).not.toThrow();
  });
});
