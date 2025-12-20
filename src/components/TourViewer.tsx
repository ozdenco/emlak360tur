import React, { useState, useMemo, useEffect, useRef } from 'react';
// FIX: Removed .ts extension from import to use standard module resolution.
// FIX: Added .ts extension to imports to fix module resolution errors.
// FIX: Removed .ts extension from imports for proper module resolution.
import { TourWithPhotos } from '../types';
import { db } from '../services/db';

// Pannellum'un global scope'ta olacağını varsayıyoruz (index.html'den yüklendi)
declare global {
    interface Window {
        pannellum: any;
    }
}

interface TourViewerProps {
    tour: TourWithPhotos;
    onClose: () => void;
}

const TourViewer: React.FC<TourViewerProps> = ({ tour, onClose }) => {
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const pannellumContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        db.incrementTourViews(tour.id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tour.id]);

    const tourPhotos = useMemo(() => {
        return tour.photos
            .filter(p => p.includeInTour)
            .sort((a, b) => a.tourOrder - b.tourOrder);
    }, [tour.photos]);

    const currentPhoto = tourPhotos[currentPhotoIndex];
    const imageUrl = useMemo(() => {
        if (!currentPhoto) return '';
        return URL.createObjectURL(currentPhoto.file);
    }, [currentPhoto]);

    useEffect(() => {
        let viewer: any = null;

        if (imageUrl && pannellumContainerRef.current) {
            viewer = window.pannellum.viewer(pannellumContainerRef.current, {
                "type": "equirectangular",
                "panorama": imageUrl,
                "autoLoad": true,
                "pitch": 0,
                "yaw": 0,
                "hfov": 110,
                "showZoomCtrl": false,
                "showFullscreenCtrl": false,
            });
        }

        // Cleanup function
        return () => {
            if (viewer) {
                viewer.destroy();
            }
            if (imageUrl) {
                URL.revokeObjectURL(imageUrl);
            }
        };
    }, [imageUrl]);


    const goToNext = () => {
        setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % tourPhotos.length);
    };

    const goToPrev = () => {
        setCurrentPhotoIndex((prevIndex) => (prevIndex - 1 + tourPhotos.length) % tourPhotos.length);
    };
    
    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: tour.title,
                    text: `Emlak360 ile oluşturulan "${tour.title}" sanal turuna göz atın!`,
                });
                await db.incrementTourShares(tour.id);
            } catch (error) {
                console.log('Paylaşım iptal edildi veya başarısız oldu.', error);
            }
        } else {
            alert('Bu tarayıcı paylaşım özelliğini desteklemiyor.');
        }
    };

    if (!currentPhoto) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-navy z-[100] flex flex-col">
            <header className="flex-shrink-0 bg-navy-light/80 backdrop-blur-md border-b border-gold/20 p-4 flex justify-between items-center">
                 <div>
                    <h2 className="font-serif text-2xl text-gold">{tour.title}</h2>
                    <p className="text-light-gray">{tour.location}</p>
                </div>
                <div className="flex items-center gap-4">
                    {navigator.share && (
                         <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-gold/30 rounded-lg hover:bg-gold/20 transition-all duration-300">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
                             Paylaş
                         </button>
                    )}
                    <button onClick={onClose} className="text-3xl font-bold text-white/50 hover:text-white transition-colors">&times;</button>
                </div>
            </header>
            
            <div className="flex-grow relative">
                <div ref={pannellumContainerRef} style={{ width: '100%', height: '100%' }}></div>

                {tourPhotos.length > 1 && (
                    <>
                        <button onClick={goToPrev} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-4 rounded-full text-2xl hover:bg-black/80 transition-colors">
                            &#8249;
                        </button>
                        <button onClick={goToNext} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-4 rounded-full text-2xl hover:bg-black/80 transition-colors">
                            &#8250;
                        </button>
                    </>
                )}
                 <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-6 py-2 rounded-full font-semibold">
                    {currentPhotoIndex + 1} / {tourPhotos.length}
                </div>
            </div>
        </div>
    );
};

export default TourViewer;
