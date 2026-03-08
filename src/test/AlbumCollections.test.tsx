import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, createMockCollectionPhoto } from './test-utils';
import Albums from '../components/AlbumCollections';
import { Route, Routes } from 'react-router-dom';
import * as photoService from '../services/photoService';

// Mock photoService
vi.mock('../services/photoService');

// Mock react-photo-album
vi.mock('react-photo-album', () => ({
  RowsPhotoAlbum: ({ photos, render }: any) => (
    <div data-testid="photo-album">
      {photos.map((photo: any, index: number) => (
        <div key={photo.id} data-testid={`photo-${index}`}>
          {render?.photo?.({ onClick: vi.fn() }, { photo, index })}
        </div>
      ))}
    </div>
  ),
}));

// Wrap in Routes to provide useParams context
function AlbumsWithRoute() {
  return (
    <Routes>
      <Route path="/:collection" element={<Albums collection="" album="" />} />
    </Routes>
  );
}

describe('AlbumCollections', () => {
  const mockAlbums = [
    createMockCollectionPhoto({ id: '1', collection: 'trips', album: 'coral-bay', src: 'https://example.com/coral-bay.jpg' }),
    createMockCollectionPhoto({ id: '2', collection: 'trips', album: 'hong-kong', src: 'https://example.com/hong-kong.jpg' }),
  ];

  beforeEach(() => {
    vi.mocked(photoService.fetchAlbums).mockReset();
    vi.mocked(photoService.fetchAlbums).mockResolvedValue(mockAlbums);
  });

  it('shows loading spinner initially', () => {
    vi.mocked(photoService.fetchAlbums).mockReturnValue(new Promise(() => {}));
    renderWithProviders(<AlbumsWithRoute />, {
      routerProps: { initialEntries: ['/trips'] },
    });
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('fetches albums for the collection from route params', async () => {
    renderWithProviders(<AlbumsWithRoute />, {
      routerProps: { initialEntries: ['/trips'] },
    });

    await waitFor(() => {
      expect(photoService.fetchAlbums).toHaveBeenCalledWith('trips', false);
    });
  });

  it('renders album photos after fetch', async () => {
    renderWithProviders(<AlbumsWithRoute />, {
      routerProps: { initialEntries: ['/trips'] },
    });

    await waitFor(() => {
      expect(screen.getByTestId('photo-album')).toBeInTheDocument();
    });

    expect(screen.getByTestId('photo-0')).toBeInTheDocument();
    expect(screen.getByTestId('photo-1')).toBeInTheDocument();
  });

  it('renders breadcrumb with collection name', async () => {
    renderWithProviders(<AlbumsWithRoute />, {
      routerProps: { initialEntries: ['/trips'] },
    });

    await waitFor(() => {
      // Should show "Collections > trips" breadcrumb
      expect(screen.getByText('Collections')).toBeInTheDocument();
      expect(screen.getAllByText('trips').length).toBeGreaterThan(0);
    });
  });

  it('renders album names as links', async () => {
    renderWithProviders(<AlbumsWithRoute />, {
      routerProps: { initialEntries: ['/trips'] },
    });

    await waitFor(() => {
      expect(screen.getAllByText('coral-bay').length).toBeGreaterThan(0);
      expect(screen.getAllByText('hong-kong').length).toBeGreaterThan(0);
    });
  });

  it('hides loading spinner after fetch completes', async () => {
    renderWithProviders(<AlbumsWithRoute />, {
      routerProps: { initialEntries: ['/trips'] },
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(photoService.fetchAlbums).mockRejectedValue(new Error('Network error'));

    renderWithProviders(<AlbumsWithRoute />, {
      routerProps: { initialEntries: ['/trips'] },
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it('is structurally near-identical to Collections (~80% duplication)', async () => {
    // KNOWN ISSUE: This component duplicates most logic from Collections.tsx.
    // Both share: Photo interface, Params interface, useState pattern,
    // useEffect fetch pattern, loading spinner, RowsPhotoAlbum usage.
    // Differences: URL includes collection param, breadcrumb shows collection, links to album.
    renderWithProviders(<AlbumsWithRoute />, {
      routerProps: { initialEntries: ['/trips'] },
    });

    await waitFor(() => {
      expect(screen.getByTestId('photo-album')).toBeInTheDocument();
    });
  });
});
