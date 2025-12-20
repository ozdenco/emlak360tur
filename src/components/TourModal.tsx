import React, { useState, useEffect, useCallback } from 'react';
import { TourWithPhotos, Photo, Property } from '../types';
import { db } from '../services/db';
import ImagePreview from './ImagePreview';

interface TourModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    existingTour: TourWithPhotos | null;
    showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const initialFormData: Property = {
    propertyId: '', title: '', location: '', rooms: '', size: 0,
    floor: 0, price: 0, features: [], description: '', ownerPhone: ''
};

const TourModal: React.FC<TourModalProps> = ({ isOpen, onClose, onSave, existingTour, showToast }) => {
    const [formData, setFormData] = useState<Property>(initialFormData);
    const [featuresStr, setFeaturesStr] = useState('');
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (existingTour) {
            setFormData(existingTour.property);
            setFeaturesStr(existingTour.property.features.join(', '));
            // Cleanup old preview URLs before setting new ones
            photos.forEach(p => URL.revokeObjectURL(p.previewUrl));
            setPhotos(existingTour.photos);
        } else {
            setFormData(initialFormData);
            setFeaturesStr('');
            photos.forEach(p => URL.revokeObjectURL(p.previewUrl));
            setPhotos([]);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [existingTour]);
    
    useEffect(() => {
        // Cleanup object URLs on unmount
        return () => {
            photos.forEach(p => URL.revokeObjectURL(p.previewUrl));
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: (e.target.type === 'number' && value) ? parseFloat(value) : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const tourPhotos = photos.filter(p => p.includeInTour);
        if (tourPhotos.length === 0) {
            showToast('En az 1 fotoğraf sanal tura eklemelisiniz', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const tourData = {
                ...formData,
                features: featuresStr.split(',').map(f => f.trim()).filter(Boolean),
            };

            const tourToSave = {
                title: tourData.title,
                location: tourData.location,
                views: existingTour?.views || 0,
                shares: existingTour?.shares || 0,
                duration: existingTour?.duration || 0,
                status: 'active' as 'active' | 'draft',
                property: tourData,
            };
            
            await db.saveTour(tourToSave, photos, existingTour?.id);

            showToast(existingTour ? 'Sanal tur güncellendi!' : 'Sanal tur oluşturuldu!', 'success');
            onSave();
        } catch (error) {
            console.error('Error saving tour:', error);
            showToast(`Bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-navy/90 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-navy-light border-2 border-gold/50 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="font-serif text-4xl text-gold">{existingTour ? 'Sanal Turu Düzenle' : 'Yeni Sanal Tur'}</h2>
                            <p className="text-light-gray mt-1">İlan bilgilerini girin ve fotoğraflarınızı yükleyin.</p>
                        </div>
                        <button onClick={onClose} className="text-2xl text-white/50 hover:text-white transition-colors">&times;</button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="form-label">İlan ID</label>
                                <input type="text" name="propertyId" value={formData.propertyId} onChange={handleChange} className="form-input" placeholder="Örn: ILAN_12345" required />
                            </div>
                            <div>
                                <label className="form-label">İlan Başlığı</label>
                                <input type="text" name="title" value={formData.title} onChange={handleChange} className="form-input" placeholder="Örn: Deniz Manzaralı 3+1 Daire" required />
                            </div>
                            <div>
                                <label className="form-label">Lokasyon</label>
                                <input type="text" name="location" value={formData.location} onChange={handleChange} className="form-input" placeholder="Örn: Bostanlı, İzmir" required />
                            </div>
                            <div>
                                <label className="form-label">Oda Sayısı</label>
                                <input type="text" name="rooms" value={formData.rooms} onChange={handleChange} className="form-input" placeholder="Örn: 3+1" required />
                            </div>
                            <div>
                                <label className="form-label">Metrekare</label>
                                <input type="number" name="size" value={formData.size} onChange={handleChange} className="form-input" placeholder="120" required />
                            </div>
                            <div>
                                <label className="form-label">Kat</label>
                                <input type="number" name="floor" value={formData.floor} onChange={handleChange} className="form-input" placeholder="5" required />
                            </div>
                            <div>
                                <label className="form-label">Fiyat (TL)</label>
                                <input type="number" name="price" value={formData.price} onChange={handleChange} className="form-input" placeholder="8500000" required />
                            </div>
                             <div>
                                <label className="form-label">Telefon Numarası</label>
                                <input type="tel" name="ownerPhone" value={formData.ownerPhone} onChange={handleChange} className="form-input" placeholder="+905551234567" required/>
                            </div>
                        </div>
                        <div>
                            <label className="form-label">Özellikler (virgülle ayırın)</label>
                            <input type="text" value={featuresStr} onChange={(e) => setFeaturesStr(e.target.value)} className="form-input" placeholder="Örn: Denize yakın, Geniş balkon" />
                        </div>
                        <div>
                            <label className="form-label">Açıklama</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} className="form-input min-h-[100px]" placeholder="Daireniz hakkında detaylı bilgi..."></textarea>
                        </div>
                        
                        <ImagePreview photos={photos} setPhotos={setPhotos} showToast={showToast} />
                        
                        <button type="submit" disabled={isSubmitting} className="w-full mt-4 py-4 bg-gradient-to-r from-gold to-gold-dark text-navy rounded-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform duration-300">
                            {isSubmitting ? 'Kaydediliyor...' : (existingTour ? '💾 Değişiklikleri Kaydet' : '🚀 Sanal Turu Oluştur')}
                        </button>
                    </form>
                </div>
            </div>
             <style>{`
                .form-label { display: block; margin-bottom: 8px; color: #ccc; font-weight: 500; font-size: 14px; }
                .form-input { width: 100%; padding: 12px 16px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(212, 175, 55, 0.3); color: white; border-radius: 8px; font-size: 16px; transition: all 0.3s; }
                .form-input:focus { outline: none; border-color: #D4AF37; background: rgba(255, 255, 255, 0.08); }
             `}</style>
        </div>
    );
};

export default TourModal;
