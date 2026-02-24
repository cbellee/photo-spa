import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import LoadingSpinner from '../components/LoadingSpinner';
import { renderWithProviders } from './test-utils';

describe('LoadingSpinner', () => {
    it('renders loading text when visible', () => {
        renderWithProviders(<LoadingSpinner visible={true} />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders spinner animation when visible', () => {
        const { container } = renderWithProviders(<LoadingSpinner visible={true} />);
        const spinner = container.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
    });

    it('renders nothing when not visible', () => {
        const { container } = renderWithProviders(<LoadingSpinner visible={false} />);
        expect(container.innerHTML).toBe('');
    });
});
