import { useCallback, useEffect, useState } from 'react';
import { getAuthToken } from '@/shared/services/apiClient';
import { deleteSavedJob, fetchMySavedJobs, saveJob } from '@/features/savedJobs/services/savedJobsApi';
import { useAuth } from '@/features/auth/context/AuthContext';

export function useSavedJobToggle({ onNavigate } = {}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [savingJobId, setSavingJobId] = useState(null);
  const [savedJobsError, setSavedJobsError] = useState(null);
  const hasAuthToken = Boolean(getAuthToken());
  const canSaveJobs = isLoading ? !hasAuthToken : !isAuthenticated || user?.role === 'STUDENT';

  const loadSavedJobIds = useCallback(async () => {
    if (!getAuthToken() || user?.role !== 'STUDENT') {
      setSavedJobIds([]);
      return;
    }

    try {
      const savedJobs = await fetchMySavedJobs();
      setSavedJobIds(savedJobs.map(({ job }) => job.id));
    } catch {
      setSavedJobIds([]);
    }
  }, [user?.role]);

  useEffect(() => {
    loadSavedJobIds();
    window.addEventListener('focus', loadSavedJobIds);

    return () => {
      window.removeEventListener('focus', loadSavedJobIds);
    };
  }, [loadSavedJobIds]);

  const toggleSavedJob = useCallback(async (job) => {
    if (isAuthenticated && user?.role !== 'STUDENT') {
      return;
    }

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
  }, [isAuthenticated, onNavigate, savedJobIds, user?.role]);

  return {
    canSaveJobs,
    savedJobIds,
    savingJobId,
    savedJobsError,
    toggleSavedJob,
  };
}
