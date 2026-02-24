import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, createMockCollectionPhoto } from './test-utils';
import Collections from '../components/Collections';
import * as photoService from '../services/photoService';

// Mock photoService
vi.mock('../services/photoService');

// Mock react-photo-album to simplify rendering
vi.mock('react-photo-album', () => ({
  RowsPhotoAlbum: ({ photos, render }: any) => (
    <div data-testid="photo-album">
      {photos.map((photo: any, index: number) => (
        <div key={photo.id} data-testid={`photo-${index}`}>
          {render?.photo?.({}, { photo, index })}
        </div>
      ))}
    </div>
  ),
}));

describe('Collections', () => {
  const mockPhotos = [
    createMockCollectionPhoto({ id: '1', collection: 'trips', src: 'https://example.com/trips.jpg' }),
    createMockCollectionPhoto({ id: '2', collection: 'sport', src: 'https://example.com/sport.jpg' }),
    createMockCollectionPhoto({ id: '3', collection: 'vintage', src: 'https://example.com/vintage.jpg' }),
  ];

  beforeEach(() => {
    vi.mocked(photoService.fetchCollections).mockReset();
    vi.mocked(photoService.fetchCollections).mockResolvedValue(mockPhotos);
  });

  it('shows loading spinner initially', () => {
    // Don't resolve the promise yet
    vi.mocked(photoService.fetchCollections).mockReturnValue(new Promise(() => {}));
    const { container } = renderWithProviders(
      <Collections collection="" album="" />,
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('fetches photos from the API on mount', async () => {
    renderWithProviders(<Collections collection="" album="" />);

    await waitFor(() => {
      expect(photoService.fetchCollections).toHaveBeenCalledTimes(1);
    });
  });

  it('renders collection photos after fetch', async () => {
    renderWithProviders(<Collections collection="" album="" />);

    await waitFor(() => {
      expect(screen.getByTestId('photo-album')).toBeInTheDocument();
    });

    // Should render 3 photos
    expect(screen.getByTestId('photo-0')).toBeInTheDocument();
    expect(screen.getByTestId('photo-1')).toBeInTheDocument();
    expect(screen.getByTestId('photo-2')).toBeInTheDocument();
  });

  it('renders collection names as links', async () => {
    renderWithProviders(<Collections collection="" album="" />);

    await waitFor(() => {
      expect(screen.getAllByText('trips').length).toBeGreaterThan(0);
    });

    expect(screen.getAllByText('sport').length).toBeGreaterThan(0);
    expect(screen.getAllByText('vintage').length).toBeGreaterThan(0);
  });

  it('renders a "Collections" breadcrumb link', async () => {
    renderWithProviders(<Collections collection="" album="" />);

    await waitFor(() => {
      expect(screen.getByText('Collections')).toBeInTheDocument();
    });
  });

  it('hides loading spinner after fetch completes', async () => {
    renderWithProviders(<Collections collection="" album="" />);

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  it('handles API error gracefully (logs to console)', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(photoService.fetchCollections).mockRejectedValue(new Error('Network error'));

    renderWithProviders(<Collections collection="" album="" />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it('KNOWN BUG: useEffect depends on [props.collection, props.album] which are always ""', async () => {
    // Both props are always "" so the effect only fires once (same as [])
    const { rerender } = renderWithProviders(
      <Collections collection="" album="" />,
    );

    await waitFor(() => {
      expect(photoService.fetchCollections).toHaveBeenCalledTimes(1);
    });
  });

  it('KNOWN BUG: index state is set but never updated by user interaction', async () => {
    // The component declares [index, setIndex] = useState(-1) but setIndex is
    // never called from user interaction. This test just verifies it doesn't crash.
    renderWithProviders(<Collections collection="" album="" />);

    await waitFor(() => {
      expect(screen.getByTestId('photo-album')).toBeInTheDocument();
    });
  });
});
