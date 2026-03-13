import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import NavLinks from '../components/NavLinks';
import { renderWithProviders } from './test-utils';

describe('NavLinks', () => {
    it('renders Collections links when unauthenticated', () => {
        renderWithProviders(<NavLinks isAuthenticated={false} />);
        expect(screen.getByText('Collections')).toBeInTheDocument();
    });

    it('does not render Upload link when unauthenticated', () => {
        renderWithProviders(<NavLinks isAuthenticated={false} />);
        expect(screen.queryByText('Upload')).not.toBeInTheDocument();
    });

    it('renders Upload link when authenticated', () => {
        renderWithProviders(<NavLinks isAuthenticated={true} />);
        expect(screen.getByText('Upload')).toBeInTheDocument();
    });

    it('renders bothlinks when authenticated', () => {
        renderWithProviders(<NavLinks isAuthenticated={true} />);
        expect(screen.getByText('Upload')).toBeInTheDocument();
        expect(screen.getByText('Collections')).toBeInTheDocument();
    });

    it('renders separators between links', () => {
        renderWithProviders(<NavLinks isAuthenticated={true} />);
        const separators = screen.getAllByText('I');
        // 2 items = 1 separator
        expect(separators.length).toBe(1);
    });
});
