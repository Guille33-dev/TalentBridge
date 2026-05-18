import React, { useEffect, useMemo, useState } from 'react';
import { JobCard } from '@/shared/components/cards/JobCard';
import { Search } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { deleteSavedJob, fetchMySavedJobs } from '@/features/savedJobs/services/savedJobsApi';

export function SavedJobs({ onNavigate }) {
    const [savedJobs, setSavedJobs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [savingJobId, setSavingJobId] = useState(null);

    useEffect(() => {
        let ignore = false;

        async function loadSavedJobs() {
            setIsLoading(true);
            setError(null);

            try {
                const result = await fetchMySavedJobs();
                if (!ignore) setSavedJobs(result);
            } catch (requestError) {
                if (!ignore) setError(requestError.message);
            } finally {
                if (!ignore) setIsLoading(false);
            }
        }

        loadSavedJobs();

        return () => {
            ignore = true;
        };
    }, []);

    const filteredJobs = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return savedJobs;

        return savedJobs.filter(({ job }) =>
            [job.title, job.company, job.location, ...(job.tags || [])].some((value) => value?.toLowerCase().includes(query)),
        );
    }, [savedJobs, searchQuery]);

    const handleToggleSave = async (job) => {
        setSavingJobId(job.id);
        setError(null);

        try {
            await deleteSavedJob(job.id);
            setSavedJobs((current) => current.filter((savedJob) => savedJob.job.id !== job.id));
        } catch (requestError) {
            if (requestError.message.includes('Saved job not found')) {
                setSavedJobs((current) => current.filter((savedJob) => savedJob.job.id !== job.id));
            } else {
                setError(requestError.message);
            }
        } finally {
            setSavingJobId(null);
        }
    };

    return (<div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Prácticas Guardadas</h1>
          <p className="text-gray-600">{savedJobs.length} prácticas guardadas</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400"/>
          <Input type="text" placeholder="Buscar en prácticas guardadas..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="border-0 bg-transparent focus-visible:ring-0"/>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">{error}</div>}

      {/* Jobs */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6">Cargando prácticas guardadas...</div>
      ) : filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredJobs.map(({ id, job }) => (
            <JobCard
              key={id}
              job={job}
              isSaved
              isSaveDisabled={savingJobId === job.id}
              onToggleSave={handleToggleSave}
              onViewDetails={(jobId) => onNavigate('job-detail', jobId)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-gray-600">No hay prácticas guardadas.</div>
      )}
    </div>);
}
