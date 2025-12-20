
import React from 'react';

interface StatCardProps {
    icon: string;
    value: string;
    label: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label }) => {
    return (
        <div className="bg-white/5 backdrop-blur-md border border-gold/20 rounded-2xl p-6 transition-all duration-300 hover:border-gold hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold to-transparent"></div>
            <div className="text-4xl mb-4">{icon}</div>
            <div className="text-4xl font-bold text-gold mb-1">{value}</div>
            <div className="text-sm text-light-gray uppercase tracking-wider">{label}</div>
        </div>
    );
};

export default StatCard;
