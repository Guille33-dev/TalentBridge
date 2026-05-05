import React, { useEffect, useState } from 'react';
import { Header } from '@/shared/components/layout/Header';
import { Footer } from '@/shared/components/layout/Footer';
import { JobCard } from '@/shared/components/cards/JobCard';
import { SearchFilters } from '@/features/jobs/components/SearchFilters';
import { fetchJobs } from '@/features/jobs/services/jobsApi';
import { deleteSavedJob, fetchMySavedJobs, saveJob } from '@/features/savedJobs/services/savedJobsApi';
import { Search, MapPin, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { getAuthToken } from '@/shared/services/apiClient';

const emptyFilters = { search: '', location: '', modality: '', area: '', company: '', companyName: '' };

function normalizeFilters(filters) {
  return {
    ...emptyFilters,
    ...(filters || {}),
  };
}

export function JobSearch({ onNavigate, initialFilters }) {
  const initialSearchState = normalizeFilters(initialFilters);
  const [searchQuery, setSearchQuery] = useState(initialSearchState.search);
  const [location, setLocation] = useState(initialSearchState.location);
  const [activeFilters, setActiveFilters] = useState(initialSearchState);
  const [showFilters, setShowFilters] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [savingJobId, setSavingJobId] = useState(null);

  useEffect(() => {
    const nextFilters = normalizeFilters(initialFilters);
    setSearchQuery(nextFilters.search);
    setLocation(nextFilters.location);
    setActiveFilters(nextFilters);
  }, [initialFilters?.search, initialFilters?.location, initialFilters?.modality, initialFilters?.area, initialFilters?.company, initialFilters?.companyName]);

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
          company: activeFilters.company,
          limit: 20,
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
  }, [activeFilters]);

  useEffect(() => {
    let ignore = false;

    async function loadSavedJobs() {
      if (!getAuthToken()) {
        if (!ignore) setSavedJobIds([]);
        return;
      }

      try {
        const savedJobs = await fetchMySavedJobs();
        if (!ignore) {
          setSavedJobIds(savedJobs.map(({ job }) => job.id));
        }
      } catch {
        if (!ignore) {
          setSavedJobIds([]);
        }
      }
    }

    const handleWindowFocus = () => {
      loadSavedJobs();
    };

    loadSavedJobs();
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      ignore = true;
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  const handleSearch = () => {
    setActiveFilters({
      ...activeFilters,
      search: searchQuery,
      location,
    });
  };

  const handleFilterChange = (key, value) => {
    setActiveFilters((current) => ({
      ...current,
      [key]: value,
      search: key === 'area' ? value : current.search,
    }));

    if (key === 'area') {
      setSearchQuery(value);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setLocation('');
    setActiveFilters(emptyFilters);
  };

  const handleToggleSave = async (job) => {
    if (!getAuthToken()) {
      window.sessionStorage.setItem('talentbridge.pendingJob', job.slug || job.id);
      onNavigate('login');
      return;
    }

    setSavingJobId(job.id);
    setError(null);

    try {
      if (savedJobIds.includes(job.id)) {
        await deleteSavedJob(job.slug || job.id);
        setSavedJobIds((current) => current.filter((savedJobId) => savedJobId !== job.id));
      } else {
        await saveJob(job.slug || job.id);
        setSavedJobIds((current) => [...current, job.id]);
      }
    } catch (requestError) {
      if (requestError.message.includes('already saved') || requestError.message.includes('ya esta guardada')) {
        setSavedJobIds((current) => (current.includes(job.id) ? current : [...current, job.id]));
      } else {
        setError(requestError.message);
      }
    } finally {
      setSavingJobId(null);
    }
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
                  placeholder="Area, carrera o palabra clave"
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
                    {isLoading ? 'Buscando prácticas...' : `${pagination?.total ?? jobs.length} prácticas encontradas`}
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base">
                    {activeFilters.companyName
                      ? `Mostrando practicas de ${activeFilters.companyName}`
                      : activeFilters.search || activeFilters.location || activeFilters.modality
                        ? 'Mostrando resultados filtrados'
                        : 'Mostrando todos los resultados'}
                  </p>
                </div>
                <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2 text-sm sm:text-base h-10 sm:h-auto">
                  <SlidersHorizontal className="w-4 h-4" />
                  {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
                </Button>
              </div>

              {showFilters && (
                <div className="lg:hidden mb-6">
                  <SearchFilters filters={activeFilters} onFilterChange={handleFilterChange} onClear={clearFilters} />
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">
                  {error}
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
                <div className="space-y-3 sm:space-y-4">
                  {jobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      isSaved={savedJobIds.includes(job.id)}
                      isSaveDisabled={savingJobId === job.id}
                      onToggleSave={handleToggleSave}
                      onViewDetails={(jobId) => onNavigate('job-detail', jobId)}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
                  <h2 className="text-lg mb-2">No hay prácticas disponibles</h2>
                  <p className="text-gray-600 text-sm">Prueba con otra búsqueda o vuelve más tarde.</p>
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
