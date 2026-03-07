import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import PhotoExifData from '../components/PhotoExifData';
import { renderWithProviders } from './test-utils';

describe('PhotoExifData', () => {
  it('renders key-value pairs from valid JSON exif data', () => {
    const exifJson = JSON.stringify({
      Camera: 'Canon EOS R5',
      Aperture: 'f/2.8',
      ISO: '400',
    });

    renderWithProviders(<PhotoExifData data={exifJson} />);

    expect(screen.getByText('Camera:')).toBeInTheDocument();
    expect(screen.getByText('Canon EOS R5')).toBeInTheDocument();
    expect(screen.getByText('Aperture:')).toBeInTheDocument();
    expect(screen.getByText('f/2.8')).toBeInTheDocument();
    expect(screen.getByText('ISO:')).toBeInTheDocument();
    expect(screen.getByText('400')).toBeInTheDocument();
  });

  it('renders a horizontal rule when data is provided', () => {
    const exifJson = JSON.stringify({ Camera: 'Canon' });
    const { container } = renderWithProviders(<PhotoExifData data={exifJson} />);
    expect(container.querySelector('hr')).toBeInTheDocument();
  });

  it('renders "No exif data available" when data is null/undefined', () => {
    renderWithProviders(<PhotoExifData data={null} />);
    expect(
      screen.getByText('No exif data available'),
    ).toBeInTheDocument();
  });

  it('renders "No exif data available" when data is empty string (falsy)', () => {
    renderWithProviders(<PhotoExifData data="" />);
    expect(
      screen.getByText('No exif data available'),
    ).toBeInTheDocument();
  });

  it('FIXED: renders graceful error message on invalid JSON', () => {
    renderWithProviders(<PhotoExifData data="not-valid-json" />);
    expect(screen.getByText('Invalid exif data')).toBeInTheDocument();
  });
});
