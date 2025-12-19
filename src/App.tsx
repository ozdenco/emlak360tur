
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TourModal from './components/TourModal';
import { Tour, TourWithPhotos } from './types';
import { db } from './services/db';
import Toast from './components/Toast';
import TourViewer from './components/TourViewer';

const App: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tours, setTours] = useState<Tour[]>([]);
    const [editingTour, setEditingTour] = useState<TourWithPhotos | null>(null);
    const [viewingTour, setViewingTour] = useState<TourWithPhotos | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchTours = useCallback(async () => {
        setIsLoading(true);
        try {
            const fetchedTours = await db.getTours();
            setTours(fetchedTours);
        } catch (error) {
            console.error("Turlar yüklenirken hata oluştu:", error);
            showToast("Turlar yüklenirken bir hata oluştu.", 'error');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTours();
    }, [fetchTours]);

    const handleOpenModal = () => {
        setEditingTour(null);
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTour(null);
    };

    const handleSaveTour = async () => {
        await fetchTours();
        handleCloseModal();
    };

    const handleEditTour = async (tourId: string) => {
        try {
            const tourWithPhotos = await db.getTourWithPhotos(tourId);
            if (tourWithPhotos) {
                setEditingTour(tourWithPhotos);
                setIsModalOpen(true);
            } else {
                showToast("Düzenlenecek tur bulunamadı.", 'error');
            }
        } catch (error) {
            console.error("Tur düzenleme için yüklenirken hata oluştu:", error);
            showToast("Tur yüklenirken bir hata oluştu.", 'error');
        }
    };
    
    const handleDeleteTour = async (tourId: string) => {
        if (window.confirm('Bu sanal turu silmek istediğinizden emin misiniz?')) {
            try {
                await db.deleteTour(tourId);
                showToast("Sanal tur başarıyla silindi.", 'success');
                await fetchTours();
            } catch (error) {
                console.error("Tur silinirken hata oluştu:", error);
                showToast("Tur silinirken bir hata oluştu.", 'error');
            }
        }
    };
    
    const handleViewTour = async (tourId: string) => {
        try {
            const tourWithPhotos = await db.getTourWithPhotos(tourId);
            if (tourWithPhotos && tourWithPhotos.photos.filter(p => p.includeInTour).length > 0) {
                setViewingTour(tourWithPhotos);
            } else if (tourWithPhotos) {
                showToast("Bu turda görüntülenecek fotoğraf bulunmuyor.", 'info');
            } else {
                showToast("Görüntülenecek tur bulunamadı.", 'error');
            }
        } catch (error) {
            console.error("Tur görüntüleme için yüklenirken hata oluştu:", error);
            showToast("Tur yüklenirken bir hata oluştu.", 'error');
        }
    };

    const handleCloseViewer = () => {
        setViewingTour(null);
        fetchTours();
    };

    return (
        <div className="bg-gradient-to-br from-navy to-navy-light min-h-screen font-sans">
            <Header />
            <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <Dashboard 
                    tours={tours} 
                    onOpenModal={handleOpenModal} 
                    onEdit={handleEditTour}
                    onDelete={handleDeleteTour}
                    onView={handleViewTour}
                    isLoading={isLoading}
                />
            </main>
            {isModalOpen && (
                <TourModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSaveTour}
                    existingTour={editingTour}
                    showToast={showToast}
                />
            )}
            {viewingTour && (
                <TourViewer tour={viewingTour} onClose={handleCloseViewer} />
            )}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default App;
