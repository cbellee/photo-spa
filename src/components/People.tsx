/**
 * People — Displays all detected persons as a grid. Each card shows the
 * person's name (or "Unknown" if unnamed) and face count. Clicking a
 * person navigates to their photos. Includes a search bar for filtering
 * by name prefix.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { fetchPeople, searchPeople } from '../services/faceService';
import type { Person } from '../types';
import LoadingSpinner from './LoadingSpinner';
import Breadcrumb from './Breadcrumb';

const People: React.FC = () => {
    const [people, setPeople] = useState<Person[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { theme } = useTheme();

    const loadPeople = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = searchQuery.trim()
                ? await searchPeople(searchQuery.trim())
                : await fetchPeople();
            setPeople(data ?? []);
        } catch (err) {
            console.error('Error loading people:', err);
            setPeople([]);
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery]);

    useEffect(() => {
        const timer = setTimeout(loadPeople, searchQuery ? 300 : 0);
        return () => clearTimeout(timer);
    }, [loadPeople, searchQuery]);

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
            <Breadcrumb segments={[{ label: 'people' }]} />

            {/* Search bar */}
            <div className="mb-6 max-w-md">
                <input
                    type="text"
                    placeholder="Search people by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full px-3 py-2 rounded-md text-sm border outline-none transition-colors ${inputClasses}`}
                />
            </div>

            <LoadingSpinner visible={isLoading} />

            {!isLoading && people.length === 0 && (
                <p className={`text-center py-12 ${subtextColor}`}>
                    {searchQuery ? 'No people match your search.' : 'No people detected yet.'}
                </p>
            )}

            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-5 pb-8">
                {people.map((person) => (
                    <Link
                        key={person.personID}
                        to={`/people/${person.personID}`}
                        className={`flex flex-col items-center p-5 rounded-lg transition-all duration-300 ${cardClasses}`}
                    >
                        {/* Avatar circle with initials */}
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mb-3 ${
                            theme === 'dark' ? 'bg-accent/20 text-accent-light' : 'bg-accent/10 text-accent'
                        }`}>
                            {person.name
                                ? person.name.charAt(0).toUpperCase()
                                : '?'}
                        </div>

                        <span className={`font-medium text-sm text-center truncate w-full ${textColor}`}>
                            {person.name || 'Unknown'}
                        </span>

                        <span className={`text-xs mt-1 ${subtextColor}`}>
                            {person.faceCount} {person.faceCount === 1 ? 'photo' : 'photos'}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default People;
