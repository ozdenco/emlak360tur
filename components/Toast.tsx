
import React, { useEffect, useState } from 'react';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(true);
        const timer = setTimeout(() => {
            setVisible(false);
            // Allow time for fade-out animation before calling onClose
            setTimeout(onClose, 300);
        }, 3000);

        return () => clearTimeout(timer);
    }, [message, type, onClose]);

    const baseClasses = "fixed bottom-5 right-5 p-4 rounded-lg shadow-2xl text-white font-semibold transition-all duration-300 transform z-[100]";
    const typeClasses = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500'
    };
    const visibilityClasses = visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0';

    return (
        <div className={`${baseClasses} ${typeClasses[type]} ${visibilityClasses}`}>
            {message}
        </div>
    );
};

export default Toast;
