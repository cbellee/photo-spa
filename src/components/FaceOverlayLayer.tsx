/**
 * FaceOverlayLayer — Renders bounding-box rectangles over a photo to
 * highlight detected faces. Each box shows the person's name on hover.
 * The boxes use percentage-based positioning so they scale with the image.
 */
import React, { useState, useEffect } from 'react';
import { fetchFaceOverlays } from '../services/faceService';
import type { FaceOverlay } from '../types';

interface FaceOverlayLayerProps {
    /** Collection name of the photo */
    collection: string;
    /** Album name of the photo */
    album: string;
    /** Filename of the photo */
    name: string;
    /** Whether face overlays are visible */
    visible?: boolean;
}

const FaceOverlayLayer: React.FC<FaceOverlayLayerProps> = ({
    collection,
    album,
    name,
    visible = true,
}) => {
    const [overlays, setOverlays] = useState<FaceOverlay[]>([]);
    const [hoveredFace, setHoveredFace] = useState<string | null>(null);

    useEffect(() => {
        if (!collection || !album || !name || !visible) {
            setOverlays([]);
            return;
        }

        fetchFaceOverlays(collection, album, name)
            .then(data => setOverlays(data ?? []))
            .catch(err => {
                console.error('Error fetching face overlays:', err);
                setOverlays([]);
            });
    }, [collection, album, name, visible]);

    if (!visible || overlays.length === 0) return null;

    return (
        <div className="absolute inset-0 pointer-events-none">
            {overlays.map((face) => (
                <div
                    key={face.faceID}
                    className="absolute pointer-events-auto cursor-pointer"
                    style={{
                        left: `${face.bbox.x * 100}%`,
                        top: `${face.bbox.y * 100}%`,
                        width: `${face.bbox.w * 100}%`,
                        height: `${face.bbox.h * 100}%`,
                    }}
                    onMouseEnter={() => setHoveredFace(face.faceID)}
                    onMouseLeave={() => setHoveredFace(null)}
                >
                    {/* Bounding box border */}
                    <div
                        className={`absolute inset-0 border-2 rounded-sm transition-opacity duration-200 ${
                            hoveredFace === face.faceID
                                ? 'border-orange-400 opacity-100'
                                : 'border-white/60 opacity-60'
                        }`}
                    />

                    {/* Name label */}
                    {hoveredFace === face.faceID && face.personName && (
                        <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 text-white text-xs px-2 py-1 rounded-md shadow-lg">
                            {face.personName}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default FaceOverlayLayer;
