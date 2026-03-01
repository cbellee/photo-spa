import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import About from '../components/About';
import { renderWithProviders } from './test-utils';

describe('About', () => {
  it('renders the description text', () => {
    renderWithProviders(<About />);
    expect(
      screen.getByText(/sample photo gallery application/i),
    ).toBeInTheDocument();
  });

  it('mentions React, TypeScript, Tailwind CSS, and Azure', () => {
    renderWithProviders(<About />);
    const text = screen.getByText(/sample photo gallery/i).textContent ?? '';
    expect(text).toContain('React');
    expect(text).toContain('TypeScript');
    expect(text).toContain('Tailwind CSS');
    expect(text).toContain('Azure Blob Storage');
  });

  it('applies dark theme text color by default', () => {
    renderWithProviders(<About />);
    const el = screen.getByText(/sample photo gallery/i).closest('div');
    expect(el?.className).toContain('text-gray-100');
  });
});
