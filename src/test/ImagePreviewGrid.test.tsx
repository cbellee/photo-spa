import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import ImagePreviewGrid from '../components/ImagePreviewGrid';
import { renderWithProviders } from './test-utils';
import type { ImagePreview } from '../types';

// Mock react-icons
vi.mock('react-icons/fa6', () => ({
    FaArrowRotateRight: (props: any) => <span data-testid="rotate-icon" {...props} />,
}));

function createImagePreview(overrides: Partial<ImagePreview> = {}): ImagePreview {
    return {
        uploading: false,
        uploadComplete: false,
        src: 'blob:http://localhost/test-image',
        width: 800,
        height: 600,
        name: 'photo-1.jpg',
        type: 'image/jpeg',
        size: 1024,
        collection: 'trips',
        album: 'coral-bay',
        collectionImage: false,
        albumImage: false,
        description: 'A test photo',
        length: 1,
        uploadProgress: 0,
        orientation: 0,
        ...overrides,
    };
}

describe('ImagePreviewGrid', () => {
    const defaultProps = {
        imagePreviews: [createImagePreview()],
        collectionExists: false,
        albumExists: false,
        onDescriptionChange: vi.fn(),
        onCollectionThumbnail: vi.fn(),
        onAlbumThumbnail: vi.fn(),
        onOrientationChange: vi.fn(),
    };

    beforeEach(() => {
        defaultProps.onDescriptionChange.mockClear();
        defaultProps.onCollectionThumbnail.mockClear();
        defaultProps.onAlbumThumbnail.mockClear();
        defaultProps.onOrientationChange.mockClear();
    });

    it('returns null when imagePreviews is empty', () => {
        const { container } = renderWithProviders(
            <ImagePreviewGrid {...defaultProps} imagePreviews={[]} />
        );
        expect(container.firstChild).toBeNull();
    });

    it('returns null when imagePreviews is undefined-ish', () => {
        const { container } = renderWithProviders(
            <ImagePreviewGrid {...defaultProps} imagePreviews={null as any} />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders a card for each image preview', () => {
        const previews = [
            createImagePreview({ name: 'photo-1.jpg' }),
            createImagePreview({ name: 'photo-2.jpg' }),
        ];
        renderWithProviders(
            <ImagePreviewGrid {...defaultProps} imagePreviews={previews} />
        );
        expect(screen.getByText('photo-1.jpg')).toBeInTheDocument();
        expect(screen.getByText('photo-2.jpg')).toBeInTheDocument();
    });

    it('renders the image with correct src and alt', () => {
        renderWithProviders(<ImagePreviewGrid {...defaultProps} />);
        const img = screen.getByAltText('image-0');
        expect(img).toHaveAttribute('src', 'blob:http://localhost/test-image');
    });

    it('displays the image name', () => {
        renderWithProviders(<ImagePreviewGrid {...defaultProps} />);
        expect(screen.getByText('photo-1.jpg')).toBeInTheDocument();
    });

    it('renders description input with correct value', () => {
        renderWithProviders(<ImagePreviewGrid {...defaultProps} />);
        const input = screen.getByDisplayValue('A test photo');
        expect(input).toBeInTheDocument();
    });

    it('calls onDescriptionChange when description input changes', () => {
        renderWithProviders(<ImagePreviewGrid {...defaultProps} />);
        const input = screen.getByDisplayValue('A test photo');
        fireEvent.change(input, { target: { value: 'Updated description' } });
        expect(defaultProps.onDescriptionChange).toHaveBeenCalledWith(0, 'Updated description');
    });

    it('shows rotate button when not uploading', () => {
        renderWithProviders(<ImagePreviewGrid {...defaultProps} />);
        expect(screen.getByTestId('rotate-icon')).toBeInTheDocument();
    });

    it('hides rotate button when uploading', () => {
        const previews = [createImagePreview({ uploading: true, uploadProgress: 50 })];
        renderWithProviders(
            <ImagePreviewGrid {...defaultProps} imagePreviews={previews} />
        );
        expect(screen.queryByTestId('rotate-icon')).not.toBeInTheDocument();
    });

    it('calls onOrientationChange with image name when rotate is clicked', () => {
        renderWithProviders(<ImagePreviewGrid {...defaultProps} />);
        const rotateBtn = screen.getByTestId('rotate-icon').closest('button')!;
        fireEvent.click(rotateBtn);
        expect(defaultProps.onOrientationChange).toHaveBeenCalledWith('photo-1.jpg');
    });

    it('shows upload progress overlay when uploading', () => {
        const previews = [createImagePreview({ uploading: true, uploadProgress: 42 })];
        renderWithProviders(
            <ImagePreviewGrid {...defaultProps} imagePreviews={previews} />
        );
        expect(screen.getByText('42%')).toBeInTheDocument();
    });

    it('shows "Done" badge when upload completes successfully', () => {
        const previews = [createImagePreview({ uploadComplete: true, uploadError: false })];
        renderWithProviders(
            <ImagePreviewGrid {...defaultProps} imagePreviews={previews} />
        );
        expect(screen.getByText('Done')).toBeInTheDocument();
    });

    it('shows "Error" badge when upload fails', () => {
        const previews = [createImagePreview({ uploadComplete: true, uploadError: true })];
        renderWithProviders(
            <ImagePreviewGrid {...defaultProps} imagePreviews={previews} />
        );
        expect(screen.getByText('Error')).toBeInTheDocument();
    });

    it('applies rotation transform when orientation is set', () => {
        const previews = [createImagePreview({ orientation: 90 })];
        renderWithProviders(
            <ImagePreviewGrid {...defaultProps} imagePreviews={previews} />
        );
        const img = screen.getByAltText('image-0');
        expect(img.style.transform).toBe('rotate(90deg)');
    });

    it('does not apply rotation transform when orientation is 0', () => {
        const previews = [createImagePreview({ orientation: 0 })];
        renderWithProviders(
            <ImagePreviewGrid {...defaultProps} imagePreviews={previews} />
        );
        const img = screen.getByAltText('image-0');
        expect(img.style.transform).toBe('');
    });

    it('renders Collection and Album MultiRadio when neither exists', () => {
        renderWithProviders(
            <ImagePreviewGrid {...defaultProps} collectionExists={false} albumExists={false} />
        );
        expect(screen.getByText('Collection thumb')).toBeInTheDocument();
        expect(screen.getByText('Album thumb')).toBeInTheDocument();
    });

    it('hides Collection MultiRadio when collection exists', () => {
        renderWithProviders(
            <ImagePreviewGrid {...defaultProps} collectionExists={true} albumExists={false} />
        );
        expect(screen.queryByText('Collection thumb')).not.toBeInTheDocument();
        expect(screen.getByText('Album thumb')).toBeInTheDocument();
    });

    it('hides Album MultiRadio when album exists', () => {
        renderWithProviders(
            <ImagePreviewGrid {...defaultProps} collectionExists={false} albumExists={true} />
        );
        expect(screen.getByText('Collection thumb')).toBeInTheDocument();
        expect(screen.queryByText('Album thumb')).not.toBeInTheDocument();
    });

    it('hides both MultiRadios when both exist', () => {
        renderWithProviders(
            <ImagePreviewGrid {...defaultProps} collectionExists={true} albumExists={true} />
        );
        expect(screen.queryByText('Collection thumb')).not.toBeInTheDocument();
        expect(screen.queryByText('Album thumb')).not.toBeInTheDocument();
    });

    it('adds animate-pulse class to image when uploading', () => {
        const previews = [createImagePreview({ uploading: true })];
        renderWithProviders(
            <ImagePreviewGrid {...defaultProps} imagePreviews={previews} />
        );
        const img = screen.getByAltText('image-0');
        expect(img.className).toContain('animate-pulse');
        expect(img.className).toContain('opacity-60');
    });
});
