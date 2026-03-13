/**
 * PhotoExifData — Parses a JSON string of EXIF metadata and renders it
 * as a scrollable key/value list inside a photo edit card.
 */
import React, { Fragment } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function PhotoExifData({ data }: { data: string | null | undefined }) {
    const { theme } = useTheme();
    if (data) {
        let parsed: Record<string, unknown>;
        try {
            parsed = JSON.parse(data);
        } catch {
            return (
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Invalid exif data</div>
            );
        }
        return (
            <Fragment>
                <hr className={`mt-2 ${theme === 'dark' ? 'border-surface-border' : 'border-surface-light-border'}`} />
                <div className="max-h-40 overflow-y-auto mt-2 pr-1 space-y-0.5">
                    {
                        Object.entries(parsed).map(([key, value]) => (
                            <div className='text-left text-xs' key={key}>
                                <span className={`font-normal ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{key}: </span>
                                <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{value as string}</span>
                            </div>
                        ))
                    }
                </div>
            </Fragment>
        );
    } else {
        return (
            <div className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>No exif data available</div>
        );
    }
}