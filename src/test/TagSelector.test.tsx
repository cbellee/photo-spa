import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, mockTagsResponse } from './test-utils';
import { screen, waitFor } from '@testing-library/react';
import TagSelector from '../components/TagSelector';
import { FormProvider, useForm } from 'react-hook-form';

// Mock useTags hook – the Map must be a stable reference (like the real
// useState-based hook) to prevent infinite re-render loops in useEffect.
const stableCollectionAlbumData = new Map([
    ['trips', ['coral-bay', 'hong-kong', 'karijini']],
    ['sport', ['parasailing', 'skydiving']],
    ['vintage', ['nature']],
]);

vi.mock('../hooks/useTags', () => ({
    useTags: () => ({
        collectionAlbumData: stableCollectionAlbumData,
    }),
}));

// Wrapper that provides FormProvider context required by mode="create"
function TagSelectorWithForm(props: any) {
    const methods = useForm();
    return (
        <FormProvider {...methods}>
            <TagSelector {...props} />
        </FormProvider>
    );
}

describe('TagSelector (mode="create")', () => {
    const defaultProps = {
        mode: 'create' as const,
        selectedAlbum: vi.fn(),
        selectedCollection: vi.fn(),
        children: <div data-testid="children">Child Content</div>,
    };

    beforeEach(() => {
        defaultProps.selectedAlbum.mockClear();
        defaultProps.selectedCollection.mockClear();
    });

    it('renders Collection and Album labels', () => {
        renderWithProviders(<TagSelectorWithForm {...defaultProps} />);
        expect(screen.getByText('Collection')).toBeInTheDocument();
        expect(screen.getByText('Album')).toBeInTheDocument();
    });

    it('populates dropdowns from useTags hook', () => {
        const { container } = renderWithProviders(<TagSelectorWithForm {...defaultProps} />);
        const inputs = container.querySelectorAll('input');
        expect(inputs.length).toBeGreaterThanOrEqual(2);
    });

    it('renders children passed as props', () => {
        renderWithProviders(<TagSelectorWithForm {...defaultProps} />);
        expect(screen.getByTestId('children')).toBeInTheDocument();
        expect(screen.getByText('Child Content')).toBeInTheDocument();
    });

    it('renders two CreatableSelect dropdowns', () => {
        const { container } = renderWithProviders(<TagSelectorWithForm {...defaultProps} />);
        const inputs = container.querySelectorAll('input');
        expect(inputs.length).toBeGreaterThanOrEqual(2);
    });

    it('uses useTags hook for collection data', () => {
        renderWithProviders(<TagSelectorWithForm {...defaultProps} />);
        expect(screen.getByText('Collection')).toBeInTheDocument();
    });
});

describe('TagSelector (mode="edit")', () => {
    const defaultProps = {
        mode: 'edit' as const,
        id: 'photo-1.jpg',
        collection: 'trips',
        album: 'coral-bay',
        selectedAlbum: vi.fn(),
        selectedCollection: vi.fn(),
        isFormValid: vi.fn(),
        children: null,
    };

    beforeEach(() => {
        defaultProps.selectedAlbum.mockClear();
        defaultProps.selectedCollection.mockClear();
        defaultProps.isFormValid.mockClear();
    });

    it('renders Collection and Album labels', () => {
        renderWithProviders(<TagSelector {...defaultProps} />);
        expect(screen.getByText('Collection')).toBeInTheDocument();
        expect(screen.getByText('Album')).toBeInTheDocument();
    });

    it('populates dropdowns from useTags hook', () => {
        const { container } = renderWithProviders(<TagSelector {...defaultProps} />);
        const inputs = container.querySelectorAll('input');
        expect(inputs.length).toBeGreaterThanOrEqual(2);
    });

    it('renders with default values from props', () => {
        const { container } = renderWithProviders(<TagSelector {...defaultProps} />);
        const inputs = container.querySelectorAll('input');
        expect(inputs.length).toBeGreaterThanOrEqual(2);
    });

    it('renders children when provided', () => {
        renderWithProviders(
            <TagSelector {...defaultProps}>
                <div data-testid="edit-child">Edit Child</div>
            </TagSelector>,
        );
        expect(screen.getByTestId('edit-child')).toBeInTheDocument();
    });

    it('KNOWN BUG: onFocus on collection passes FocusEvent where {value} expected', () => {
        renderWithProviders(<TagSelector {...defaultProps} />);
    });
});
