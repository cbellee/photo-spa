import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import TagSelect from '../components/TagSelect';
import { renderWithProviders } from './test-utils';
import { FormProvider, useForm } from 'react-hook-form';

// Mock useTags hook
vi.mock('../hooks/useTags', () => ({
    useTags: () => ({
        collectionAlbumData: new Map([
            ['trips', ['coral-bay', 'hong-kong']],
            ['sport', ['parasailing']],
        ]),
    }),
}));

/** Wrapper that provides FormProvider context required by TagSelect */
function TagSelectWithForm(props: any) {
    const methods = useForm();
    return (
        <FormProvider {...methods}>
            <TagSelect {...props} />
        </FormProvider>
    );
}

/**
 * @deprecated TagSelect is superseded by TagSelector.
 * These tests verify the legacy component still works.
 */
describe('TagSelect', () => {
    const defaultProps = {
        selectedCollection: vi.fn(),
        selectedAlbum: vi.fn(),
    };

    beforeEach(() => {
        defaultProps.selectedCollection.mockClear();
        defaultProps.selectedAlbum.mockClear();
    });

    it('renders Collection and Album labels', () => {
        renderWithProviders(<TagSelectWithForm {...defaultProps} />);
        expect(screen.getByText('Collection:')).toBeInTheDocument();
        expect(screen.getByText('Album:')).toBeInTheDocument();
    });

    it('renders two CreatableSelect dropdowns (input elements)', () => {
        const { container } = renderWithProviders(
            <TagSelectWithForm {...defaultProps} />
        );
        const inputs = container.querySelectorAll('input');
        expect(inputs.length).toBeGreaterThanOrEqual(2);
    });

    it('renders children passed as props', () => {
        renderWithProviders(
            <TagSelectWithForm {...defaultProps}>
                <button data-testid="child-btn">Upload</button>
            </TagSelectWithForm>
        );
        expect(screen.getByTestId('child-btn')).toBeInTheDocument();
        expect(screen.getByText('Upload')).toBeInTheDocument();
    });

    it('applies dark theme background by default', () => {
        const { container } = renderWithProviders(
            <TagSelectWithForm {...defaultProps} />
        );
        const wrapper = container.querySelector('.bg-gray-700, .bg-gray-400');
        expect(wrapper).toBeTruthy();
    });

    it('renders without crashing when no children are passed', () => {
        const { container } = renderWithProviders(
            <TagSelectWithForm {...defaultProps} />
        );
        expect(container.firstChild).toBeTruthy();
    });
});
