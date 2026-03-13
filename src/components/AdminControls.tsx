/**
 * AdminControls — Inline admin toolbar for collections and albums.
 * Provides: rename, soft-delete, rotate thumbnail, change thumbnail image.
 * When the item is deleted, shows a restore button instead.
 * Shown only to authenticated users.
 */
import React, { useState } from 'react';
import { FaArrowRotateRight, FaPen, FaTrashCan, FaImages, FaCheck, FaXmark, FaArrowRotateLeft } from 'react-icons/fa6';
import { useTheme } from '../context/ThemeContext';

interface AdminControlsProps {
    /** Current name of the collection or album */
    name: string;
    /** Called when user confirms a rename */
    onRename: (newName: string) => Promise<void>;
    /** Called when user confirms soft-delete */
    onDelete: () => Promise<void>;
    /** Called when user clicks the rotate thumbnail button */
    onRotateThumbnail: () => Promise<void>;
    /** Called when user wants to pick a new thumbnail image */
    onChangeThumbnail: () => void;
    /** Whether admin controls should be shown */
    visible: boolean;
    /** Whether this item is currently soft-deleted */
    isDeleted?: boolean;
    /** Called when user wants to restore a deleted item */
    onUndelete?: () => Promise<void>;
}

const AdminControls: React.FC<AdminControlsProps> = ({
    name,
    onRename,
    onDelete,
    onRotateThumbnail,
    onChangeThumbnail,
    visible,
    isDeleted = false,
    onUndelete,
}) => {
    const { theme } = useTheme();
    const [isRenaming, setIsRenaming] = useState(false);
    const [newName, setNewName] = useState(name);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isBusy, setIsBusy] = useState(false);

    if (!visible) return null;

    const dark = theme === 'dark';
    const btnBase = `p-1.5 rounded-md transition-colors ${dark ? 'hover:bg-surface-cardHover text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`;

    const handleRename = async () => {
        if (newName.trim() === '' || newName === name) {
            setIsRenaming(false);
            return;
        }
        setIsBusy(true);
        try {
            await onRename(newName.trim());
        } finally {
            setIsBusy(false);
            setIsRenaming(false);
        }
    };

    const handleDelete = async () => {
        setIsBusy(true);
        try {
            await onDelete();
        } finally {
            setIsBusy(false);
            setIsDeleting(false);
        }
    };

    const handleUndelete = async () => {
        if (!onUndelete) return;
        setIsBusy(true);
        try {
            await onUndelete();
        } finally {
            setIsBusy(false);
        }
    };

    // Deleted items only show the restore button.
    if (isDeleted) {
        return (
            <div className={`flex items-center gap-1 mt-1 ${isBusy ? 'opacity-50 pointer-events-none' : ''}`}>
                <button
                    className={`${btnBase} text-green-500 hover:text-green-400`}
                    onClick={handleUndelete}
                    title="Restore"
                >
                    <FaArrowRotateLeft size={12} />
                </button>
                <span className={`text-xs ${dark ? 'text-red-400' : 'text-red-600'}`}>Deleted</span>
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-1 mt-1 ${isBusy ? 'opacity-50 pointer-events-none' : ''}`}>
            {isRenaming ? (
                <div className="flex items-center gap-1">
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRename();
                            if (e.key === 'Escape') { setIsRenaming(false); setNewName(name); }
                        }}
                        className={`text-xs px-1.5 py-0.5 rounded-md border outline-none w-28 ${dark ? 'bg-surface text-white border-surface-border focus:border-accent' : 'bg-white text-gray-800 border-surface-light-border focus:border-accent'}`}
                        autoFocus
                    />
                    <button className={`${btnBase} text-green-500`} onClick={handleRename} title="Confirm rename">
                        <FaCheck size={12} />
                    </button>
                    <button className={`${btnBase} text-red-400`} onClick={() => { setIsRenaming(false); setNewName(name); }} title="Cancel">
                        <FaXmark size={12} />
                    </button>
                </div>
            ) : isDeleting ? (
                <div className="flex items-center gap-1">
                    <span className={`text-xs ${dark ? 'text-red-400' : 'text-red-600'}`}>Delete?</span>
                    <button className={`${btnBase} text-red-500`} onClick={handleDelete} title="Confirm delete">
                        <FaCheck size={12} />
                    </button>
                    <button className={`${btnBase}`} onClick={() => setIsDeleting(false)} title="Cancel">
                        <FaXmark size={12} />
                    </button>
                </div>
            ) : (
                <>
                    <button className={btnBase} onClick={() => { setNewName(name); setIsRenaming(true); }} title="Rename">
                        <FaPen size={12} />
                    </button>
                    <button className={`${btnBase} hover:text-red-500`} onClick={() => setIsDeleting(true)} title="Delete">
                        <FaTrashCan size={12} />
                    </button>
                    <button className={btnBase} onClick={onRotateThumbnail} title="Rotate thumbnail">
                        <FaArrowRotateRight size={12} />
                    </button>
                    <button className={btnBase} onClick={onChangeThumbnail} title="Change thumbnail">
                        <FaImages size={12} />
                    </button>
                </>
            )}
        </div>
    );
};

export default AdminControls;
