import { createPortal } from "react-dom";
import { useState, useEffect } from "react";

export interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmButtonClass?: string;
}

export default function ConfirmationDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    confirmButtonClass = "bg-red-500 hover:bg-red-600",
}: ConfirmDialogProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        return () => setIsMounted(false);
    }, []);

    if (!isOpen || !isMounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <div
                className="fixed inset-0 bg-black/50"
                onClick={onClose}
                aria-hidden="true"
            />

            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-80 max-w-[90vw] z-10">
                <h3 className="text-lg font-medium mb-2">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {message}
                </p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-sm text-white rounded-md cursor-pointer ${confirmButtonClass}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
}
