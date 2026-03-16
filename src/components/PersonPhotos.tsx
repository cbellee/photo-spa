/**
 * PersonPhotos — Shows all photos containing a specific person.
 * Displays the person's name at the top with an admin-editable name
 * field. The photo grid links back to the full album view.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { fetchPerson, fetchPersonPhotos, setPersonName } from '../services/faceService';
import { apiConfig } from '../config/apiConfig';
import type { Person, PhotoRef, PersonRouteParams } from '../types';
import LoadingSpinner from './LoadingSpinner';
import Breadcrumb from './Breadcrumb';
import LazyImage from './LazyImage';

const PAGE_SIZE = 50;

const PersonPhotos: React.FC = () => {
    const { personID } = useParams<PersonRouteParams>();
    const [person, setPerson] = useState<Person | null>(null);
    const [photos, setPhotos] = useState<PhotoRef[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [editingName, setEditingName] = useState(false);
    const [nameInput, setNameInput] = useState('');
    const { theme } = useTheme();
    const { isAuthenticated, token } = useAuth();

    const storageUrl = apiConfig.storageApiEndpoint;

    const loadMore = useCallback(async () => {
        if (!personID || !hasMore) return;
        try {
            const refs = await fetchPersonPhotos(personID, photos.length, PAGE_SIZE);
            if (refs.length < PAGE_SIZE) setHasMore(false);
            setPhotos(prev => [...prev, ...refs]);
        } catch (err) {
            console.error('Error loading person photos:', err);
        }
    }, [personID, photos.length, hasMore]);

    useEffect(() => {
        if (!personID) return;
        setIsLoading(true);
        Promise.all([
            fetchPerson(personID),
            fetchPersonPhotos(personID, 0, PAGE_SIZE),
        ]).then(([p, refs]) => {
            setPerson(p);
            setNameInput(p.name || '');
            setPhotos(refs);
            if (refs.length < PAGE_SIZE) setHasMore(false);
        }).catch(err => {
            console.error('Error loading person:', err);
        }).finally(() => setIsLoading(false));
    }, [personID]);

    const handleSaveName = async () => {
        if (!personID || !token || !nameInput.trim()) return;
        try {
            await setPersonName(personID, nameInput.trim(), token);
            setPerson(prev => prev ? { ...prev, name: nameInput.trim() } : prev);
            setEditingName(false);
        } catch (err) {
            console.error('Error setting person name:', err);
        }
    };

    /** Build an image URL from a PhotoRef. */
    const photoSrc = (ref: PhotoRef) =>
        `${storageUrl}/images/${ref.collection}/${ref.album}/${ref.name}`;

    const cardClasses = theme === 'dark'
        ? 'bg-surface-card border border-surface-border shadow-card hover:shadow-card-hover'
        : 'bg-surface-light-card border border-surface-light-border shadow-card-light hover:shadow-card-light-hover';
    const textColor = theme === 'dark' ? 'text-gray-200' : 'text-gray-700';
    const subtextColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
    const inputClasses = theme === 'dark'
        ? 'bg-surface text-white border-surface-border focus:border-accent'
        : 'bg-gray-50 text-gray-800 border-surface-light-border focus:border-accent';

    return (
        <div className="animate-appear">
            <Breadcrumb segments={[
                { label: 'people', to: '/people' },
                { label: person?.name || 'Unknown' },
            ]} />

            <LoadingSpinner visible={isLoading} />

            {!isLoading && person && (
                <>
                    {/* Person header */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${
                            theme === 'dark' ? 'bg-accent/20 text-accent-light' : 'bg-accent/10 text-accent'
                        }`}>
                            {person.name ? person.name.charAt(0).toUpperCase() : '?'}
                        </div>

                        <div>
                            {editingName ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={nameInput}
                                        onChange={(e) => setNameInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                                        className={`px-2 py-1 rounded-md text-sm border outline-none ${inputClasses}`}
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleSaveName}
                                        className="text-xs px-2 py-1 rounded bg-accent text-white hover:bg-accent/80"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => { setEditingName(false); setNameInput(person.name || ''); }}
                                        className={`text-xs px-2 py-1 rounded ${theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-800'}`}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <h2
                                    className={`text-lg font-semibold ${textColor} ${isAuthenticated ? 'cursor-pointer hover:underline' : ''}`}
                                    onClick={() => isAuthenticated && setEditingName(true)}
                                    title={isAuthenticated ? 'Click to rename' : undefined}
                                >
                                    {person.name || 'Unknown Person'}
                                </h2>
                            )}
                            <p className={`text-xs ${subtextColor}`}>
                                {person.faceCount} {person.faceCount === 1 ? 'appearance' : 'appearances'}
                            </p>
                        </div>
                    </div>

                    {/* Photo grid */}
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 pb-8">
                        {photos.map((ref, idx) => (
                            <Link
                                key={`${ref.collection}/${ref.album}/${ref.name}-${idx}`}
                                to={`/${ref.collection}/${ref.album}`}
                                className={`block rounded-md overflow-hidden transition-all duration-300 ${cardClasses}`}
                            >
                                <div className={`relative h-[180px] w-full ${theme === 'dark' ? 'bg-surface' : 'bg-gray-50'}`}>
                                    <LazyImage
                                        alt={ref.name}
                                        src={photoSrc(ref)}
                                        wrapperClassName="absolute inset-0 flex items-center justify-center"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className={`px-3 py-2 ${subtextColor}`}>
                                    <p className="text-xs truncate">{ref.collection} / {ref.album}</p>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Load more */}
                    {hasMore && (
                        <div className="flex justify-center pb-8">
                            <button
                                onClick={loadMore}
                                className={`px-4 py-2 rounded-md text-sm transition-colors ${
                                    theme === 'dark'
                                        ? 'bg-surface-card border border-surface-border text-gray-300 hover:bg-surface'
                                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                Load more
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default PersonPhotos;
