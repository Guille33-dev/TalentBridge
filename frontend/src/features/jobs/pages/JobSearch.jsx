import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/shared/components/layout/Header';
import { Footer } from '@/shared/components/layout/Footer';
import { JobCard } from '@/shared/components/cards/JobCard';
import { SearchFilters } from '@/features/jobs/components/SearchFilters';
import { fetchJobs } from '@/features/jobs/services/jobsApi';
import { useSavedJobToggle } from '@/features/savedJobs/hooks/useSavedJobToggle';
import { Search, MapPin, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';

const PAGE_SIZE = 10;
const emptyFilters = { search: '', location: '', modality: '', category: '', company: '', companyName: '' };

function normalizePage(value) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function readSearchState(searchParams) {
  return {
    filters: {
      ...emptyFilters,
      search: searchParams.get('search') || '',
      location: searchParams.get('location') || '',
      modality: searchParams.get('modality') || '',
      category: searchParams.get('category') || searchParams.get('area') || '',
      company: searchParams.get('company') || '',
      companyName: searchParams.get('companyName') || '',
    },
    page: normalizePage(searchParams.get('page')),
  };
}

function buildSearchParams(filters, page) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

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
    <nav className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-between gap-3" aria-label="Paginacion de practicas">
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

export function JobSearch({ onNavigate }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamsKey = searchParams.toString();
  const initialState = readSearchState(searchParams);
  const [searchQuery, setSearchQuery] = useState(initialState.filters.search);
  const [location, setLocation] = useState(initialState.filters.location);
  const [activeFilters, setActiveFilters] = useState(initialState.filters);
  const [currentPage, setCurrentPage] = useState(initialState.page);
  const [showFilters, setShowFilters] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { canSaveJobs, savedJobIds, savingJobId, savedJobsError, toggleSavedJob } = useSavedJobToggle({ onNavigate });

  useEffect(() => {
    const nextState = readSearchState(searchParams);
    setSearchQuery(nextState.filters.search);
    setLocation(nextState.filters.location);
    setActiveFilters(nextState.filters);
    setCurrentPage(nextState.page);
  }, [searchParamsKey]);

  useEffect(() => {
    let ignore = false;

    async function loadJobs() {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchJobs({
          search: activeFilters.search,
          location: activeFilters.location,
          modality: activeFilters.modality,
          category: activeFilters.category,
          company: activeFilters.company,
          page: currentPage,
          limit: PAGE_SIZE,
        });

        if (!ignore) {
          setJobs(result.jobs);
          setPagination(result.pagination);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message);
          setJobs([]);
          setPagination(null);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadJobs();

    return () => {
      ignore = true;
    };
  }, [activeFilters, currentPage]);

  const updateUrlFilters = (filters, page = 1) => {
    setSearchParams(buildSearchParams(filters, page));
  };

  const handleSearch = () => {
    updateUrlFilters(
      {
        ...activeFilters,
        search: searchQuery.trim(),
        location: location.trim(),
      },
      1,
    );
  };

  const handleFilterChange = (key, value) => {
    const nextFilters = {
      ...activeFilters,
      [key]: value,
    };

    updateUrlFilters(nextFilters, 1);
  };

  const clearFilters = () => {
    updateUrlFilters(emptyFilters, 1);
  };

  const handlePageChange = (page) => {
    updateUrlFilters(activeFilters, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    handleSearch();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onNavigate={onNavigate} currentPage="jobs" />

      <main className="flex-1 bg-gray-50">
        <div className="bg-white border-b border-gray-200 py-4 sm:py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="flex-1 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                <Input
                  type="text"
                  placeholder="Area, estudios o palabra clave"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="border-0 bg-transparent focus-visible:ring-0 text-sm sm:text-base"
                />
              </div>
              <div className="flex-1 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                <Input
                  type="text"
                  placeholder="Ciudad o remoto"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  className="border-0 bg-transparent focus-visible:ring-0 text-sm sm:text-base"
                />
              </div>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-6 sm:px-8 h-11 sm:h-12 text-sm sm:text-base">
                Buscar
              </Button>
            </form>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex gap-6 sm:gap-8">
            {showFilters && (
              <aside className="hidden lg:block w-72 flex-shrink-0">
                <SearchFilters filters={activeFilters} onFilterChange={handleFilterChange} onClear={clearFilters} />
              </aside>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl mb-1">
                    {isLoading ? 'Buscando practicas...' : `${pagination?.total ?? jobs.length} practicas encontradas`}
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base">
                    {activeFilters.companyName
                      ? `Mostrando practicas de ${activeFilters.companyName}`
                      : activeFilters.search || activeFilters.location || activeFilters.modality || activeFilters.category
                        ? 'Mostrando resultados filtrados'
                        : 'Mostrando todos los resultados'}
                  </p>
                </div>
                <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2 text-sm sm:text-base h-10 sm:h-auto">
                  <SlidersHorizontal className="w-4 h-4" />
                  {showFilters ? 'Ocultar' : 'Mostrar'} filtros
                </Button>
              </div>

              {showFilters && (
                <div className="lg:hidden mb-6">
                  <SearchFilters filters={activeFilters} onFilterChange={handleFilterChange} onClear={clearFilters} />
                </div>
              )}

              {(error || (canSaveJobs && savedJobsError)) && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm" role="alert">
                  {error || savedJobsError}
                </div>
              )}

              {isLoading ? (
                <div className="space-y-3 sm:space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
                      <div className="h-5 bg-gray-200 rounded w-2/3 mb-4" />
                      <div className="h-4 bg-gray-100 rounded w-1/2 mb-6" />
                      <div className="h-20 bg-gray-100 rounded" />
                    </div>
                  ))}
                </div>
              ) : jobs.length > 0 ? (
                <>
                  <div className="space-y-3 sm:space-y-4">
                    {jobs.map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        isSaved={savedJobIds.includes(job.id)}
                        isSaveDisabled={savingJobId === job.id}
                        onToggleSave={canSaveJobs ? toggleSavedJob : undefined}
                        showSaveButton={canSaveJobs}
                        onViewDetails={(jobId) => onNavigate('job-detail', jobId)}
                      />
                    ))}
                  </div>
                  <PaginationControls pagination={pagination} onPageChange={handlePageChange} />
                </>
              ) : (
                <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
                  <h2 className="text-lg mb-2">No hay practicas disponibles</h2>
                  <p className="text-gray-600 text-sm">Prueba con otra busqueda o vuelve mas tarde.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
