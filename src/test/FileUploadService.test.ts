import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import FileUploadService from '../services/FileUploadService';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

describe('FileUploadService', () => {
  beforeEach(() => {
    mockedAxios.mockReset();
    mockedAxios.get.mockReset();
    mockedAxios.post.mockReset();
  });

  describe('upload', () => {
    it('sends a POST request with FormData and auth header', async () => {
      mockedAxios.post.mockResolvedValue({ data: { success: true } });

      const file = new File(['photo'], 'test.jpg', { type: 'image/jpeg' });
      const data = {
        name: 'test.jpg',
        collection: 'trips',
        album: 'coral-bay',
        collectionImage: false,
        albumImage: false,
        description: 'test',
        orientation: '0',
        isDeleted: false,
        size: 1024,
        type: 'image/jpeg',
      };

      await FileUploadService.upload(file, data as any, 'mock-token');

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      const [url, formData, config] = mockedAxios.post.mock.calls[0];
      expect(url).toContain('/upload');
      expect(formData).toBeInstanceOf(FormData);
      expect(config?.headers?.['Authorization']).toBe('Bearer mock-token');
      expect(config?.headers?.['Content-Type']).toBe('multipart/form-data');
    });

    it('appends file as "photo" field in FormData', async () => {
      mockedAxios.post.mockResolvedValue({ data: {} });

      const file = new File(['photo'], 'test.jpg', { type: 'image/jpeg' });
      const data = {
        name: 'test.jpg',
        collection: 'trips',
        album: 'coral-bay',
        collectionImage: false,
        albumImage: false,
        description: 'test',
        orientation: '0',
        isDeleted: false,
        size: 1024,
        type: 'image/jpeg',
      };

      await FileUploadService.upload(file, data as any, 'mock-token');

      const formData = mockedAxios.post.mock.calls[0][1] as FormData;
      expect(formData.get('photo')).toBeInstanceOf(File);
      expect(formData.get('metadata')).toBeTruthy();
    });

    it('passes onUploadProgress callback to axios config', async () => {
      mockedAxios.post.mockResolvedValue({ data: {} });

      const file = new File(['photo'], 'test.jpg', { type: 'image/jpeg' });
      const data = {
        name: 'test.jpg',
        collection: 'trips',
        album: 'cb',
        collectionImage: false,
        albumImage: false,
        description: 'test',
        orientation: '0',
        isDeleted: false,
        size: 1024,
        type: 'image/jpeg',
      };
      const onProgress = vi.fn();

      await FileUploadService.upload(file, data as any, 'mock-token', onProgress);

      const config = mockedAxios.post.mock.calls[0][2];
      expect(config?.onUploadProgress).toBe(onProgress);
    });
  });

  describe('update', () => {
    it('sends a PUT request with photo data and auth header', async () => {
      mockedAxios.mockResolvedValue({ data: { success: true } });

      const photoData = {
        name: 'photo-1.jpg',
        id: '1',
        url: 'https://example.com/photo-1.jpg',
        src: 'https://example.com/photo-1-thumb.jpg',
        width: 800,
        height: 600,
        collection: 'trips',
        album: 'coral-bay',
        albumImage: false,
        collectionImage: false,
        description: 'A photo',
        isDeleted: false,
        orientation: 0,
      };

      await FileUploadService.update(photoData, 'mock-token');

      expect(mockedAxios).toHaveBeenCalledTimes(1);
      const callArgs = mockedAxios.mock.calls[0];
      const [url, config] = callArgs as [string, Record<string, any>];
      expect(url).toContain('/update/photo-1.jpg');
      expect(config.method).toBe('PUT');
      expect(config.headers['Authorization']).toBe('Bearer mock-token');
      expect(config.data.name).toBe('photo-1.jpg');
      expect(config.data.collection).toBe('trips');
      // orientation and boolean fields are converted to strings
      expect(config.data.orientation).toBe('0');
      expect(config.data.isDeleted).toBe('false');
      expect(config.data.collectionImage).toBe('false');
      expect(config.data.albumImage).toBe('false');
    });
  });

  describe('getFiles', () => {
    it('calls GET /files', async () => {
      mockedAxios.get.mockResolvedValue({ data: [] });
      await FileUploadService.getFiles();
      expect(mockedAxios.get).toHaveBeenCalledWith('/files');
    });
  });
});
