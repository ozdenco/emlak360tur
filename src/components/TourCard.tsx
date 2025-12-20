
import React, { useEffect, useState } from 'react';
import { Tour } from '../types';

interface TourCardProps {
    tour: Tour;
    onEdit: (tourId: string) => void;
    onDelete: (tourId: string) => void;
    onView: (tourId: string) => void;
}

const TourCard: React.FC<TourCardProps> = ({ tour, onEdit, onDelete, onView }) => {
    const [imageSrc, setImageSrc] = useState<string | null>(tour.thumbnailUrl);

    useEffect(() => {
        setImageSrc(tour.thumbnailUrl);
        // Clean up the object URL when the component unmounts or the URL changes
        return () => {
            if (tour.thumbnailUrl && tour.thumbnailUrl.startsWith('blob:')) {
                URL.revokeObjectURL(tour.thumbnailUrl);
            }
        };
    }, [tour.thumbnailUrl]);

    return (
        <div className="bg-white/5 backdrop-blur-md border border-gold/20 rounded-2xl overflow-hidden transition-all duration-300 hover:border-gold hover:-translate-y-2 hover:shadow-2xl hover:shadow-navy-light">
            <div className="w-full h-56 bg-navy-light flex items-center justify-center">
                 {imageSrc ? (
                    <img src={imageSrc} alt={tour.title} className="w-full h-full object-cover" />
                 ) : (
                    <span className="text-light-gray">Fotoğraf yok</span>
                 )}
            </div>
            <div className="p-6">
                <h3 className="text-xl font-bold truncate mb-1">{tour.title}</h3>
                <p className="text-light-gray text-sm mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="O O 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {tour.location}
                </p>
                <div className="flex justify-between items-center py-4 border-y border-gold/20">
                    <div className="text-center">
                        <div className="font-bold text-2xl text-gold">{tour.views}</div>
                        <div className="text-xs text-light-gray uppercase">Görüntülenme</div>
                    </div>
                     <div className="text-center">
                        <div className="font-bold text-2xl text-gold">{tour.shares}</div>
                        <div className="text-xs text-light-gray uppercase">Paylaşım</div>
                    </div>
                     <div className="text-center">
                        <div className="font-bold text-2xl text-gold">{tour.photoCount}</div>
                        <div className="text-xs text-light-gray uppercase">Fotoğraf</div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                    <button onClick={() => onView(tour.id)} className="col-span-2 w-full text-center py-2 bg-white/5 border border-gold/30 rounded-lg hover:bg-gold/20 transition-colors">👁️ Görüntüle</button>
                    <button onClick={() => onEdit(tour.id)} className="py-2 bg-white/5 border border-gold/30 rounded-lg hover:bg-gold/20 transition-colors">✏️ Düzenle</button>
                    <button onClick={() => onDelete(tour.id)} className="py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors">🗑️ Sil</button>
                </div>
            </div>
        </div>
    );
};

export default TourCard;
