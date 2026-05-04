import React, { useState } from 'react';
import { defaultPage, pageKeys } from '@/app/config/pageKeys';
import { getPageRegistry } from '@/app/router/pageRegistry';

function getInitialSharedJobId() {
  return new URLSearchParams(window.location.search).get('job');
}

function updateSharedJobUrl(jobId) {
  const url = new URL(window.location.href);

  if (jobId) {
    url.searchParams.set('job', jobId);
  } else {
    url.searchParams.delete('job');
  }

  window.history.replaceState(null, '', url.toString());
}

export default function App() {
  const initialSharedJobId = getInitialSharedJobId();
  const [currentPage, setCurrentPage] = useState(initialSharedJobId ? pageKeys.jobDetail : defaultPage);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(initialSharedJobId);
  const [jobSearchFilters, setJobSearchFilters] = useState(null);
  const [previousPage, setPreviousPage] = useState(pageKeys.jobs);

  const navigateTo = (page, id, options = {}) => {
    if (page === pageKeys.jobDetail) {
      setPreviousPage(currentPage);
      setSelectedJobId(id || null);
      updateSharedJobUrl(id || null);
    } else {
      updateSharedJobUrl(null);
    }

    if (page === pageKeys.jobs) {
      setJobSearchFilters(options.filters || null);
    }

    if (page === pageKeys.companyDetail) {
      setSelectedCompanyId(id || null);
    }

    setCurrentPage(page);
  };

  const pages = getPageRegistry({
    navigateTo,
    selectedCompanyId,
    selectedJobId,
    jobSearchFilters,
    previousPage,
    setCurrentPage,
    clearSharedJobUrl: () => updateSharedJobUrl(null),
  });

  return <div className="min-h-screen bg-gray-50">{pages[currentPage] ?? pages[defaultPage]}</div>;
}
