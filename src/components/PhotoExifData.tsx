import React, { Fragment } from 'react';

export default function PhotoExifData({ data }) {
    if (data) {
        return (
            <Fragment>
                <hr className="mt-2 pt-2" />
                <span className='font-semibold mb-2'>Exif</span>
                {
                    Object.entries(JSON.parse(data)).map(([key, value]) => (
                        <div className='text-left text-sm' key={key}>
                            <span className='text-gray-300 font-light flex'>{key}: </span>
                            <span className='text-white font-semibold'>{value as string}</span>
                        </div>
                    ))
                }
            </Fragment>
        );
    } else {
        return (
            <div className='text-white'>No exif data available</div>
        );
    }
    return null;
}