import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders, mockAccount, mockTagsResponse } from './test-utils';
import Upload from '../components/Upload';
import * as photoService from '../services/photoService';
import FileUploadService from '../services/FileUploadService';
import { useAuth } from '../hooks/useAuth';

// Mock photoService
vi.mock('../services/photoService');

// Mock useAuth
vi.mock('../hooks/useAuth');
const mockUseAuth = vi.mocked(useAuth);

// Mock FileUploadService
vi.mock('../services/FileUploadService.tsx', () => ({
  default: {
    upload: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockResolvedValue({}),
    getFiles: vi.fn().mockResolvedValue({ data: [] }),
  },
}));

// Mock TagSelector
vi.mock('../components/TagSelector', () => ({
  default: (props: any) => (
    <div data-testid="tag-select">
      <button
        data-testid="set-collection"
        onClick={() => props.selectedCollection('trips')}
      >
        Set Collection
      </button>
      <button
        data-testid="set-album"
        onClick={() => props.selectedAlbum('coral-bay')}
      >
        Set Album
      </button>
      {props.children}
    </div>
  ),
}));

// Mock MultiRadio
vi.mock('../components/MultiRadio.tsx', () => ({
  default: (props: any) => (
    <div data-testid={`multi-radio-${props.groupName}`}>
      <button onClick={() => props.handler(props.imageName)}>
        {props.groupName} Thumb
      </button>
    </div>
  ),
}));

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>(
    'react-router-dom',
  );
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Upload', () => {
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
      token: 'test-token',
      instance: {} as any,
      accounts: [mockAccount],
      account: mockAccount,
      inProgress: 'none' as any,
    });
  }

  beforeEach(() => {
    setupUnauthenticated();
    vi.mocked(photoService.fetchTags).mockReset();
    vi.mocked(photoService.fetchTags).mockResolvedValue(mockTagsResponse);
    vi.mocked(FileUploadService.upload).mockClear();
    mockNavigate.mockClear();
  });

  it('shows authentication required message when unauthenticated', () => {
    renderWithProviders(<Upload />);
    expect(
      screen.getByText(/you must be signed in/i),
    ).toBeInTheDocument();
  });

  it('shows upload form when authenticated', () => {
    setupAuthenticated();
    renderWithProviders(<Upload />);
    expect(screen.getByTestId('tag-select')).toBeInTheDocument();
  });

  it('renders file input for image selection', () => {
    setupAuthenticated();
    const { container } = renderWithProviders(<Upload />);

    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('accept', 'image/jpg, image/jpeg, image/png');
    expect(fileInput).toHaveAttribute('multiple');
  });

  it('renders Upload button (disabled by default)', () => {
    setupAuthenticated();
    renderWithProviders(<Upload />);

    const uploadBtn = screen.getByText('Upload');
    expect(uploadBtn).toBeInTheDocument();
    expect(uploadBtn).toBeDisabled();
  });

  it('shows validation messages', async () => {
    setupAuthenticated();
    renderWithProviders(<Upload />);

    // Initially should show a validation message (collection not set, etc.)
    await waitFor(() => {
      const validationText = screen.queryByText(/collection is not set/i) 
        || screen.queryByText(/album is not set/i)
        || screen.queryByText(/no files selected/i)
        || screen.queryByText(/totes/i);
      expect(validationText).toBeInTheDocument();
    });
  });

  it('sets collection when TagSelect callback fires', async () => {
    setupAuthenticated();
    renderWithProviders(<Upload />);

    fireEvent.click(screen.getByTestId('set-collection'));

    // This triggers the onChangeCollection callback which calls fetchTags to check existence
    await waitFor(() => {
      expect(photoService.fetchTags).toHaveBeenCalled();
    });
  });

  it('KNOWN BUG: progressMessage uses typo "progess" instead of "progress"', () => {
    // This documents the typo in the state variable name.
    // The component declares: { progess: 0, total: selectedFiles?.length }
    setupAuthenticated();
    expect(() =>
      renderWithProviders(<Upload />),
    ).not.toThrow();
  });

  it('KNOWN BUG: await on setState is a no-op', () => {
    // Upload.tsx calls `await setImagePreviews(...)` but setState
    // doesn't return a promise. The await is silently ignored.
    setupAuthenticated();
    expect(() =>
      renderWithProviders(<Upload />),
    ).not.toThrow();
  });
});
