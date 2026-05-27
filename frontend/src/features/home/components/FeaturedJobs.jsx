import React, { useEffect, useState } from 'react';
import { JobCard } from '@/shared/components/cards/JobCard';
import { fetchJobs } from '@/features/jobs/services/jobsApi';
import { useSavedJobToggle } from '@/features/savedJobs/hooks/useSavedJobToggle';
import { ChevronRight } from 'lucide-react';

export function FeaturedJobs({ onNavigate }) {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { canSaveJobs, savedJobIds, savingJobId, savedJobsError, toggleSavedJob } = useSavedJobToggle({ onNavigate });

  useEffect(() => {
    let ignore = false;

    async function loadFeaturedJobs() {
      try {
        const result = await fetchJobs({ featured: true, limit: 6 });
        if (!ignore) {
          setJobs(result.jobs);
        }
      } catch {
        if (!ignore) {
          setJobs([]);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadFeaturedJobs();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <section className="tb-home-section tb-home-section--soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-12 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-3">Practicas destacadas</h2>
            <p className="text-gray-600 text-base sm:text-lg">Ultimas oportunidades de las mejores empresas</p>
          </div>
          <button onClick={() => onNavigate('jobs')} className="text-purple-600 hover:text-purple-700 flex items-center gap-1 group text-sm sm:text-base">
            Ver todas las prácticas
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-2/3 mb-4" />
                <div className="h-4 bg-gray-100 rounded w-1/2 mb-6" />
                <div className="h-20 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : jobs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {canSaveJobs && savedJobsError && <div className="lg:col-span-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm" role="alert">{savedJobsError}</div>}
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
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-600">No hay prácticas destacadas disponibles.</div>
        )}
      </div>
    </section>
  );
}
