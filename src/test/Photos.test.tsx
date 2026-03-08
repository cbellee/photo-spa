import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, fireEvent, act } from '@testing-library/react';
import { renderWithProviders, createMockPhoto } from './test-utils';
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
    vi.mocked(FileUploadService.update).mockClear();
    setupUnauthenticated();
  });

  afterEach(() => {
    vi.useRealTimers();
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
      expect(photoService.fetchPhotos).toHaveBeenCalledWith('trips', 'coral-bay', false);
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

  it('toggles edit mode — Edit becomes Done, no Save/Cancel buttons', async () => {
    setupAuthenticated();
    renderWithProviders(<PhotosWithRoute />, {
      routerProps: { initialEntries: ['/trips/coral-bay'] },
    });

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Edit'));

    await waitFor(() => {
      expect(screen.getByText('Done')).toBeInTheDocument();
    });
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
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

  it('entering edit mode re-fetches with includeDeleted=true', async () => {
    setupAuthenticated();
    renderWithProviders(<PhotosWithRoute />, {
      routerProps: { initialEntries: ['/trips/coral-bay'] },
    });

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    vi.mocked(photoService.fetchPhotos).mockClear();
    fireEvent.click(screen.getByText('Edit'));

    await waitFor(() => {
      expect(photoService.fetchPhotos).toHaveBeenCalledWith('trips', 'coral-bay', true);
    });
  });

  it('leaving edit mode re-fetches with includeDeleted=false', async () => {
    setupAuthenticated();
    renderWithProviders(<PhotosWithRoute />, {
      routerProps: { initialEntries: ['/trips/coral-bay'] },
    });

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Edit'));
    await waitFor(() => {
      expect(screen.getByText('Done')).toBeInTheDocument();
    });

    vi.mocked(photoService.fetchPhotos).mockClear();
    fireEvent.click(screen.getByText('Done'));

    await waitFor(() => {
      expect(photoService.fetchPhotos).toHaveBeenCalledWith('trips', 'coral-bay', false);
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

  // ── Auto-save tests ─────────────────────────────────────────────────────

  describe('auto-save', () => {
    async function enterEditMode() {
      setupAuthenticated();
      renderWithProviders(<PhotosWithRoute />, {
        routerProps: { initialEntries: ['/trips/coral-bay'] },
      });

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Edit'));

      await waitFor(() => {
        expect(screen.getByText('Done')).toBeInTheDocument();
      });

      vi.mocked(FileUploadService.update).mockClear();
    }

    it('auto-saves when clicking the delete (trash) icon', async () => {
      await enterEditMode();

      const trashButtons = screen.getAllByTitle('Mark for deletion');
      fireEvent.click(trashButtons[0]);

      await waitFor(() => {
        expect(FileUploadService.update).toHaveBeenCalledTimes(1);
        expect(FileUploadService.update).toHaveBeenCalledWith(
          expect.objectContaining({ name: 'photo-1.jpg', isDeleted: true }),
          'mock-token',
        );
      });
    });

    it('auto-saves when clicking the rotate icon', async () => {
      await enterEditMode();

      const rotateButtons = screen.getAllByTitle('Rotate image');
      fireEvent.click(rotateButtons[0]);

      await waitFor(() => {
        expect(FileUploadService.update).toHaveBeenCalledTimes(1);
        expect(FileUploadService.update).toHaveBeenCalledWith(
          expect.objectContaining({ name: 'photo-1.jpg', orientation: 90 }),
          'mock-token',
        );
      });
    });

    it('auto-saves description after debounce (800ms)', async () => {
      await enterEditMode();

      // Install fake timers AFTER enterEditMode (which uses waitFor/real timers)
      vi.useFakeTimers();

      const descInputs = screen.getAllByRole('textbox');
      // The first textbox belongs to photo-1
      fireEvent.change(descInputs[0], { target: { id: 'photo-1.jpg', value: 'Updated desc' } });

      // Not yet saved (debounce)
      expect(FileUploadService.update).not.toHaveBeenCalled();

      // Advance past debounce
      act(() => {
        vi.advanceTimersByTime(900);
      });

      expect(FileUploadService.update).toHaveBeenCalledTimes(1);
      expect(FileUploadService.update).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'photo-1.jpg', description: 'Updated desc' }),
        'mock-token',
      );
    });

    it('debounce resets on subsequent description keystrokes', async () => {
      await enterEditMode();

      // Install fake timers AFTER enterEditMode (which uses waitFor/real timers)
      vi.useFakeTimers();

      const descInputs = screen.getAllByRole('textbox');

      fireEvent.change(descInputs[0], { target: { id: 'photo-1.jpg', value: 'A' } });
      act(() => { vi.advanceTimersByTime(500); });
      expect(FileUploadService.update).not.toHaveBeenCalled();

      // Another keystroke — timer resets
      fireEvent.change(descInputs[0], { target: { id: 'photo-1.jpg', value: 'AB' } });
      act(() => { vi.advanceTimersByTime(500); });
      expect(FileUploadService.update).not.toHaveBeenCalled();

      // Full 800ms from the last keystroke
      act(() => { vi.advanceTimersByTime(400); });
      expect(FileUploadService.update).toHaveBeenCalledTimes(1);
      expect(FileUploadService.update).toHaveBeenCalledWith(
        expect.objectContaining({ description: 'AB' }),
        'mock-token',
      );
    });

    it('toggling delete twice auto-saves both times (delete then undelete)', async () => {
      await enterEditMode();

      const trashButtons = screen.getAllByTitle('Mark for deletion');
      fireEvent.click(trashButtons[0]);

      await waitFor(() => {
        expect(FileUploadService.update).toHaveBeenCalledTimes(1);
        expect(FileUploadService.update).toHaveBeenLastCalledWith(
          expect.objectContaining({ isDeleted: true }),
          'mock-token',
        );
      });

      // Now the button title should change
      const undeleteBtn = screen.getAllByTitle('Unmark for deletion');
      fireEvent.click(undeleteBtn[0]);

      await waitFor(() => {
        expect(FileUploadService.update).toHaveBeenCalledTimes(2);
        expect(FileUploadService.update).toHaveBeenLastCalledWith(
          expect.objectContaining({ isDeleted: false }),
          'mock-token',
        );
      });
    });
  });

  // ── Soft-deleted visual cue tests ───────────────────────────────────────

  describe('soft-deleted photo visual cue', () => {
    const photosWithDeleted = [
      createMockPhoto({
        name: 'photo-1.jpg',
        id: '1',
        src: 'https://example.com/1.jpg',
        collection: 'trips',
        album: 'coral-bay',
        description: 'Active photo',
        isDeleted: false,
      }),
      createMockPhoto({
        name: 'photo-2.jpg',
        id: '2',
        src: 'https://example.com/2.jpg',
        collection: 'trips',
        album: 'coral-bay',
        description: 'Deleted photo',
        isDeleted: true,
      }),
    ];

    it('shows "Deleted" badge overlay on soft-deleted photos in edit mode', async () => {
      setupAuthenticated();
      vi.mocked(photoService.fetchPhotos).mockResolvedValue(photosWithDeleted);

      renderWithProviders(<PhotosWithRoute />, {
        routerProps: { initialEntries: ['/trips/coral-bay'] },
      });

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Edit'));

      await waitFor(() => {
        expect(screen.getByText('Deleted')).toBeInTheDocument();
      });
    });

    it('deleted photos have reduced opacity styling', async () => {
      setupAuthenticated();
      vi.mocked(photoService.fetchPhotos).mockResolvedValue(photosWithDeleted);

      renderWithProviders(<PhotosWithRoute />, {
        routerProps: { initialEntries: ['/trips/coral-bay'] },
      });

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Edit'));

      await waitFor(() => {
        expect(screen.getByText('Deleted')).toBeInTheDocument();
      });

      // The deleted photo's card should have the opacity-50 class
      const deletedBadge = screen.getByText('Deleted');
      const card = deletedBadge.closest('.opacity-50');
      expect(card).toBeInTheDocument();
    });

    it('active photos do not show "Deleted" badge', async () => {
      setupAuthenticated();
      // All photos are active
      vi.mocked(photoService.fetchPhotos).mockResolvedValue([
        createMockPhoto({ name: 'active.jpg', id: '1', isDeleted: false }),
      ]);

      renderWithProviders(<PhotosWithRoute />, {
        routerProps: { initialEntries: ['/trips/coral-bay'] },
      });

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Edit'));

      await waitFor(() => {
        expect(screen.getByText('Done')).toBeInTheDocument();
      });

      expect(screen.queryByText('Deleted')).not.toBeInTheDocument();
    });
  });

  // ── Show Exif checkbox test ─────────────────────────────────────────────

  it('shows the Show Exif checkbox in edit mode', async () => {
    setupAuthenticated();
    renderWithProviders(<PhotosWithRoute />, {
      routerProps: { initialEntries: ['/trips/coral-bay'] },
    });

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Edit'));

    await waitFor(() => {
      expect(screen.getByText('Show Exif')).toBeInTheDocument();
    });
  });
});

