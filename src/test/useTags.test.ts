import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import * as photoService from '../services/photoService';
import { useTags, clearTagCache } from '../hooks/useTags';

vi.mock('../services/photoService', () => ({
  fetchTags: vi.fn(),
}));

describe('useTags', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearTagCache();
  });

  it('starts with empty collectionAlbumData', () => {
    vi.mocked(photoService.fetchTags).mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useTags());
    expect(result.current.collectionAlbumData.size).toBe(0);
  });

  it('fetches and populates collectionAlbumData', async () => {
    vi.mocked(photoService.fetchTags).mockResolvedValue({
      trips: ['coral-bay', 'hong-kong'],
      sport: ['parasailing'],
    });

    const { result } = renderHook(() => useTags());

    await waitFor(() => {
      expect(result.current.collectionAlbumData.size).toBe(2);
    });

    expect(result.current.collectionAlbumData.get('trips')).toEqual(['coral-bay', 'hong-kong']);
    expect(result.current.collectionAlbumData.get('sport')).toEqual(['parasailing']);
  });

  it('handles fetch error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(photoService.fetchTags).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useTags());

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    expect(result.current.collectionAlbumData.size).toBe(0);
    consoleSpy.mockRestore();
  });

  it('calls fetchTags once on mount', () => {
    vi.mocked(photoService.fetchTags).mockReturnValue(new Promise(() => {}));
    renderHook(() => useTags());
    expect(photoService.fetchTags).toHaveBeenCalledTimes(1);
  });
});
