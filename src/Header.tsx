
import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="bg-white/5 backdrop-blur-lg border-b border-gold/20 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex-shrink-0">
                        <span className="font-serif text-2xl font-black text-gold uppercase tracking-wider">
                            360° SANAL TUR
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-navy font-bold text-lg">
                            AE
                        </div>
                        <button className="px-5 py-2 bg-white/10 border border-gold/30 rounded-lg hover:bg-gold/20 transition-all duration-300">
                            Çıkış
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
