import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/shared/components/layout/Header';
import { Footer } from '@/shared/components/layout/Footer';
import { CompanyCard } from '@/shared/components/cards/CompanyCard';
import { fetchCompanies } from '@/features/companies/services/companiesApi';
import { Search } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';

const PAGE_SIZE = 9;
const categories = [
  { label: 'Todas', value: '' },
  { label: 'Tecnología', value: 'Tecnología' },
  { label: 'Diseño', value: 'Diseño' },
  { label: 'Marketing', value: 'Marketing' },
  { label: 'Finanzas', value: 'Finanzas' },
  { label: 'Comunicación', value: 'Comunicación' },
  { label: 'Recursos Humanos', value: 'Recursos Humanos' },
];

function normalizePage(value) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function readCompanySearchState(searchParams) {
  return {
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    page: normalizePage(searchParams.get('page')),
  };
}

function buildCompanySearchParams({ search, category }, page) {
  const params = new URLSearchParams();

  if (search) params.set('search', search);
  if (category) params.set('category', category);
  if (page > 1) params.set('page', String(page));

  return params;
}

function getVisiblePages(page, totalPages) {
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  const adjustedStart = Math.max(1, end - 4);

  return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index);
}

function PaginationControls({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const currentPage = pagination.page;
  const pages = getVisiblePages(currentPage, pagination.totalPages);

  return (
    <nav className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3" aria-label="Paginacion de empresas">
      <p className="text-sm text-gray-600">
        Pagina {currentPage} de {pagination.totalPages}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}>
          Anterior
        </Button>
        {pages.map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPageChange(page)}
            className={page === currentPage ? 'bg-purple-600 hover:bg-purple-700 text-white' : ''}
          >
            {page}
          </Button>
        ))}
        <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= pagination.totalPages}>
          Siguiente
        </Button>
      </div>
    </nav>
  );
}

export function CompanyList({ onNavigate }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamsKey = searchParams.toString();
  const initialState = readCompanySearchState(searchParams);
  const [searchQuery, setSearchQuery] = useState(initialState.search);
  const [selectedCategory, setSelectedCategory] = useState(initialState.category);
  const [currentPage, setCurrentPage] = useState(initialState.page);
  const [companies, setCompanies] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const nextState = readCompanySearchState(searchParams);
    setSearchQuery(nextState.search);
    setSelectedCategory(nextState.category);
    setCurrentPage(nextState.page);
  }, [searchParamsKey]);

  useEffect(() => {
    let ignore = false;

    async function loadCompanies() {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchCompanies({
          search: searchQuery.trim(),
          category: selectedCategory,
          page: currentPage,
          limit: PAGE_SIZE,
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
  }, [searchQuery, selectedCategory, currentPage]);

  const updateUrlFilters = (nextSearch, nextCategory, page = 1) => {
    setSearchParams(buildCompanySearchParams({ search: nextSearch.trim(), category: nextCategory }, page));
  };

  const handleSearchQueryChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    updateUrlFilters(searchQuery, selectedCategory, 1);
  };

  const handleCategoryChange = (category) => {
    updateUrlFilters(searchQuery, category, 1);
  };

  const handlePageChange = (page) => {
    updateUrlFilters(searchQuery, selectedCategory, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onNavigate={onNavigate} currentPage="companies" />

      <main className="flex-1 bg-gray-50">
        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4">Explora empresas</h1>
            <p className="text-base sm:text-lg md:text-xl text-purple-100 mb-6 sm:mb-8">
              Descubre empresas que ofrecen practicas y valoran el talento joven
            </p>

            <form onSubmit={handleSubmit} className="max-w-2xl bg-white rounded-xl p-2 sm:p-3 flex items-center gap-2 sm:gap-3">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 ml-2 flex-shrink-0" />
              <Input
                type="text"
                placeholder="Buscar empresas por nombre..."
                value={searchQuery}
                onChange={handleSearchQueryChange}
                className="border-0 bg-transparent focus-visible:ring-0 text-gray-900 text-sm sm:text-base"
              />
              <Button type="submit" className="hidden sm:inline-flex bg-purple-600 hover:bg-purple-700 text-white">
                Buscar
              </Button>
            </form>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="mb-6 sm:mb-8 flex flex-wrap gap-2 sm:gap-3">
            {categories.map((category) => (
              <button
                key={category.label}
                onClick={() => handleCategoryChange(category.value)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-colors text-sm sm:text-base ${
                  selectedCategory === category.value ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          <div className="mb-4 sm:mb-6">
            <p className="text-gray-600 text-sm sm:text-base">
              {isLoading ? 'Cargando empresas...' : `Mostrando ${pagination?.total ?? companies.length} empresas`}
            </p>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm" role="alert">{error}</div>}

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
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {companies.map((company) => (
                  <CompanyCard key={company.id} company={company} onNavigate={onNavigate} />
                ))}
              </div>
              <PaginationControls pagination={pagination} onPageChange={handlePageChange} />
            </>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
              <h2 className="text-lg mb-2">No hay empresas disponibles</h2>
              <p className="text-gray-600 text-sm">Prueba con otra busqueda o vuelve mas tarde.</p>
            </div>
          )}
        </div>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
