import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders, createMockPhoto, mockTagsResponse } from './test-utils';
import Photos from '../components/Photos';
import { Route, Routes } from 'react-router-dom';
import * as photoService from '../services/photoService';
import FileUploadService from '../services/FileUploadService';
import { useAuth } from '../hooks/useAuth';

// Mock photoService
vi.mock('../services/photoService');

// Mock useAuth
vi.mock('../hooks/useAuth');
const mockUseAuth = vi.mocked(useAuth);

// Mock FileUploadService
vi.mock('../services/FileUploadService', () => ({
  default: {
    upload: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockResolvedValue({}),
    getFiles: vi.fn().mockResolvedValue({ data: [] }),
  },
}));

// Mock react-photo-album  
vi.mock('react-photo-album', () => ({
  RowsPhotoAlbum: ({ photos, render, onClick }: any) => (
    <div data-testid="photo-album">
      {photos.map((photo: any, index: number) => (
        <div key={photo.id || index} data-testid={`photo-${index}`}>
          {render?.photo?.(
            { onClick: () => onClick?.({ index }) },
            { photo, index },
          )}
        </div>
      ))}
    </div>
  ),
}));

// Mock Lightbox
vi.mock('yet-another-react-lightbox', () => ({
  default: ({ open, slides, index, close }: any) =>
    open ? (
      <div data-testid="lightbox">
        <span data-testid="lightbox-slide">
          Slide {index}: {slides[index]?.src}
        </span>
        <button onClick={close} data-testid="lightbox-close">
          Close
        </button>
      </div>
    ) : null,
}));

// Mock lightbox plugins
vi.mock('yet-another-react-lightbox/plugins/fullscreen', () => ({ default: {} }));
vi.mock('yet-another-react-lightbox/plugins/slideshow', () => ({ default: {} }));
vi.mock('yet-another-react-lightbox/plugins/thumbnails', () => ({ default: {} }));

// Mock TagSelector
vi.mock('../components/TagSelector', () => ({
  default: (props: any) => (
    <div data-testid={`tag-selector-${props.id}`}>TagSelector</div>
  ),
}));

// Mock MultiRadio
vi.mock('../components/MultiRadio.tsx', () => ({
  default: (props: any) => (
    <div data-testid={`multi-radio-${props.groupName}-${props.imageName}`}>
      MultiRadio {props.groupName}
    </div>
  ),
}));

// Mock PhotoExifData
vi.mock('../components/PhotoExifData.tsx', () => ({
  default: (props: any) => (
    <div data-testid="photo-exif-data">PhotoExifData</div>
  ),
}));

function PhotosWithRoute() {
  return (
    <Routes>
      <Route
        path="/:collection/:album"
        element={<Photos collection="" album="" />}
      />
    </Routes>
  );
}

describe('Photos', () => {
  const mockPhotos = [
    createMockPhoto({
      name: 'photo-1.jpg',
      id: '1',
      src: 'https://example.com/1.jpg',
      collection: 'trips',
      album: 'coral-bay',
      description: 'Coral Bay Beach',
      orientation: 0,
    }),
    createMockPhoto({
      name: 'photo-2.jpg',
      id: '2',
      src: 'https://example.com/2.jpg',
      collection: 'trips',
      album: 'coral-bay',
      description: 'Snorkeling',
      orientation: 90,
    }),
  ];

  function setupUnauthenticated() {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      token: null,
      instance: {} as any,
      accounts: [],
      account: null,
      inProgress: 'none' as any,
    });
  }

  function setupAuthenticated() {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      token: 'mock-token',
      instance: {} as any,
      accounts: [],
      account: null,
      inProgress: 'none' as any,
    });
  }

  beforeEach(() => {
    vi.mocked(photoService.fetchPhotos).mockReset();
    vi.mocked(photoService.fetchPhotos).mockResolvedValue(mockPhotos);
    vi.mocked(photoService.fetchTags).mockReset();
    vi.mocked(photoService.fetchTags).mockResolvedValue(mockTagsResponse);
    vi.mocked(FileUploadService.update).mockClear();
    setupUnauthenticated();
  });

  it('shows loading spinner initially', () => {
    vi.mocked(photoService.fetchPhotos).mockReturnValue(new Promise(() => {}));
    renderWithProviders(<PhotosWithRoute />, {
      routerProps: { initialEntries: ['/trips/coral-bay'] },
    });
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('fetches photos for the collection/album from route params', async () => {
    renderWithProviders(<PhotosWithRoute />, {
      routerProps: { initialEntries: ['/trips/coral-bay'] },
    });

    await waitFor(() => {
      expect(photoService.fetchPhotos).toHaveBeenCalledWith('trips', 'coral-bay');
    });
  });

  it('renders photos after fetch', async () => {
    renderWithProviders(<PhotosWithRoute />, {
      routerProps: { initialEntries: ['/trips/coral-bay'] },
    });

    await waitFor(() => {
      expect(screen.getByTestId('photo-album')).toBeInTheDocument();
    });

    expect(screen.getByTestId('photo-0')).toBeInTheDocument();
    expect(screen.getByTestId('photo-1')).toBeInTheDocument();
  });

  it('renders breadcrumb with Collections > collection > album', async () => {
    renderWithProviders(<PhotosWithRoute />, {
      routerProps: { initialEntries: ['/trips/coral-bay'] },
    });

    await waitFor(() => {
      expect(screen.getByText('Collections')).toBeInTheDocument();
      expect(screen.getAllByText('trips').length).toBeGreaterThan(0);
      expect(screen.getAllByText('coral-bay').length).toBeGreaterThan(0);
    });
  });

  it('shows Edit button when authenticated', async () => {
    setupAuthenticated();
    renderWithProviders(<PhotosWithRoute />, {
      routerProps: { initialEntries: ['/trips/coral-bay'] },
    });

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });
  });

  it('does not show Edit button when unauthenticated', async () => {
    renderWithProviders(<PhotosWithRoute />, {
      routerProps: { initialEntries: ['/trips/coral-bay'] },
    });

    await waitFor(() => {
      expect(screen.getByTestId('photo-album')).toBeInTheDocument();
    });

    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });

  it('toggles edit mode when Edit button is clicked', async () => {
    setupAuthenticated();
    renderWithProviders(<PhotosWithRoute />, {
      routerProps: { initialEntries: ['/trips/coral-bay'] },
    });

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Edit'));

    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('KNOWN BUG: setIsAdmin(true) is hardcoded — every user is admin', async () => {
    setupAuthenticated();
    renderWithProviders(<PhotosWithRoute />, {
      routerProps: { initialEntries: ['/trips/coral-bay'] },
    });

    // The Edit button appears for every authenticated user because isAdmin is always true
    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });
  });

  it('FIXED: saveEditedData only sends changed photos', async () => {
    setupAuthenticated();
    renderWithProviders(<PhotosWithRoute />, {
      routerProps: { initialEntries: ['/trips/coral-bay'] },
    });

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Edit'));
    fireEvent.click(screen.getByText('Save'));

    // No photos were modified, so update should not be called
    await waitFor(() => {
      expect(FileUploadService.update).toHaveBeenCalledTimes(0);
    });
  });

  it('handles API error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(photoService.fetchPhotos).mockRejectedValue(new Error('Network error'));

    renderWithProviders(<PhotosWithRoute />, {
      routerProps: { initialEntries: ['/trips/coral-bay'] },
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it('hides loading spinner after fetch completes', async () => {
    renderWithProviders(<PhotosWithRoute />, {
      routerProps: { initialEntries: ['/trips/coral-bay'] },
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });
});
