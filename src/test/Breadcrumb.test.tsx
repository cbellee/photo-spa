import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import Breadcrumb from '../components/Breadcrumb';
import { renderWithProviders } from './test-utils';

describe('Breadcrumb', () => {
    it('renders a single segment without separator', () => {
        renderWithProviders(
            <Breadcrumb segments={[{ label: 'Collections' }]} />,
        );
        expect(screen.getByText('Collections')).toBeInTheDocument();
        expect(screen.queryByText('>')).not.toBeInTheDocument();
    });

    it('renders multiple segments with separators', () => {
        renderWithProviders(
            <Breadcrumb segments={[
                { label: 'Collections', to: '/' },
                { label: 'trips', to: '/trips' },
                { label: 'coral-bay' },
            ]} />,
        );
        expect(screen.getByText('Collections')).toBeInTheDocument();
        expect(screen.getByText('trips')).toBeInTheDocument();
        expect(screen.getByText('coral-bay')).toBeInTheDocument();
        expect(screen.getAllByText('>').length).toBe(2);
    });

    it('renders linked segments as anchor tags', () => {
        renderWithProviders(
            <Breadcrumb segments={[
                { label: 'Collections', to: '/' },
                { label: 'trips' },
            ]} />,
        );
        const link = screen.getByText('Collections');
        expect(link.closest('a')).toHaveAttribute('href', '/');
    });

    it('renders non-linked segments as plain text', () => {
        renderWithProviders(
            <Breadcrumb segments={[{ label: 'trips' }]} />,
        );
        const text = screen.getByText('trips');
        expect(text.closest('a')).toBeNull();
    });

    it('applies uppercase styling', () => {
        renderWithProviders(
            <Breadcrumb segments={[{ label: 'Collections' }]} />,
        );
        const text = screen.getByText('Collections');
        expect(text.className).toContain('uppercase');
    });
});
