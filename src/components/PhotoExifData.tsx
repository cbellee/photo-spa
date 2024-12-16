import React, { Fragment } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function PhotoExifData({ data }) {
    const { theme } = useTheme();
    if (data) {
        return (
            <Fragment>
                <hr className={`mt-2 pt-2 ${theme === 'dark' ? 'border-gray-500' :  'border-gray-400'}`} />
                <span className='font-semibold mb-2'>Exif</span>
                {
                    Object.entries(JSON.parse(data)).map(([key, value]) => (
                        <div className='text-left text-sm' key={key}>
                            <span className='font-light flex'>{key}: </span>
                            <span className='font-semibold'>{value as string}</span>
                        </div>
                    ))
                }
            </Fragment>
        );
    } else {
        return (
            <div className={`${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>No exif data available</div>
        );
    }
    return null;
}