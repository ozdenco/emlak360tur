
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Photo } from '../types';

interface ImagePreviewProps {
    photos: Photo[];
    setPhotos: React.Dispatch<React.SetStateAction<Photo[]>>;
    showToast: (message: string, type: 'error' | 'success' | 'info') => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ photos, setPhotos, showToast }) => {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newPhotos: Photo[] = acceptedFiles
            .filter(file => {
                if (file.size > 10 * 1024 * 1024) {
                    showToast(`Dosya boyutu çok büyük: ${file.name} (Maks 10MB)`, 'error');
                    return false;
                }
                return true;
            })
            .map((file, index) => ({
                file,
                previewUrl: URL.createObjectURL(file),
                includeInTour: true,
                tourOrder: photos.length + index
            }));
        setPhotos(prev => [...prev, ...newPhotos]);
    }, [photos.length, setPhotos, showToast]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.jpg', '.png'] }
    });

    const removePhoto = (index: number) => {
        const photoToRemove = photos[index];
        URL.revokeObjectURL(photoToRemove.previewUrl);
        setPhotos(photos.filter((_, i) => i !== index));
    };

    const toggleTourInclusion = (index: number) => {
        const newPhotos = [...photos];
        newPhotos[index].includeInTour = !newPhotos[index].includeInTour;
        setPhotos(newPhotos);
    };
    
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDropOnItem = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
        e.preventDefault();
        if (draggedIndex === null) return;
        
        const draggedItem = photos[draggedIndex];
        const newPhotos = photos.filter((_, i) => i !== draggedIndex);
        newPhotos.splice(targetIndex, 0, draggedItem);
        
        // Re-assign tourOrder for included photos
        let currentOrder = 0;
        const reorderedPhotos = newPhotos.map(p => {
            if (p.includeInTour) {
                return { ...p, tourOrder: currentOrder++ };
            }
            return p;
        });

        setPhotos(reorderedPhotos);
        setDraggedIndex(null);
    };

    const tourPhotos = photos.filter(p => p.includeInTour).sort((a,b) => a.tourOrder - b.tourOrder);

    return (
        <div>
            <label className="form-label">Fotoğraflar</label>
            <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${isDragActive ? 'border-gold bg-gold/10' : 'border-gold/30 hover:border-gold'}`}>
                <input {...getInputProps()} />
                <div className="text-6xl mb-2">📸</div>
                <p className="font-semibold">Fotoğrafları sürükleyin veya tıklayıp seçin</p>
                <p className="text-sm text-light-gray">JPG, PNG - Maks 10MB/dosya</p>
            </div>

            {photos.length > 0 && (
                <div className="mt-4 p-4 bg-brand-blue/10 border-2 border-brand-blue/30 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-lg text-brand-blue">Tur Fotoğrafları</h3>
                        <div className="bg-brand-blue/20 text-brand-blue font-bold px-4 py-1 rounded-full">
                            <span className="text-white">{tourPhotos.length}</span> / {photos.length}
                        </div>
                    </div>
                     <div className="text-sm text-white/80 p-3 bg-brand-blue/10 border-l-4 border-brand-blue rounded-md">
                        <strong>💡 İpucu:</strong> Sanal tura eklemek istediğiniz fotoğrafları seçin. Mavi kenarlı fotoğrafları sürükleyerek sıralayabilirsiniz.
                    </div>
                </div>
            )}
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
                {photos.map((photo, index) => {
                    const tourIndex = tourPhotos.findIndex(p => p.previewUrl === photo.previewUrl);
                    return (
                        <div key={photo.previewUrl} 
                             className={`relative group aspect-square rounded-lg overflow-hidden border-4 ${photo.includeInTour ? 'border-brand-blue shadow-lg shadow-brand-blue/20' : 'border-transparent'}`}
                             draggable={photo.includeInTour}
                             onDragStart={(e) => handleDragStart(e, index)}
                             onDragOver={(e) => e.preventDefault()}
                             onDrop={(e) => handleDropOnItem(e, index)}
                             onDragEnd={() => setDraggedIndex(null)}
                             style={{ opacity: draggedIndex === index ? 0.5 : 1 }}
                        >
                            <img src={photo.previewUrl} alt={`preview ${index}`} className="w-full h-full object-cover"/>

                             {photo.includeInTour && tourIndex !== -1 && (
                                <div className="absolute top-1 left-1 w-8 h-8 bg-brand-blue text-white rounded-full flex items-center justify-center font-bold text-sm border-2 border-navy-light">{tourIndex + 1}</div>
                             )}

                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                                <div className="bg-black/70 p-2 rounded-md">
                                    <label htmlFor={`tour-${index}`} className="flex items-center gap-2 text-white text-xs cursor-pointer">
                                        <input type="checkbox" id={`tour-${index}`} checked={photo.includeInTour} onChange={() => toggleTourInclusion(index)} className="accent-brand-blue w-4 h-4" />
                                        Sanal Tura Ekle
                                    </label>
                                </div>
                            </div>
                            <button type="button" onClick={() => removePhoto(index)} className="absolute top-2 right-2 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700">&times;</button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ImagePreview;
