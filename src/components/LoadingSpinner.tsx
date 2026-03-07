/**
 * LoadingSpinner — Conditionally visible full-width spinner with a
 * "Loading..." label. Used as a placeholder while async data fetches
 * are in progress.
 */
import React from 'react';

interface LoadingSpinnerProps {
    visible: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ visible }) => {
    if (!visible) return null;

    return (
        <div className="flex justify-center md-auto text-white">
            <span
                className="justify-center md-auto mt-[3.5em] mr-[4.4em] h-28 w-28 animate-spin rounded-full border-[9px] border-solid border-white border-current border-r-transparent"
            />
            <span className="relative top-[100px] right-[167px] uppercase">Loading...</span>
        </div>
    );
};

export default LoadingSpinner;
