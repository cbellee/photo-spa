import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import MobileMenu from '../components/MobileMenu';
import { renderWithProviders } from './test-utils';

// Mock SignInAndOut
vi.mock('../components/SignInAndOut', () => ({
    default: () => <span data-testid="sign-in-out">SignInAndOut</span>,
}));

describe('MobileMenu', () => {
    const defaultProps = {
        isOpen: true,
        isAuthenticated: false,
        onClose: vi.fn(),
    };

    beforeEach(() => {
        defaultProps.onClose.mockClear();
    });

    it('renders Collections link', () => {
        renderWithProviders(<MobileMenu {...defaultProps} />);
        expect(screen.getByText('Collections')).toBeInTheDocument();
    });

    it('does not render Upload link when unauthenticated', () => {
        renderWithProviders(<MobileMenu {...defaultProps} />);
        expect(screen.queryByText('Upload')).not.toBeInTheDocument();
    });

    it('renders Upload link when authenticated', () => {
        renderWithProviders(<MobileMenu {...{ ...defaultProps, isAuthenticated: true }} />);
        expect(screen.getByText('Upload')).toBeInTheDocument();
    });

    it('renders SignInAndOut component', () => {
        renderWithProviders(<MobileMenu {...defaultProps} />);
        expect(screen.getByTestId('sign-in-out')).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
        const { container } = renderWithProviders(<MobileMenu {...defaultProps} />);
        const closeBtn = container.querySelector('.absolute.top-0.right-0') as HTMLElement;
        fireEvent.click(closeBtn);
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('applies showMenuNav class when open', () => {
        const { container } = renderWithProviders(<MobileMenu {...defaultProps} />);
        expect(container.querySelector('.showMenuNav')).toBeInTheDocument();
    });

    it('applies hideMenuNav class when closed', () => {
        const { container } = renderWithProviders(
            <MobileMenu {...{ ...defaultProps, isOpen: false }} />,
        );
        expect(container.querySelector('.hideMenuNav')).toBeInTheDocument();
    });
});
