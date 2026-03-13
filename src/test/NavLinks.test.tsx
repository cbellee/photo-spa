import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import NavLinks from '../components/NavLinks';
import { renderWithProviders } from './test-utils';

describe('NavLinks', () => {
    it('renders collections links when unauthenticated', () => {
        renderWithProviders(<NavLinks isAuthenticated={false} />);
        expect(screen.getByText('collections')).toBeInTheDocument();
    });

    it('does not render upload link when unauthenticated', () => {
        renderWithProviders(<NavLinks isAuthenticated={false} />);
        expect(screen.queryByText('upload')).not.toBeInTheDocument();
    });

    it('renders upload link when authenticated', () => {
        renderWithProviders(<NavLinks isAuthenticated={true} />);
        expect(screen.getByText('upload')).toBeInTheDocument();
    });

    it('renders both links when authenticated', () => {
        renderWithProviders(<NavLinks isAuthenticated={true} />);
        expect(screen.getByText('upload')).toBeInTheDocument();
        expect(screen.getByText('collections')).toBeInTheDocument();
    });

    it('renders separators between links', () => {
        renderWithProviders(<NavLinks isAuthenticated={true} />);
        const separators = screen.getAllByText('I');
        // 2 items = 1 separator
        expect(separators.length).toBe(1);
    });
});
