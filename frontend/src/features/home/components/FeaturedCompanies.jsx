import React, { useEffect, useState } from 'react';
import { CompanyCard } from '@/shared/components/cards/CompanyCard';
import { fetchCompanies } from '@/features/companies/services/companiesApi';
import { ChevronRight } from 'lucide-react';

export function FeaturedCompanies({ onNavigate }) {
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function loadCompanies() {
      try {
        const result = await fetchCompanies({ limit: 4 });
        if (!ignore) {
          setCompanies(result.companies);
        }
      } catch {
        if (!ignore) {
          setCompanies([]);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadCompanies();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-12 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-3">Empresas destacadas</h2>
            <p className="text-gray-600 text-base sm:text-lg">Empresas que ofrecen prácticas en TalentBridge</p>
          </div>
          <button onClick={() => onNavigate('companies')} className="text-purple-600 hover:text-purple-700 flex items-center gap-1 group text-sm sm:text-base">
            Ver todas las empresas
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
                <div className="w-16 h-16 bg-gray-200 rounded-lg mb-4" />
                <div className="h-5 bg-gray-200 rounded w-2/3 mb-3" />
                <div className="h-16 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : companies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {companies.map((company) => (
              <CompanyCard key={company.id} company={company} onNavigate={onNavigate} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-600">No hay empresas disponibles todavia.</div>
        )}
      </div>
    </section>
  );
}
