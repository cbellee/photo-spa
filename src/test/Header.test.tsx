import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import Header from '../components/Header';
import { renderWithProviders } from './test-utils';

describe('Header', () => {
  it('renders null (navigation moved to Sidebar)', () => {
    const { container } = renderWithProviders(<Header />);
    // Header now returns null — its content moved to Sidebar
    expect(container.innerHTML).toBe('');
  });

  it('does not throw when rendered', () => {
    expect(() => renderWithProviders(<Header />)).not.toThrow();
  });
});
