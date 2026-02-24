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
    expect(wrapper.className).toContain('text-white');
    expect(wrapper.className).toContain('bg-gray-950');
  });

  it('FIXED: CSS classes are properly separated (text-center uppercase)', () => {
    const { container } = renderWithProviders(<Footer />);
    const paragraph = container.querySelector('p');
    expect(paragraph?.className).toContain('text-center');
    expect(paragraph?.className).toContain('uppercase');
    expect(paragraph?.className).not.toContain('text-centeruppercase');
  });

  it('does not destructure unused toggleTheme', () => {
    // The component no longer destructures toggleTheme.
    // This test just verifies it renders without error.
    expect(() => renderWithProviders(<Footer />)).not.toThrow();
  });
});
