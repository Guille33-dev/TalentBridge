import React, { useEffect, useMemo, useState } from 'react';
import { Header } from '@/shared/components/layout/Header';
import { Footer } from '@/shared/components/layout/Footer';
import { CompanyCard } from '@/shared/components/cards/CompanyCard';
import { fetchCompanies } from '@/features/companies/services/companiesApi';
import { Search } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';

const categories = ['Todas', 'Tecnologia', 'Diseno', 'Marketing', 'Finanzas', 'Comunicacion', 'Recursos Humanos'];

export function CompanyList({ onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [companies, setCompanies] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiSearch = useMemo(() => {
    if (searchQuery.trim()) return searchQuery.trim();
    if (selectedCategory !== 'Todas') return selectedCategory;
    return '';
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    let ignore = false;

    async function loadCompanies() {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchCompanies({
          search: apiSearch,
          limit: 20,
        });

        if (!ignore) {
          setCompanies(result.companies);
          setPagination(result.pagination);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message);
          setCompanies([]);
          setPagination(null);
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
  }, [apiSearch]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header onNavigate={onNavigate} currentPage="companies" />

      <main className="flex-1 bg-gray-50">
        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4">Explora empresas</h1>
            <p className="text-base sm:text-lg md:text-xl text-purple-100 mb-6 sm:mb-8">
              Descubre empresas que ofrecen prácticas y valoran el talento joven
            </p>

            <div className="max-w-2xl bg-white rounded-xl p-2 sm:p-3 flex items-center gap-2 sm:gap-3">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 ml-2 flex-shrink-0" />
              <Input
                type="text"
                placeholder="Buscar empresas por nombre o industria..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="border-0 bg-transparent focus-visible:ring-0 text-gray-900 text-sm sm:text-base"
              />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="mb-6 sm:mb-8 flex flex-wrap gap-2 sm:gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-colors text-sm sm:text-base ${
                  selectedCategory === category ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="mb-4 sm:mb-6">
            <p className="text-gray-600 text-sm sm:text-base">
              {isLoading ? 'Cargando empresas...' : `Mostrando ${pagination?.total ?? companies.length} empresas`}
            </p>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">{error}</div>}

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg mb-4" />
                  <div className="h-5 bg-gray-200 rounded w-2/3 mb-3" />
                  <div className="h-16 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          ) : companies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {companies.map((company) => (
                <CompanyCard key={company.id} company={company} onNavigate={onNavigate} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
              <h2 className="text-lg mb-2">No hay empresas disponibles</h2>
              <p className="text-gray-600 text-sm">Prueba con otra búsqueda o vuelve más tarde.</p>
            </div>
          )}
        </div>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
