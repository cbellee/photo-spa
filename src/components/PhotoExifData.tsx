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
                <div className={`${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Invalid exif data</div>
            );
        }
        return (
            <Fragment>
                <hr className={`mt-2 ${theme === 'dark' ? 'border-gray-500' :  'border-gray-400'}`} />
                <div className="max-h-40 overflow-y-auto mt-2 pr-1">
                    {
                        Object.entries(parsed).map(([key, value]) => (
                            <div className='text-left text-sm' key={key}>
                                <span className='font-light flex'>{key}: </span>
                                <span className='font-semibold'>{value as string}</span>
                            </div>
                        ))
                    }
                </div>
            </Fragment>
        );
    } else {
        return (
            <div className={`${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>No exif data available</div>
        );
    }
}