import React from 'react';
import { Tour } from '../types';
import StatCard from './StatCard';
import TourCard from './TourCard';

interface DashboardProps {
    tours: Tour[];
    onOpenModal: () => void;
    onEdit: (tourId: string) => void;
    onDelete: (tourId: string) => void;
    onView: (tourId: string) => void;
    isLoading: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ tours, onOpenModal, onEdit, onDelete, onView, isLoading }) => {
    const totalViews = tours.reduce((sum, t) => sum + (t.views || 0), 0);
    const totalShares = tours.reduce((sum, t) => sum + (t.shares || 0), 0);
    const totalDuration = tours.reduce((sum, t) => sum + (t.duration || 0), 0);
    const avgDurationSec = tours.length > 0 ? totalDuration / tours.length : 0;
    const avgDurationMin = Math.floor(avgDurationSec / 60);
    const avgDurationRemainSec = Math.floor(avgDurationSec % 60);
    
    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard icon="🏠" value={tours.length.toString()} label="Toplam Sanal Tur" />
                <StatCard icon="👁️" value={totalViews.toLocaleString('tr-TR')} label="Toplam Görüntülenme" />
                <StatCard icon="📱" value={totalShares.toLocaleString('tr-TR')} label="Toplam Paylaşım" />
                <StatCard icon="⏱️" value={`${avgDurationMin}:${avgDurationRemainSec.toString().padStart(2, '0')}`} label="Ort. İzleme Süresi" />
            </div>

            <div className="text-center mb-12">
                <button 
                    onClick={onOpenModal}
                    className="inline-flex items-center gap-4 px-12 py-6 bg-gradient-to-r from-gold to-gold-dark text-navy rounded-2xl font-bold text-xl shadow-lg shadow-gold/20 hover:scale-105 hover:shadow-xl hover:shadow-gold/40 transition-all duration-300 transform"
                >
                    <span className="text-3xl">+</span>
                    Yeni Sanal Tur Oluştur
                </button>
            </div>

            <section>
                <div className="flex justify-between items-center mb-8">
                    <h2 className="font-serif text-4xl font-bold text-gold">Sanal Turlarım</h2>
                </div>

                {isLoading ? (
                     <div className="text-center py-16 text-light-gray">Yükleniyor...</div>
                ) : tours.length === 0 ? (
                    <div className="text-center py-16 bg-white/5 rounded-2xl border border-gold/20">
                         <div className="text-6xl mb-4">🏠</div>
                         <h3 className="text-2xl font-bold text-gold mb-2">Henüz Sanal Tur Yok</h3>
                         <p className="text-light-gray mb-6">İlk 360° sanal turunuzu oluşturun!</p>
                         <button 
                            onClick={onOpenModal}
                            className="bg-gradient-to-r from-gold to-gold-dark text-navy font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform duration-300"
                         >
                            + Yeni Sanal Tur Oluştur
                         </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {tours.map(tour => (
                            <TourCard key={tour.id} tour={tour} onEdit={onEdit} onDelete={onDelete} onView={onView} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Dashboard;
