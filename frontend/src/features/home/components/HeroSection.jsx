import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

const popularSearches = [
    { label: 'Producto', search: 'Producto' },
    { label: 'Desarrollo', search: 'Desarrollo' },
    { label: 'Diseño', search: 'Diseno' },
    { label: 'DevOps', search: 'DevOps' },
    { label: 'Cloud', search: 'Cloud' },
];

export function HeroSection({ onNavigate }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [location, setLocation] = useState('');
    const handleSearch = () => {
        onNavigate('jobs', undefined, {
            filters: {
                search: searchQuery.trim(),
                location: location.trim(),
            },
        });
    };
    const handlePopularSearch = (term) => {
        onNavigate('jobs', undefined, {
            filters: {
                search: term.search,
                location: location.trim(),
            },
        });
    };
    return (<section className="bg-gradient-to-br from-purple-600 via-indigo-700 to-blue-600 text-white py-12 sm:py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6">
            Encuentra tu práctica ideal
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-purple-100 mb-8 sm:mb-12 px-4">
            Conectamos estudiantes universitarios con empresas que buscan talento joven. Inicia tu carrera profesional.
          </p>

          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-2xl p-2 sm:p-3 flex flex-col gap-2 sm:gap-3">
            <div className="flex-1 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-gray-50 rounded-lg">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0"/>
              <Input type="text" placeholder="Área de práctica o carrera" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="border-0 bg-transparent focus-visible:ring-0 text-gray-900 placeholder:text-gray-500 text-sm sm:text-base"/>
            </div>
            <div className="flex-1 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-gray-50 rounded-lg">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0"/>
              <Input type="text" placeholder="Ciudad o remoto" value={location} onChange={(e) => setLocation(e.target.value)} className="border-0 bg-transparent focus-visible:ring-0 text-gray-900 placeholder:text-gray-500 text-sm sm:text-base"/>
            </div>
            <Button onClick={handleSearch} className="bg-purple-600 hover:bg-purple-700 text-white px-6 sm:px-8 h-11 sm:h-12 w-full text-sm sm:text-base">
              Buscar Prácticas
            </Button>
          </div>

          {/* Popular Searches */}
          <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-2 sm:gap-3 px-4">
            <span className="text-purple-100 text-xs sm:text-sm">Popular:</span>
            {popularSearches.map((term) => (<button key={term.search} onClick={() => handlePopularSearch(term)} className="px-3 sm:px-4 py-1 sm:py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-xs sm:text-sm transition-colors backdrop-blur-sm">
                {term.label}
              </button>))}
          </div>
        </div>
      </div>
    </section>);
}
