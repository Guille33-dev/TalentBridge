import { useCallback, useEffect, useState } from 'react';
import { getAuthToken } from '@/shared/services/apiClient';
import { deleteSavedJob, fetchMySavedJobs, saveJob } from '@/features/savedJobs/services/savedJobsApi';

export function useSavedJobToggle({ onNavigate } = {}) {
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [savingJobId, setSavingJobId] = useState(null);
  const [savedJobsError, setSavedJobsError] = useState(null);

  const loadSavedJobIds = useCallback(async () => {
    if (!getAuthToken()) {
      setSavedJobIds([]);
      return;
    }

    try {
      const savedJobs = await fetchMySavedJobs();
      setSavedJobIds(savedJobs.map(({ job }) => job.id));
    } catch {
      setSavedJobIds([]);
    }
  }, []);

  useEffect(() => {
    loadSavedJobIds();
    window.addEventListener('focus', loadSavedJobIds);

    return () => {
      window.removeEventListener('focus', loadSavedJobIds);
    };
  }, [loadSavedJobIds]);

  const toggleSavedJob = useCallback(async (job) => {
    if (!getAuthToken()) {
      window.sessionStorage.setItem('talentbridge.pendingJob', job.slug || job.id);
      onNavigate?.('login');
      return;
    }

    setSavingJobId(job.id);
    setSavedJobsError(null);

    try {
      if (savedJobIds.includes(job.id)) {
        await deleteSavedJob(job.id);
        setSavedJobIds((current) => current.filter((savedJobId) => savedJobId !== job.id));
      } else {
        await saveJob(job.slug || job.id);
        setSavedJobIds((current) => (current.includes(job.id) ? current : [...current, job.id]));
      }
    } catch (requestError) {
      if (requestError.message.includes('Saved job not found')) {
        setSavedJobIds((current) => current.filter((savedJobId) => savedJobId !== job.id));
      } else if (requestError.message.includes('already saved') || requestError.message.includes('ya esta guardada')) {
        setSavedJobIds((current) => (current.includes(job.id) ? current : [...current, job.id]));
      } else {
        setSavedJobsError(requestError.message);
      }
    } finally {
      setSavingJobId(null);
    }
  }, [onNavigate, savedJobIds]);

  return {
    savedJobIds,
    savingJobId,
    savedJobsError,
    toggleSavedJob,
  };
}
