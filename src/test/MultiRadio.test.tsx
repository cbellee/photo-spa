import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import MultiRadio from '../components/MultiRadio';
import { renderWithProviders } from './test-utils';

describe('MultiRadio', () => {
  const defaultProps = {
    groupName: 'Album',
    imageName: 'photo-1.jpg',
    handler: vi.fn(),
    checked: false,
  };

  beforeEach(() => {
    defaultProps.handler.mockClear();
  });

  it('renders a radio button with the group label', () => {
    renderWithProviders(<MultiRadio {...defaultProps} />);
    expect(screen.getByText('Album thumb')).toBeInTheDocument();
  });

  it('renders radio input with correct name attribute', () => {
    renderWithProviders(<MultiRadio {...defaultProps} />);
    const radio = screen.getByRole('radio');
    expect(radio).toHaveAttribute('name', 'Album');
  });

  it('calls handler with imageName when radio is clicked', () => {
    renderWithProviders(<MultiRadio {...defaultProps} />);
    const radio = screen.getByRole('radio');
    fireEvent.click(radio);
    expect(defaultProps.handler).toHaveBeenCalledWith('photo-1.jpg');
  });

  it('renders with defaultChecked when checked prop is true', () => {
    renderWithProviders(<MultiRadio {...{ ...defaultProps, checked: true }} />);
    const radio = screen.getByRole('radio');
    expect(radio).toBeChecked();
  });

  it('renders with unchecked when checked prop is false', () => {
    renderWithProviders(<MultiRadio {...defaultProps} />);
    const radio = screen.getByRole('radio');
    expect(radio).not.toBeChecked();
  });

  it('uses imageName as htmlFor on the label', () => {
    renderWithProviders(<MultiRadio {...defaultProps} />);
    const label = screen.getByText('Album thumb');
    expect(label).toHaveAttribute('for', 'photo-1.jpg');
  });
});
